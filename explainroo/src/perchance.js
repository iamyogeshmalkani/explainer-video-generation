// Pictures from perchance.org/ai-text-to-image-generator, which is free and has no API.
// The page is driven in a normal, visible Chrome window that has its own profile
// (~/.cache/explainroo/chrome-perchance), so your own Chrome tabs and logins are never touched.
//
// Perchance sits behind a Cloudflare "verify you are not a bot" check. This code does not try to get around it:
// in a normal window the check usually passes by itself; when it shows a box, a person has to tick it in the
// window, and the run waits for that. The page also shows ads, which is how the service pays for itself,
// so keep the volume small: one picture at a time, a short pause between pictures.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { findChrome } from './browser.js';
import { ProjectError } from './project.js';

const PAGE_URL = 'https://perchance.org/ai-text-to-image-generator';
const PORT = Number(process.env.EXPLAINROO_PERCHANCE_PORT) || 9333;
const PROFILE = process.env.EXPLAINROO_PERCHANCE_PROFILE || path.join(os.homedir(), '.cache', 'explainroo', 'chrome-perchance');
const COUNT = [2, 4, 6, 8].includes(Number(process.env.EXPLAINROO_PERCHANCE_COUNT)) ? Number(process.env.EXPLAINROO_PERCHANCE_COUNT) : 2;
const PAUSE_MS = 4000; // a polite gap between two pictures
const VERIFY_WAIT_MS = 5 * 60 * 1000;
const GENERATE_WAIT_MS = 3 * 60 * 1000;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const SHAPES = { '1:1': 'Square', '9:16': 'Portrait', '2:3': 'Portrait', '3:4': 'Portrait', '16:9': 'Landscape', '3:2': 'Landscape', '4:3': 'Landscape' };

async function playwright() {
  try {
    return createRequire(import.meta.url)('playwright-core');
  } catch {
    throw new ProjectError('the Perchance model needs playwright-core. Run "npm install" in the explainroo folder.');
  }
}

async function connect(chromium) {
  const endpoint = `http://127.0.0.1:${PORT}`;
  try { return await chromium.connectOverCDP(endpoint, { timeout: 4000 }); } catch { /* not running yet */ }
  const bin = findChrome();
  fs.mkdirSync(PROFILE, { recursive: true });
  const child = spawn(bin, [
    `--user-data-dir=${PROFILE}`, `--remote-debugging-port=${PORT}`, '--remote-debugging-address=127.0.0.1',
    '--no-first-run', '--no-default-browser-check', '--window-size=1200,900', 'about:blank',
  ], { detached: true, stdio: 'ignore' });
  child.unref();
  for (let i = 0; i < 40; i++) {
    await sleep(500);
    try { return await chromium.connectOverCDP(endpoint, { timeout: 4000 }); } catch { /* keep waiting */ }
  }
  throw new ProjectError(`could not open Chrome for Perchance (port ${PORT}). Close any window that uses ${PROFILE} and try again.`);
}

async function findGenerator(page) {
  for (const f of page.frames()) {
    if (await f.locator('#generateButtonEl').count().catch(() => 0)) return f;
  }
  return null;
}

// Waits for the generator page, which needs a person to tick Cloudflare's box if it shows one.
async function waitForGenerator(page, log) {
  const t0 = Date.now();
  let told = false;
  while (Date.now() - t0 < VERIFY_WAIT_MS) {
    const f = await findGenerator(page);
    if (f) return f;
    const title = await page.title().catch(() => '');
    const body = await page.locator('body').innerText({ timeout: 1500 }).catch(() => '');
    if (!told && (/just a moment|security verification/i.test(title + body))) {
      told = true;
      await page.bringToFront().catch(() => {});
      log('Perchance shows its "verify you are human" check. Please complete it in the Chrome window that opened; waiting up to 5 minutes.');
    }
    await sleep(1500);
  }
  throw new ProjectError('the Perchance page did not load (or its human check was not completed) within 5 minutes.');
}

// Sets the <select> that has all the given option labels; works even when the control is hidden.
function setSelect(frame, labels, want) {
  return frame.evaluate(([labels, want]) => {
    const norm = (s) => s.normalize('NFKD').replace(/\s+/g, ' ').trim().toLowerCase();
    for (const sel of document.querySelectorAll('select')) {
      const opts = [...sel.options].map((o) => norm(o.textContent));
      if (!labels.every((l) => opts.includes(norm(l)))) continue;
      const i = opts.indexOf(norm(want));
      if (i < 0) return false;
      sel.selectedIndex = i;
      sel.dispatchEvent(new Event('input', { bubbles: true }));
      sel.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    }
    return false;
  }, [labels, want]);
}

let lastAt = 0;

// Returns an array of JPEG buffers (EXPLAINROO_PERCHANCE_COUNT of them, 2 by default), best guess first.
export async function perchanceImages({ prompt, ratio = '1:1', log = () => {} }) {
  const { chromium } = await playwright();
  const wait = lastAt + PAUSE_MS - Date.now();
  if (wait > 0) await sleep(wait);
  const browser = await connect(chromium);
  let page;
  try {
    const ctx = browser.contexts()[0] || await browser.newContext();
    page = await ctx.newPage();
    log('opening Perchance');
    await page.goto(PAGE_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    const frame = await waitForGenerator(page, log);
    await frame.getByText('got it', { exact: false }).first().click({ timeout: 1500 }).catch(() => {});

    const boxes = await frame.locator('textarea.paragraph-input').evaluateAll((els) => els.map((e) => e.placeholder));
    const at = boxes.findIndex((p) => !/^use this box/i.test(p));
    await frame.locator('textarea.paragraph-input').nth(at < 0 ? 1 : at).fill(prompt.slice(0, 1500));
    // The picture style comes from the prompt itself, so turn the page's own art style off.
    await setSelect(frame, ['Painted Anime', 'No style'], 'No style');
    await setSelect(frame, ['Square', 'Portrait', 'Landscape'], SHAPES[ratio] || 'Square');
    await setSelect(frame, ['4', '6', '8'], String(COUNT));

    await frame.locator('#generateButtonEl').click();
    log(`generating ${COUNT} candidates`);
    const t0 = Date.now();
    let found = [];
    while (Date.now() - t0 < GENERATE_WAIT_MS) {
      await sleep(1500);
      const iframes = frame.locator('iframe[class*="text-to-image"]');
      const n = await iframes.count().catch(() => 0);
      const got = [];
      for (let i = 0; i < n; i++) {
        const cf = await (await iframes.nth(i).elementHandle().catch(() => null))?.contentFrame().catch(() => null);
        const src = await cf?.evaluate(() => {
          const img = document.querySelector('img');
          return img && img.complete && img.naturalWidth > 0 && img.src.startsWith('data:image') ? img.src : null;
        }).catch(() => null);
        if (src) got.push(src);
      }
      found = got;
      if (found.length >= COUNT) break;
    }
    if (!found.length) throw new Error('Perchance returned no picture within 3 minutes (it may be busy; try again in a moment)');
    return found.map((src) => Buffer.from(src.slice(src.indexOf(',') + 1), 'base64'));
  } finally {
    lastAt = Date.now();
    await page?.close().catch(() => {});
    await browser.close().catch(() => {}); // only disconnects; the Chrome window stays open for the next picture
  }
}

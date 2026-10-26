#!/usr/bin/env node
// Fallback for shot-images.mjs when the keyed Pollinations endpoint (gen.pollinations.ai) has no balance:
// makes the missing shot pictures through Pollinations' free host (image.pollinations.ai, FLUX), which
// allows about one picture every 45 seconds per IP. Same prompts, same STYLE, same 720x1280 size.
//
//   node scripts/shot-images-free.mjs <project-folder> [--only 3,5,7]
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const args = process.argv.slice(2);
const project = path.resolve(args.find((a) => !a.startsWith('--')) || '.');
const only = (() => { const i = args.indexOf('--only'); return i >= 0 ? args[i + 1].split(',').map(Number) : null; })();
const { SHOTS, STYLE, ASPECT } = await import(pathToFileURL(path.join(project, 'shots.js')).href);
const SIZES = { '16:9': [1280, 720], '9:16': [720, 1280], '1:1': [1024, 1024] };
const [width, height] = SIZES[ASPECT || '9:16'];
const assets = path.join(project, 'assets');
fs.mkdirSync(assets, { recursive: true });
const have = (base) => ['png', 'jpg', 'jpeg', 'webp', 'mp4', 'mov', 'webm', 'm4v'].some((e) => fs.existsSync(path.join(assets, `${base}.${e}`)));
const todo = SHOTS.filter((s) => !have(s.file) && (!only || only.includes(s.n)));
console.log(`${todo.length} picture(s) to make through image.pollinations.ai (free, about one every 45 seconds).`);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
for (const s of todo) {
  const text = `${s.prompt}. ${STYLE}`;
  const seed = Math.floor(Math.random() * 2 ** 31);
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(text)}?model=flux&width=${width}&height=${height}&seed=${seed}&nologo=true`;
  let done = false;
  for (let attempt = 1; attempt <= 12 && !done; attempt++) {
    const t0 = Date.now();
    let res;
    try {
      res = await fetch(url, { signal: AbortSignal.timeout(240000) });
    } catch (e) {
      console.log(`  ${s.file}: no answer (${e.message}), trying again`);
      await sleep(15000);
      continue;
    }
    const type = res.headers.get('content-type') || '';
    if (res.ok && type.startsWith('image/')) {
      const ext = type.includes('png') ? 'png' : type.includes('webp') ? 'webp' : 'jpg';
      const buf = Buffer.from(await res.arrayBuffer());
      const file = path.join(assets, `${s.file}.${ext}`);
      fs.writeFileSync(file, buf);
      fs.mkdirSync(path.join(project, 'build', 'images'), { recursive: true });
      fs.appendFileSync(path.join(project, 'build', 'images', 'usage.jsonl'), JSON.stringify({ time: new Date().toISOString(), name: s.file, file: path.relative(project, file), provider: 'pollinations-free', model: 'flux', served_by: 'image.pollinations.ai', aspect: ASPECT, size: `${width}x${height}`, seed, prompt: s.prompt, style: STYLE, cost_usd: 0, seconds: Math.round((Date.now() - t0) / 100) / 10, bytes: buf.length }) + '\n');
      console.log(`  made ${path.relative(project, file)} in ${Math.round((Date.now() - t0) / 1000)}s`);
      done = true;
    } else {
      const body = (await res.text().catch(() => '')).slice(0, 160);
      // Every failed call, even a 503, counts toward the one-per-45-seconds limit, so always wait it out.
      const wait = 50;
      console.log(`  ${s.file}: HTTP ${res.status} ${body}; trying again in ${wait}s (${attempt}/12)`);
      await sleep(wait * 1000);
    }
  }
  if (!done) { console.error(`stopped at ${s.file}; run again (finished pictures are kept).`); process.exit(1); }
  await sleep(46000);
}
console.log('done. Open every picture in assets/ and remake any that look wrong.');

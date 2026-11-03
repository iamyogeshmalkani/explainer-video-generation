#!/usr/bin/env node
// Prompts for the clay pictures, and (optionally) the pictures themselves. clay-story version: the prompts come from CAST and SETS in shots.js,
// and nothing is made while a shot is unfinished or breaks a rule of check-shots.mjs.
//
//   node scripts/shot-images.mjs <project>                         NO picture is made: writes <project>/prompts.md with one
//                                                                   paste-ready prompt per missing picture (for Perchance or any
//                                                                   other generator) and lists which pictures you already have
//   node scripts/shot-images.mjs <project> --only 3,5              only these shots
//   node scripts/shot-images.mjs <project> --characters --perchance   first: one full-body picture of each CAST member (assets/char-<key>.png) to look at the cast before any shot is made
//   node scripts/shot-images.mjs <project> --perchance [--only 3]  make them with perchance.org in a Chrome window (free, no key); prompts are sent to that website
//   node scripts/shot-images.mjs <project> --local                 free: runs on this computer (mflux), nothing is sent anywhere
//   node scripts/shot-images.mjs <project> --cloudflare            Cloudflare Workers AI; needs CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID in .env
//   node scripts/shot-images.mjs <project> --pollinations          hosted FLUX; needs POLLINATIONS_API_KEY
//   node scripts/shot-images.mjs <project> --both | --all         several makers at once, each taking the next missing picture
//   node scripts/shot-images.mjs <project> --dry-run               list what would be made, and write nothing
//
// Save pictures you make yourself as <project>/assets/shot01.png, shot02.png ... (the number is the shot's `n`; .jpg and
// .webp work too). Perchance in a window needs a visible Chrome on some Macs: set EXPLAINROO_CHROME to its path first.
// Perchance works in several tabs at once (12 by default; --tabs N, 1 to 15).
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const args = process.argv.slice(2);
const project = path.resolve(args.find((a, i) => !a.startsWith('--') && !['--only', '--tabs'].includes(args[i - 1])) || '.');
const flag = (n) => args.includes(`--${n}`);
const only = (() => { const i = args.indexOf('--only'); return i >= 0 ? args[i + 1].split(',') : null; })(); // shot numbers (3,5) or file names (shot03)
const tabs = (() => {
  const i = args.indexOf('--tabs');
  const n = Math.floor(Number(i >= 0 ? args[i + 1] : process.env.EXPLAINROO_PERCHANCE_TABS));
  return Math.min(15, Math.max(1, Number.isFinite(n) && n > 0 ? n : 3));
})();
if (!fs.existsSync(path.join(project, 'shots.js'))) { console.error(`no shots.js in ${project}`); process.exit(1); }

const shotsMod = await import(pathToFileURL(path.join(project, 'shots.js')).href);
const { SHOTS: ALL_SHOTS, ASPECT, NEGATIVE, promptFor, fileOf, CAST, characterPrompt } = shotsMod;
const { lint } = await import(new URL('../lib/lint.js', import.meta.url).href);
const have = (base) => ['png', 'jpg', 'jpeg', 'webp', 'mp4', 'mov', 'webm', 'm4v'].some((e) => fs.existsSync(path.join(project, 'assets', `${base}.${e}`)));
// the pictures to make: the cast (--characters) or the shots; every shot gets a `file` name
const SHOTS = flag('characters')
  ? Object.keys(CAST).map((k, i) => ({ n: i + 1, file: `char-${k}`, scene: k, prompt: characterPrompt(k), motion: 'still' }))
  : ALL_SHOTS.map((s) => ({ ...s, file: fileOf(s) }));
if (!flag('characters')) { // the shots must be written carefully before any picture is made
  const { errors } = lint(shotsMod);
  if (errors.length) {
    console.error(`${errors.length} problem(s) in shots.js. Fix them first (node scripts/check-shots.mjs ${path.relative(process.cwd(), project) || '.'} shows them with the narration):`);
    for (const e of errors.slice(0, 20)) console.error(`  ${e}`);
    process.exit(1);
  }
}
const promptOf = (s) => (s.prompt ? s.prompt : promptFor(s));
const todo = SHOTS.filter((s) => !have(s.file) && (!only || only.includes(s.file) || only.includes(String(s.n)) || only.includes(s.scene)));
const aspect = ASPECT || '9:16';
const MAKER_FLAGS = ['perchance', 'local', 'cloudflare', 'pollinations', 'both', 'all'];
const makers = flag('all') ? ['perchance', 'cloudflare', 'local'] : flag('both') ? ['perchance', 'local']
  : MAKER_FLAGS.filter((m) => flag(m) && !['both', 'all'].includes(m));

const doneCount = SHOTS.length - SHOTS.filter((s) => !have(s.file)).length;
console.log(`${SHOTS.length} shots: ${doneCount} already in assets/, ${todo.length} to go${only ? ' (after --only)' : ''}.`);

// ---------- no maker: write the prompts ----------
if (!makers.length) {
  for (const s of todo) console.log(`  shot ${String(s.n).padStart(2, '0')} -> assets/${s.file}.png: ${promptOf(s).slice(0, 110)}...`);
  if (flag('dry-run')) { console.log('\n(dry run: nothing was written)'); process.exit(0); }
  const lines = [
    '# Prompts for the clay pictures',
    '',
    `Make each picture in a generator (for Perchance: the text-to-image generator, style **No style**, the ${aspect} shape) and save it as \`assets/<file>\` in this project.`,
    'Keep the same generator and the same settings for every picture so the clay looks alike. Look at every picture: if a character does not match its description, make it again.',
    '',
    `Negative prompt (if the generator has the field): \`${NEGATIVE}\``,
    '',
  ];
  for (const s of todo) {
    lines.push(`## Shot ${s.n}: save as \`assets/${s.file}.png\``, '', `Camera: ${s.motion || 'push'}${s.enter && s.enter !== 'cut' ? `, arrives with a ${s.enter}` : ''}`, '', '```', promptOf(s), '```', '');
  }
  if (!todo.length) lines.push('Every shot already has a picture or a clip in assets/.');
  const out = path.join(project, 'prompts.md');
  fs.writeFileSync(out, `${lines.join('\n')}\n`);
  console.log(`\nwrote ${out} (${todo.length} prompt${todo.length === 1 ? '' : 's'}). Nothing was generated.`);
  process.exit(0);
}

// ---------- a maker: make the pictures with explainroo's `image` command ----------
const bin = path.resolve(project, '../../bin/explainroo.js');
if (!fs.existsSync(bin)) { console.error(`cannot find explainroo at ${bin}; run this from a project inside explainroo/videos/`); process.exit(1); }
// Perchance gets one lane per browser tab (never more tabs than pictures); the other makers get one lane each.
const lanes = makers.flatMap((m) => m === 'perchance' ? Array.from({ length: Math.max(1, Math.min(tabs, todo.length)) }, (_, i) => ({ model: m, name: `perchance#${i + 1}` })) : [{ model: m, name: m }]);
const multi = lanes.length > 1;
const describe = {
  local: 'on this computer (free, about 2 minutes each on an M2)',
  perchance: `with perchance.org in ${tabs} Chrome tab${tabs === 1 ? '' : 's'} at a time (free, about 20 to 30 seconds each; prompts are sent to that website)`,
  cloudflare: 'with Cloudflare Workers AI (about 5 seconds each, free daily allowance; prompts are sent to Cloudflare)',
  pollinations: 'with hosted FLUX on pollinations.ai (about 10 seconds each; prompts are sent to that website)',
};
if (multi) console.log(`${todo.length} picture(s) to make, ${lanes.length} at a time (${lanes.map((l) => l.name).join(', ')}).`);
else console.log(`${todo.length} picture(s) to make ${describe[makers[0]]}.`);
if (flag('dry-run')) { for (const s of todo) console.log(`  shot ${s.file}: ${promptOf(s)}`); console.log('\n(dry run: nothing was made)'); process.exit(0); }

function makeOne(shot, { model, name }) {
  return new Promise((resolve) => {
    console.log(`making ${shot.file} ${multi ? `with ${name} ` : ''}...`);
    const child = spawn('node', [bin, 'image', project, shot.file, promptOf(shot), '--aspect', aspect, '--model', model, '--no-style'], { stdio: ['ignore', 'pipe', 'pipe'] });
    const tag = multi ? `[${name}] ` : '';
    for (const [stream, out] of [[child.stdout, process.stdout], [child.stderr, process.stderr]]) {
      let buf = '';
      stream.on('data', (d) => {
        buf += d;
        let i;
        while ((i = buf.indexOf('\n')) >= 0) { out.write(`${tag}${buf.slice(0, i)}\n`); buf = buf.slice(i + 1); }
      });
      stream.on('end', () => { if (buf) out.write(`${tag}${buf}\n`); });
    }
    child.on('error', () => resolve(1));
    child.on('close', (code) => resolve(code ?? 1));
  });
}

const queue = [...todo];
const made = {};
let stopped = false;
async function lane(l, index) {
  const { model, name } = l;
  if (index > 0) await new Promise((r) => setTimeout(r, Math.min(index, 5) * 2500)); // the first Perchance tab opens Chrome, the others join it
  while (queue.length && !stopped) {
    const shot = queue.shift();
    const code = await makeOne(shot, l);
    if (code === 0) { made[model] = (made[model] || 0) + 1; continue; }
    if (multi) {
      console.error(`${name} could not make ${shot.file}; leaving the rest to the other lanes.`);
      queue.unshift(shot);
      return;
    }
    console.error(`stopped at ${shot.file}; fix the problem above and run again (finished pictures are kept).`);
    stopped = true;
    queue.unshift(shot);
  }
}
await Promise.all(lanes.map(lane));
if (queue.length) { console.error(`${queue.length} picture(s) are still missing: ${queue.map((s) => s.file).join(', ')}. Run the command again (finished pictures are kept).`); process.exit(1); }
console.log(`done${multi ? ` (${Object.entries(made).map(([m, n]) => `${n} by ${m}`).join(', ')})` : ''}. Open every picture in assets/: every character should look the same in every shot (node scripts/storyboard.mjs <project> shows them side by side); remake any that do not with --only.`);

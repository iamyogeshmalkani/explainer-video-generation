#!/usr/bin/env node
// Makes the missing shot pictures with explainroo's `image` command (AI pictures through OpenRouter).
// This COSTS MONEY on your OpenRouter account (about 7 to 13 cents a picture with --model best,
// about half with --cheap) and sends each prompt to that service, so nothing runs without --yes.
//
//   node scripts/shot-images.mjs <project-folder> --dry-run            list what would be made
//   node scripts/shot-images.mjs <project-folder> --yes [--cheap] [--only 3,5,7]
//   node scripts/shot-images.mjs <project-folder> --local [--only 3,5,7]   free: runs on this computer (mflux), nothing is sent anywhere
//
// Needs OPENROUTER_API_KEY in the environment or in a .env file (never put it in a script).
// Look at every picture afterwards: picture models get details wrong.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const args = process.argv.slice(2);
const project = path.resolve(args.find((a) => !a.startsWith('--')) || '.');
const flag = (n) => args.includes(`--${n}`);
const only = (() => { const i = args.indexOf('--only'); return i >= 0 ? args[i + 1].split(',').map(Number) : null; })();
const bin = path.resolve(project, '../../bin/explainroo.js');
if (!fs.existsSync(path.join(project, 'shots.js'))) { console.error(`no shots.js in ${project}`); process.exit(1); }
if (!fs.existsSync(bin)) { console.error(`cannot find explainroo at ${bin}; run this from a project inside explainroo/videos/`); process.exit(1); }

const { SHOTS, STYLE } = await import(pathToFileURL(path.join(project, 'shots.js')).href);
const have = (base) => ['png', 'jpg', 'jpeg', 'webp', 'mp4', 'mov', 'webm', 'm4v'].some((e) => fs.existsSync(path.join(project, 'assets', `${base}.${e}`)));
const todo = SHOTS.filter((s) => !have(s.file) && (!only || only.includes(s.n)));
const local = flag('local');
const model = local ? 'local' : flag('cheap') ? 'cheap' : 'best';

console.log(local
  ? `${todo.length} picture(s) to make on this computer with --model local (free, about a minute each).`
  : `${todo.length} picture(s) to make with --model ${model}; about ${(todo.length * (model === 'best' ? 0.07 : 0.035)).toFixed(2)} to ${(todo.length * (model === 'best' ? 0.13 : 0.065)).toFixed(2)} dollars (estimate).`);
for (const s of todo) console.log(`  shot ${String(s.n).padStart(2, '0')}  ${s.file}: ${s.prompt}`);
if (flag('dry-run') || !(flag('yes') || local)) { console.log(flag('dry-run') ? '\n(dry run: nothing was made)' : '\nAdd --yes to make them.'); process.exit(0); }

for (const s of todo) {
  const prompt = `${s.prompt}. ${STYLE}`;
  console.log(`making ${s.file} ...`);
  const r = spawnSync('node', [bin, 'image', project, s.file, prompt, '--aspect', '9:16', '--model', model, '--no-style'], { stdio: 'inherit' });
  if (r.status !== 0) { console.error(`stopped at ${s.file}; fix the problem above and run again (finished pictures are kept).`); process.exit(r.status || 1); }
}
console.log('done. Open every picture in assets/ and remake any that look wrong.');

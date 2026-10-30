#!/usr/bin/env node
// Moves pictures to the Colab notebook (colab/pictures-to-video-ltx.ipynb) and the finished clips back.
//
//   node scripts/colab-clips.mjs pack   videos/<project> [--shots 3,7,12] [--out <folder>]
//   node scripts/colab-clips.mjs unpack videos/<project> <folder with the .mp4 clips>
//
// pack   copies the chosen pictures (by shot number `n`, or by file name; all shots if --shots is left out) into one
//        folder (default videos/<project>/out/colab-pack) and writes prompts.json beside them: for each picture, what
//        should MOVE (taken from the shot's own prompt and camera move). Put that folder in your Google Drive.
// unpack copies the .mp4 clips that match a shot's `file` name into videos/<project>/assets/. A clip replaces its
//        picture (the kits look for a clip first). A clip stops on its last frame, so use `speed: 0.6` on a shot that
//        lasts longer than the clip.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const [mode, projectArg, ...rest] = process.argv.slice(2);
const flag = (n) => { const i = rest.indexOf(`--${n}`); return i >= 0 ? rest[i + 1] : null; };
if (!['pack', 'unpack'].includes(mode) || !projectArg) {
  console.error('usage: node scripts/colab-clips.mjs pack <project> [--shots 3,7,12] [--out folder]\n       node scripts/colab-clips.mjs unpack <project> <folder with .mp4 clips>');
  process.exit(1);
}
const project = path.resolve(projectArg);
if (!fs.existsSync(path.join(project, 'shots.js'))) { console.error(`no shots.js in ${project}`); process.exit(1); }
const { SHOTS, STYLE } = await import(pathToFileURL(path.join(project, 'shots.js')).href);
const assets = path.join(project, 'assets');
const PICTURE = ['png', 'jpg', 'jpeg', 'webp'];
const pictureOf = (file) => PICTURE.map((e) => path.join(assets, `${file}.${e}`)).find((p) => fs.existsSync(p));

const CAMERA = {
  push: 'The camera slowly pushes in.',
  pull: 'The camera slowly pulls back.',
  panLeft: 'The camera slowly pans left.',
  panRight: 'The camera slowly pans right.',
  rise: 'The camera slowly rises.',
  still: 'The camera is steady.',
};
function motionPrompt(shot) {
  const subject = String(shot.prompt || '').replace(/\s+/g, ' ').trim().replace(/[.\s]+$/, '');
  const clay = /clay|plasticine|claymation/i.test(`${STYLE || ''} ${subject}`) ? ' Handmade clay stop-motion feel.' : '';
  return `${subject}. ${CAMERA[shot.motion] || CAMERA.push} Subtle natural motion: drifting smoke, flickering light, shifting shadows. Smooth, cinematic.${clay}`;
}

if (mode === 'pack') {
  const want = flag('shots')?.split(',').map((s) => s.trim()).filter(Boolean);
  const chosen = want ? SHOTS.filter((s) => want.includes(String(s.n)) || want.includes(s.file)) : SHOTS;
  if (want) for (const w of want) if (!chosen.some((s) => String(s.n) === w || s.file === w)) console.warn(`no shot "${w}" in shots.js (use the shot number n or the file name)`);
  const out = path.resolve(flag('out') || path.join(project, 'out', 'colab-pack'));
  fs.mkdirSync(out, { recursive: true });
  const prompts = {};
  const missing = [];
  for (const shot of chosen) {
    const src = pictureOf(shot.file);
    if (!src) { missing.push(shot.file); continue; }
    fs.copyFileSync(src, path.join(out, path.basename(src)));
    prompts[shot.file] = motionPrompt(shot);
  }
  fs.writeFileSync(path.join(out, 'prompts.json'), `${JSON.stringify(prompts, null, 2)}\n`);
  console.log(`packed ${Object.keys(prompts).length} picture(s) into ${out}`);
  if (missing.length) console.warn(`no picture yet for: ${missing.join(', ')} (make it first)`);
  console.log('next: upload that folder to Google Drive (My Drive/clay-clips), then open colab/pictures-to-video-ltx.ipynb in Colab.');
  console.log('      edit prompts.json first if a picture needs different motion (say what should move).');
} else {
  const from = rest[0] && !rest[0].startsWith('--') ? path.resolve(rest[0]) : null;
  if (!from || !fs.existsSync(from)) { console.error('give the folder that holds the .mp4 clips'); process.exit(1); }
  const files = new Set(SHOTS.map((s) => s.file));
  fs.mkdirSync(assets, { recursive: true });
  let copied = 0;
  for (const f of fs.readdirSync(from).filter((n) => n.toLowerCase().endsWith('.mp4') && !n.includes('.part'))) {
    const stem = f.slice(0, -4);
    if (!files.has(stem)) { console.warn(`skipped ${f}: no shot called "${stem}" in shots.js`); continue; }
    fs.copyFileSync(path.join(from, f), path.join(assets, f));
    console.log(`  ${f} -> assets/${f}${pictureOf(stem) ? '  (replaces the picture)' : ''}`);
    copied++;
  }
  console.log(`${copied} clip(s) copied. Render as usual; a clip stops on its last frame, so set speed: 0.6 (shots.js) on a shot longer than the clip.`);
}

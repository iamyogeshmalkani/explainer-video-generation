#!/usr/bin/env node
// The free Pollinations host stamps a small "pollinations.ai" logo in the bottom right corner of every
// picture. This trims the bottom 56 pixels off every shot picture in assets/ (once; it remembers which
// files it has done in build/images/cropped.json), using ffmpeg.
//
//   node scripts/crop-logo.mjs <project-folder>
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const project = path.resolve(process.argv.slice(2).find((a) => !a.startsWith('--')) || '.');
const assets = path.join(project, 'assets');
const memo = path.join(project, 'build', 'images', 'cropped.json');
fs.mkdirSync(path.dirname(memo), { recursive: true });
const done = fs.existsSync(memo) ? JSON.parse(fs.readFileSync(memo, 'utf8')) : {};
const CROP = 56;

for (const f of fs.readdirSync(assets).filter((f) => /^shot\d+[a-z]?\.(jpg|jpeg|png|webp)$/i.test(f)).sort()) {
  const file = path.join(assets, f);
  const stamp = `${fs.statSync(file).size}:${fs.statSync(file).mtimeMs}`;
  if (done[f] === stamp) continue;
  const tmp = path.join(assets, `.${f}.tmp.png`);
  const r = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', file, '-vf', `crop=iw:ih-${CROP}:0:0`, tmp], { stdio: 'inherit' });
  if (r.status !== 0 || !fs.existsSync(tmp)) { console.error(`could not crop ${f}`); process.exit(1); }
  const out = path.join(assets, f.replace(/\.(jpg|jpeg|webp)$/i, '.png'));
  fs.rmSync(file, { force: true });
  fs.renameSync(tmp, out);
  done[path.basename(out)] = `${fs.statSync(out).size}:${fs.statSync(out).mtimeMs}`;
  delete done[f];
  console.log(`cropped ${f} -> ${path.basename(out)}`);
}
fs.writeFileSync(memo, JSON.stringify(done, null, 2));

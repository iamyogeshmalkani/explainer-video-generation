#!/usr/bin/env node
// Writes the scenes of shots into shots.js from a JSON file, by shot number. Handy for filling every "TODO" at once.
//
//   node scripts/set-shots.mjs <project> scenes.json
//
// scenes.json: { "1": { "who": ["mira"], "shot": "wide shot", "set": "cottage", "mood": "warm", "action": "{mira} stands ...",
//                       "motion": "push", "focus": [0.5, 0.4], "enter": "cut", "crowd": false }, "2": { ... } }
// Only the fields you give are changed. `word` and `says` come from plan-shots.mjs and cannot be set here.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { replaceBlock } from '../lib/shotsfile.js';

const [project, file] = process.argv.slice(2).filter((a) => !a.startsWith('--'));
if (!project || !file) { console.error('usage: node scripts/set-shots.mjs <project> scenes.json'); process.exit(1); }
const shotsFile = path.join(path.resolve(project), 'shots.js');
const mod = await import(`${pathToFileURL(shotsFile).href}?t=${Date.now()}`);
const edits = JSON.parse(fs.readFileSync(file, 'utf8'));
const ALLOWED = ['who', 'shot', 'set', 'mood', 'action', 'motion', 'focus', 'enter', 'from', 'crowd', 'file'];
let changed = 0;
for (const [n, e] of Object.entries(edits)) {
  const shot = mod.SHOTS.find((s) => String(s.n) === String(n));
  if (!shot) { console.error(`there is no shot ${n}`); process.exit(1); }
  for (const [k, v] of Object.entries(e)) {
    if (!ALLOWED.includes(k)) { console.error(`shot ${n}: "${k}" cannot be set here (allowed: ${ALLOWED.join(', ')})`); process.exit(1); }
    shot[k] = v;
  }
  changed++;
}
fs.writeFileSync(shotsFile, replaceBlock(fs.readFileSync(shotsFile, 'utf8'), mod.SHOTS));
console.log(`updated ${changed} shot(s) in ${path.relative(process.cwd(), shotsFile)}. Next: node scripts/check-shots.mjs ${project}`);

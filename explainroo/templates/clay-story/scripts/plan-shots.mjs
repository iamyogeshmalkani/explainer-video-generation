#!/usr/bin/env node
// Cuts the narration into shots of 2 to 3 seconds and writes them into shots.js (between "<SHOTS>" and "</SHOTS>").
//
//   node scripts/plan-shots.mjs <project>            after `explainroo voice <project>`
//   node scripts/plan-shots.mjs <project> --dry-run  show the plan, write nothing
//   node scripts/plan-shots.mjs <project> --target 2.6   aim at 2.6 seconds a picture (2.0 to 3.0, default 2.5)
//
// A cut falls where the voice finishes a sentence (best) or a phrase (next best), never in the middle of a phrase if it can be avoided.
// A shot whose narration did not change keeps everything you wrote for it (who, shot, action, set, mood, motion), so you can run this
// again after changing the voice, the speed or a sentence: only the new shots get an empty "TODO" action to write.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { replaceBlock } from '../lib/shotsfile.js';

const args = process.argv.slice(2);
const project = path.resolve(args.find((a, i) => !a.startsWith('--') && args[i - 1] !== '--target') || '.');
const dry = args.includes('--dry-run');
const target = Number(args[args.indexOf('--target') + 1]) || 2.5;
const LO = 2.0, HI = 3.0;
const engine = (f) => import(new URL(`../../../src/${f}`, import.meta.url).href);
const { loadProject } = await engine('project.js');
const { buildTimeline } = await engine('timeline.js');

const p = loadProject(project);
const voices = {};
for (const sc of p.script.scenes) {
  const f = path.join(p.paths.voice, `${sc.id}.json`);
  if (fs.existsSync(f)) voices[sc.id] = JSON.parse(fs.readFileSync(f, 'utf8'));
}
if (p.script.scenes.length !== 1 || p.script.scenes[0].id !== 'story') { console.error('clay-story needs exactly one scene, "## story", in script.md'); process.exit(1); }
if (!voices.story) { console.error(`no voice yet: run  node bin/explainroo.js voice ${path.relative(process.cwd(), project)}  first`); process.exit(1); }
const words = buildTimeline(p, voices).scenes[0].words; // scene time: the lead-in is already added
const N = words.length;

// boundaries 0..N: boundary j is the start of word j (a little before it is said); 0 is the start of the scene, N the end of the scene
const T = (j) => (j === 0 ? 0 : j === N ? words[N - 1].end + 0.5 : Math.max(0, words[j].start - 0.06));
// small words that a phrase cannot end on ("at the | edge", "now two | lanterns"); only for English, other languages cut on punctuation and timing
const FUNCTION = new Set('a an the of in on at to for with by from into onto and but or nor so as if than that this these those his her its their my your our me him them us it he she they we i you is was are were be been has have had do did will would can could not no one two three four five six seven eight nine ten'.split(' '));
const isEnd = (t) => /[.!?…।]["”')\]]*$/.test(t);
const sentStart = new Array(N).fill(0); // the first word of the sentence each word is in
const sentEnd = new Array(N).fill(N - 1); // and its last word
for (let i = 0, st = 0; i < N; i++) { sentStart[i] = st; if (isEnd(words[i].text)) { for (let k = st; k <= i; k++) sentEnd[k] = i; st = i + 1; } }
const quality = (j) => { // how good a place to cut before word j (lower is better)
  if (j === N) return 0;
  const prev = words[j - 1].text;
  if (isEnd(prev)) return 0; // a sentence ends here: the best cut
  const bare = prev.toLowerCase().replace(/[^a-z']/g, '');
  let q = /[,;:—–]["”')\]]*$/.test(prev) ? 0.45 : 1.5 + (p.config.language === 'en' && FUNCTION.has(bare) ? 1.5 : 0);
  // a cut inside a sentence must not strand its first words on the previous picture, or its last words on the next one:
  // the picture of a shot has to show what ITS words say
  if (j - sentStart[j] <= 3) q += 2.5;   // "... pahuncha. Dukaandaar | apna purse ..." / "... Chotu ne purse | uske haath ..."
  if (sentEnd[j] - j + 1 <= 2) q += 2.5; // "... tha, | beta" would leave the last two words alone
  return q;
};
function plan(lo, hi, lastLo) {
  const f = new Array(N + 1).fill(Infinity);
  const from = new Array(N + 1).fill(-1);
  f[0] = 0;
  for (let i = 0; i < N; i++) {
    if (f[i] === Infinity) continue;
    for (let j = i + 1; j <= N; j++) {
      const d = T(j) - T(i);
      if (d > hi) break;
      if (d < (j === N ? lastLo : lo)) continue;
      const c = f[i] + 0.6 * Math.abs(d - target) + quality(j);
      if (c < f[j]) { f[j] = c; from[j] = i; }
    }
  }
  if (f[N] === Infinity) return null;
  const cuts = [];
  for (let j = N; j > 0; j = from[j]) cuts.unshift(from[j]);
  return cuts;
}
let cuts = plan(LO, HI, 1.2);
let relaxed = false;
if (!cuts) { cuts = plan(1.6, 3.4, 0.8); relaxed = true; }
if (!cuts) { console.error('could not cut the narration into shots (very long pauses?)'); process.exit(1); }
if (relaxed) console.warn('WARNING: some shots had to be 1.6 to 3.4 seconds (a long pause or a very long word run); check-shots.mjs will report them.');

// keep what was written for shots whose narration did not change
const shotsFile = path.join(project, 'shots.js');
const src = fs.readFileSync(shotsFile, 'utf8');
const old = {};
try {
  const mod = await import(`${pathToFileURL(shotsFile).href}?t=${Date.now()}`);
  for (const s of mod.SHOTS) if (s.says) old[s.says] = s;
} catch { /* a shots.js that does not load: start from empty shots */ }
const MOTIONS = ['push', 'pull', 'push', 'slideLeft', 'push', 'pull', 'push', 'slideRight'];
let kept = 0;
const entries = cuts.map((w0, i) => {
  const w1 = i + 1 < cuts.length ? cuts[i + 1] : N;
  const says = words.slice(w0, w1).map((w) => w.text).join(' ');
  const was = old[says];
  if (was) kept++;
  const base = was || { who: [], shot: 'medium shot', set: '', mood: '', action: 'TODO: show what the narration says, with {keys} for characters', motion: MOTIONS[i % MOTIONS.length], focus: [0.5, 0.45] };
  return { ...base, n: i + 1, word: w0, says };
});

const durs = cuts.map((w0, i) => (T(i + 1 < cuts.length ? cuts[i + 1] : N) - T(w0)));
console.log(`${N} words, ${cuts.length} shots, ${(durs.reduce((x, y) => x + y, 0) / cuts.length).toFixed(2)} s on average (shortest ${Math.min(...durs).toFixed(1)}, longest ${Math.max(...durs).toFixed(1)}), ${kept} kept from before, ${cuts.length - kept} to write.`);
cuts.forEach((w0, i) => console.log(`  ${String(i + 1).padStart(2)}  ${durs[i].toFixed(1)} s  ${words.slice(w0, i + 1 < cuts.length ? cuts[i + 1] : N).map((w) => w.text).join(' ')}`));
if (dry) { console.log('\n(dry run: nothing was written)'); process.exit(0); }
fs.writeFileSync(shotsFile, replaceBlock(src, entries));
console.log(`\nwrote ${path.relative(process.cwd(), shotsFile)}. Now write the "TODO" shots: for every shot read its "says", then who / shot / set / mood / action (see TEMPLATE.md).`);

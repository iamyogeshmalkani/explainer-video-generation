#!/usr/bin/env node
// Lints shots.js against the narration and writes storyboard.md (each shot: the narration, then what the picture shows).
//
//   node scripts/check-shots.mjs <project>
//
// Errors (exit 1): a shot that is not written, a character in "who" that the action does not use (or the other way round),
// a person described by hand ("a young boy": write {key} so the age, height and clothes never change), narration that changed since
// the shots were planned, a picture that would last less than 2 or more than 3 seconds.
// Warnings: more than 3 characters in a picture, an action that is too long, narration words the picture never mentions (English).
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { lint } from '../lib/lint.js';

const project = path.resolve(process.argv[2] || '.');
const engine = (f) => import(new URL(`../../../src/${f}`, import.meta.url).href);
const mod = await import(`${pathToFileURL(path.join(project, 'shots.js')).href}?t=${Date.now()}`);
let words = null;
let language = 'en';
let scenes = null;
try {
  const { loadProject } = await engine('project.js');
  const { buildTimeline } = await engine('timeline.js');
  const p = loadProject(project);
  language = p.config.language;
  const f = path.join(p.paths.voice, 'story.json');
  if (fs.existsSync(f)) {
    words = buildTimeline(p, { story: JSON.parse(fs.readFileSync(f, 'utf8')) }).scenes[0].words;
    scenes = true;
  } else console.warn('no voice yet (run `explainroo voice`): words and durations are not checked');
} catch (e) { console.warn(`could not read the project (${e.message}): words and durations are not checked`); }

const { errors, warnings } = lint(mod, { words, language });

// storyboard.md
const t = (j) => (j === 0 ? 0 : Math.max(0, words[j].start - 0.06));
const rows = mod.SHOTS.map((s, i) => {
  const next = mod.SHOTS[i + 1];
  const dur = words && typeof s.word === 'number' ? ((next ? t(next.word) : words[words.length - 1].end + 0.5) - t(s.word)).toFixed(1) : '?';
  let prompt = '';
  try { prompt = mod.promptFor(s); } catch { prompt = '(not written yet)'; }
  const img = ['png', 'jpg', 'jpeg', 'webp'].map((e) => `assets/${mod.fileOf(s)}.${e}`).find((f) => fs.existsSync(path.join(project, f)));
  return `### ${s.n}. ${dur} s: "${s.says}"\n\n${img ? `![shot ${s.n}](${img})\n\n` : ''}- who: ${(s.who || []).join(', ') || 'nobody'}; ${s.shot}; set: ${s.set || '-'}; mood: ${s.mood || '-'}; camera: ${s.motion || 'push'}\n- the picture shows: ${s.action}\n- prompt: \`${prompt}\`\n`;
});
fs.writeFileSync(path.join(project, 'storyboard.md'), `# Storyboard\n\nRead each narration line, then what its picture shows. They must say the same thing.\n\n${rows.join('\n')}`);

for (const w of warnings) console.log(`WARN  ${w}`);
for (const e of errors) console.log(`ERROR ${e}`);
console.log(`${mod.SHOTS.length} shots, ${errors.length} error(s), ${warnings.length} warning(s). Wrote storyboard.md${scenes ? '' : ' (no timings)'}.`);
process.exit(errors.length ? 1 : 0);

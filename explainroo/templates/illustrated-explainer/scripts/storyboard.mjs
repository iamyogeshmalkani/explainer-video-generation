#!/usr/bin/env node
// Writes storyboard.md: a scene-by-scene sheet with the voiceover, the visual direction,
// the camera move, the transition and the on-screen text, from script.md and shots.js.
//
//   node scripts/storyboard.mjs <project-folder>
//
// Times are estimates from the word count (about 2.5 words a second) until the narration
// exists; after `explainroo voice` run it again and the real marker times are used when found.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const project = path.resolve(process.argv[2] || '.');
const { SHOTS, HOOK, OVERLAYS = [] } = await import(pathToFileURL(path.join(project, 'shots.js')).href);
const script = fs.readFileSync(path.join(project, 'script.md'), 'utf8');
const title = (script.match(/^# (.+)$/m) || [, path.basename(project)])[1];

// The spoken text after each marker, without markup.
const body = script.split('\n').filter((l) => !l.startsWith('>') && !l.startsWith('#')).join(' ');
const parts = [...body.matchAll(/\[#(\w+)\]([^[]*(?:\[(?!#)[^\]]*\][^[]*)*)/g)];
const clean = (t) => t.replace(/\[\/?loud\]/g, '').replace(/\[pause[^\]]*\]/g, '').replace(/\{([^|}]*)\|[^}]*\}/g, '$1').replace(/\s+/g, ' ').trim();
const lines = new Map(parts.map((m) => [m[1], clean(m[2])]));

// Real times, when the voice has been made.
let real = null;
try {
  for (const f of ['build/voice/story.json', 'build/voice/timing.json']) {
    const p = path.join(project, f);
    if (fs.existsSync(p)) { const j = JSON.parse(fs.readFileSync(p, 'utf8')); real = j.marks || j.markers || null; if (real) break; }
  }
} catch { real = null; }

const WPS = 2.5;
let clock = 0;
const starts = SHOTS.map((s) => {
  const id = s.at.replace('#', '');
  const t = real && real[id] != null ? Number(real[id]) : clock;
  clock += (lines.get(id) || '').split(' ').filter(Boolean).length / WPS;
  return t;
});
const fmt = (t) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
const total = real ? null : clock;

const out = [`# Storyboard: ${title}`, '', real ? 'Times are from the finished narration.' : 'Times are estimates from the word count; run `explainroo voice` and then this script again for real times.', ''];
if (HOOK) out.push(`**Title card (0:00 to the start of ${HOOK.out || 'the first sentence'})**: ${HOOK.kicker ? `${HOOK.kicker}, ` : ''}"${HOOK.title}"${HOOK.sub ? `, "${HOOK.sub}"` : ''}`, '');
out.push('| Scene | Time | Voiceover | Visual direction | Camera | On-screen text |', '|---|---|---|---|---|---|');
SHOTS.forEach((s, i) => {
  const id = s.at.replace('#', '');
  const end = i + 1 < SHOTS.length ? starts[i + 1] : total ?? starts[i] + 4;
  const texts = OVERLAYS.filter((o) => o.at === s.at).map((o) => (o.type === 'stat' ? `${o.value}: ${o.label}` : o.text));
  const cell = (x) => String(x || '').replace(/\|/g, '/');
  out.push(`| ${s.n} | ${fmt(starts[i])}–${fmt(end)} | ${cell(lines.get(id))} | ${cell(s.dir || s.prompt)} | ${s.motion || 'push'}, crossfade | ${cell(texts.join('; ') || '(captions only)')} |`);
});
out.push('', 'Every scene also has the spoken words as a short caption at the bottom, the spoken word lit gold.', '');
fs.writeFileSync(path.join(project, 'storyboard.md'), out.join('\n'));
console.log(`wrote ${path.join(project, 'storyboard.md')} (${SHOTS.length} scenes)`);

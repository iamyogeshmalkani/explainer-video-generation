#!/usr/bin/env node
// Makes many videos at once from one script file (a "series" file).
//
//   node scripts/series.mjs <series.md> plan                 parse the file and list every video and its beats (writes nothing)
//   node scripts/series.mjs <series.md> build                create or refresh videos/<name>-NN from the template (keeps assets/)
//   node scripts/series.mjs <series.md> images [lanes]       make the missing paintings for ALL videos through one shared queue
//   node scripts/series.mjs <series.md> voice                make the narration and run the speech check
//   node scripts/series.mjs <series.md> render               render and verify every video
//   node scripts/series.mjs <series.md> make [lanes]         all of the above (build, then images and voice together, then render)
//
//   options:  --only 1,3      only these shorts
//             --lanes all|local,perchance,cloudflare,pollinations   picture makers (default: all = local, perchance and cloudflare)
//             --draft         render the quick half-size version
//
// The file format is described in templates/dark-history-hindi/README.md and shown in series/india-china-1962.md.
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bin = path.join(root, 'bin/explainroo.js');
const argv = process.argv.slice(2);
const flagVal = (n) => { const i = argv.indexOf(`--${n}`); return i >= 0 ? argv[i + 1] : null; };
const hasFlag = (n) => argv.includes(`--${n}`);
const positional = argv.filter((a, i) => !a.startsWith('--') && !(i > 0 && ['--only', '--lanes'].includes(argv[i - 1])));
const [seriesFile, command = 'plan', laneArg] = positional;
if (!seriesFile) { console.error('usage: node scripts/series.mjs <series.md> plan|build|images|voice|render|make [--only 1,3] [--lanes all|local,perchance,cloudflare|pollinations] [--draft]'); process.exit(1); }
const only = flagVal('only') ? flagVal('only').split(',').map(Number) : null;

// ---------- parsing ----------
const MOTIONS = ['push', 'pull', 'panLeft', 'panRight', 'rise', 'still'];

function parseFrontMatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) return { meta: {}, body: text };
  const meta = {};
  let key = null;
  for (const line of m[1].split('\n')) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    const nested = line.match(/^\s+([\w-]+):\s*(.*)$/);
    if (nested && key && typeof meta[key] === 'object') { meta[key][nested[1]] = nested[2].trim(); continue; }
    const top = line.match(/^([\w-]+):\s*(.*)$/);
    if (!top) continue;
    key = top[1];
    meta[key] = top[2].trim() === '' ? {} : top[2].trim();
  }
  return { meta, body: text.slice(m[0].length) };
}

function parseSeries(text) {
  const { meta, body } = parseFrontMatter(text);
  const shorts = [];
  let cur = null;
  let beat = null;
  const heading = /^(?:#{1,3}\s*)?(?:Short|Video|Part)\s+(\d+)\s*[:：.\-–]\s*(.*)$/i;
  for (const raw of body.split('\n')) {
    const line = raw.trim();
    const h = line.match(heading);
    if (h) { cur = { n: Number(h[1]), label: h[2].trim(), title: '', hook: null, facts: '', beats: [] }; shorts.push(cur); beat = null; continue; }
    if (!cur) continue;
    if (!line || line.startsWith('#')) continue;
    const kv = line.match(/^(title|hook|facts|voice|style)\s*:\s*(.*)$/i);
    if (kv && !beat) { cur[kv[1].toLowerCase()] = kv[2].trim(); continue; }
    if (line.startsWith('>')) {
      beat = { prompt: line.slice(1).trim(), text: '' };
      cur.beats.push(beat);
      continue;
    }
    if (!beat) { cur.problems = [...(cur.problems || []), `narration before any "> prompt" line: ${line.slice(0, 40)}`]; continue; }
    beat.text += (beat.text ? ' ' : '') + line;
  }
  return { meta, shorts };
}

function expandPrompt(p, characters) {
  let out = p;
  let opts = {};
  const bar = out.lastIndexOf(' | ');
  if (bar >= 0 && /^\s*(\w+=\S+\s*)+$/.test(out.slice(bar + 3))) {
    for (const kv of out.slice(bar + 3).trim().split(/\s+/)) { const [k, v] = kv.split('='); opts[k] = v; }
    out = out.slice(0, bar);
  }
  const missing = [];
  out = out.replace(/\{(\w+)\}/g, (all, name) => { if (characters[name]) return characters[name]; missing.push(name); return all; });
  return { prompt: out.trim(), opts, missing };
}

const text = fs.readFileSync(path.resolve(seriesFile), 'utf8');
const { meta, shorts: allShorts } = parseSeries(text);
const name = meta.name || path.basename(seriesFile, '.md');
const template = meta.template || 'dark-history-hindi';
const characters = typeof meta.characters === 'object' ? meta.characters : {};
const shorts = allShorts.filter((s) => !only || only.includes(s.n));
const dirOf = (s) => path.join(root, 'videos', `${name}-${String(s.n).padStart(2, '0')}`);
const projectDirs = shorts.map(dirOf);

// ---------- validation ----------
const errors = [];
for (const s of allShorts) {
  const where = `Short ${s.n}`;
  if (!s.title) errors.push(`${where}: missing "title:" line`);
  if (!s.beats.length) errors.push(`${where}: no beats; each beat is a "> English painting prompt" line followed by the Hindi narration`);
  (s.problems || []).forEach((p) => errors.push(`${where}: ${p}`));
  s.beats.forEach((b, i) => {
    if (!b.text) errors.push(`${where}, beat ${i + 1}: no narration under the prompt`);
    const { missing, opts } = expandPrompt(b.prompt, characters);
    missing.forEach((m) => errors.push(`${where}, beat ${i + 1}: unknown character {${m}} (define it under characters: at the top)`));
    if (opts.motion && !MOTIONS.includes(opts.motion)) errors.push(`${where}, beat ${i + 1}: motion=${opts.motion} is not one of ${MOTIONS.join(', ')}`);
    if (/\{[^}|]*\|[^}]*$/.test(b.text) || (b.text.match(/\[loud\]/g) || []).length !== (b.text.match(/\[\/loud\]/g) || []).length) errors.push(`${where}, beat ${i + 1}: unbalanced {..|..} or [loud]..[/loud] (they must open and close inside one beat)`);
  });
}
if (new Set(allShorts.map((s) => s.n)).size !== allShorts.length) errors.push('two shorts have the same number');
if (errors.length) { console.error(`${path.basename(seriesFile)} has problems:\n  - ${errors.join('\n  - ')}`); process.exit(1); }

// ---------- plan ----------
function plan() {
  console.log(`${name}: ${shorts.length} video(s) from template ${template}, voice ${meta.voice || '(template default)'}\n`);
  for (const s of shorts) {
    const words = s.beats.reduce((a, b) => a + b.text.replace(/\[[^\]]*\]/g, '').replace(/\{([^|}]*)\|[^}]*\}/g, '$1').split(/\s+/).filter(Boolean).length, 0);
    console.log(`Short ${s.n}: ${s.label}  [${path.relative(root, dirOf(s))}]  ${s.beats.length} paintings, ${words} words (about ${Math.round(words / 2.3)} s)\n  title/hook: ${s.hook || s.title}`);
    s.beats.forEach((b, i) => console.log(`   ${String(i + 1).padStart(2)}. ${b.text}`));
    console.log('');
  }
}

// ---------- build ----------
const q = (v) => JSON.stringify(v);
function writeProject(s) {
  const dir = dirOf(s);
  const tpl = path.join(root, 'templates', template);
  if (!fs.existsSync(tpl)) { console.error(`no template ${template}`); process.exit(1); }
  fs.mkdirSync(dir, { recursive: true });
  // template files (lib, scripts, scenes.js, look.json); never overwrite assets/, build/ or out/
  for (const f of ['lib', 'scripts', 'scenes.js', 'look.json']) fs.cpSync(path.join(tpl, f), path.join(dir, f), { recursive: true });
  fs.mkdirSync(path.join(dir, 'assets'), { recursive: true });

  const video = JSON.parse(fs.readFileSync(path.join(tpl, 'video.json'), 'utf8'));
  video.title = s.title;
  if (s.voice || meta.voice) video.voice = s.voice || meta.voice;
  for (const k of ['speed', 'pace']) if (meta[k]) video[k] = Number(meta[k]);
  if (meta.music) video.music = { ...video.music, style: meta.music };
  if (meta.key) video.music = { ...video.music, key: meta.key };
  if (meta.volume) video.music = { ...video.music, volume: Number(meta.volume) };
  if (meta.duck) video.music = { ...video.music, duck: Number(meta.duck) };
  const style = s.style || meta.style;
  if (style) video.images = { ...video.images, style };
  fs.writeFileSync(path.join(dir, 'video.json'), JSON.stringify(video, null, 2) + '\n');

  const narration = s.beats.map((b, i) => `[#s${i + 1}] ${b.text}`).join(' ');
  fs.writeFileSync(path.join(dir, 'script.md'), `# ${s.title}\n\n${s.facts ? `> ${s.facts}\n\n` : ''}## story {transition=cut hold=1.2}\n${narration}\n`);

  const lines = s.beats.map((b, i) => {
    const { prompt, opts } = expandPrompt(b.prompt, characters);
    const n = i + 1;
    const motion = opts.motion || MOTIONS[(s.n + i) % 5]; // cycles push, pull, panLeft, panRight, rise
    const embers = opts.embers ?? 0.6;
    const hit = opts.hit ?? (i === 0 ? 1.2 : 1);
    return `  { n: ${n}, at: '#s${n}', file: ${q(`shot${String(n).padStart(2, '0')}`)}, motion: ${q(motion)}, embers: ${embers}, hit: ${hit}, prompt: ${q(prompt)} },`;
  });
  const hook = s.hook === 'off' ? 'null' : `{ text: ${q(s.hook || s.title)}, out: 3.2 }`;
  fs.writeFileSync(path.join(dir, 'shots.js'), `// Generated by scripts/series.mjs from ${path.relative(root, path.resolve(seriesFile))} (Short ${s.n}). Edit the series file, then run \`build\` again.
export const STYLE = ${q(style || video.images.style)};
export const ASPECT = '9:16';
export const HOOK = ${hook};
export const SHOTS = [
${lines.join('\n')}
];
`);
}

function build() {
  for (const s of shorts) { writeProject(s); console.log(`built ${path.relative(root, dirOf(s))}  (${s.beats.length} paintings)`); }
}

// ---------- running commands ----------
// Same as `. ./env.sh` at the repository root: point explainroo at the ffmpeg and ffprobe installed by tools/.
const childEnv = { ...process.env };
{
  const tools = path.resolve(root, '..', 'tools', 'node_modules');
  const arch = process.arch === 'arm64' ? 'arm64' : 'x64';
  const ff = path.join(tools, 'ffmpeg-static', 'ffmpeg');
  const native = path.join(tools, '@ffprobe-installer', `darwin-${arch}`, 'ffprobe');
  const fp = fs.existsSync(native) ? native : path.join(tools, 'ffprobe-static', 'bin', 'darwin', arch, 'ffprobe');
  if (!childEnv.EXPLAINROO_FFMPEG && fs.existsSync(ff)) childEnv.EXPLAINROO_FFMPEG = ff;
  if (!childEnv.EXPLAINROO_FFPROBE && fs.existsSync(fp)) childEnv.EXPLAINROO_FFPROBE = fp;
}
function run(args, { quiet = false, tag = '' } = {}) {
  return new Promise((resolve) => {
    const child = spawn('node', args, { cwd: root, env: childEnv, stdio: ['ignore', 'pipe', 'pipe'] });
    let log = '';
    for (const [stream, out] of [[child.stdout, process.stdout], [child.stderr, process.stderr]]) {
      let buf = '';
      stream.on('data', (d) => { log += d; buf += d; let i; while ((i = buf.indexOf('\n')) >= 0) { if (!quiet) out.write(`${tag}${buf.slice(0, i)}\n`); buf = buf.slice(i + 1); } });
    }
    child.on('error', () => resolve({ code: 1, log }));
    child.on('close', (code) => resolve({ code: code ?? 1, log }));
  });
}
const cli = (cmd, dir, extra = []) => run([bin, cmd, dir, ...extra], { tag: `[${path.basename(dir)}] ` });

// ---------- images: one queue across all videos, one worker per picture maker ----------
const haveImage = (dir, base) => ['png', 'jpg', 'jpeg', 'webp', 'mp4', 'mov', 'webm', 'm4v'].some((e) => fs.existsSync(path.join(dir, 'assets', `${base}.${e}`)));
async function images() {
  const spec = laneArg || flagVal('lanes') || 'all';
  const lanes = spec === 'all' ? ['perchance', 'cloudflare', 'local'] : spec === 'both' ? ['perchance', 'local'] : spec.split(',');
  const queue = [];
  for (const s of shorts) {
    const dir = dirOf(s);
    const { SHOTS, STYLE, ASPECT } = await import(`${path.join(dir, 'shots.js')}?t=${Date.now()}`);
    for (const shot of SHOTS) if (!haveImage(dir, shot.file)) queue.push({ dir, file: shot.file, prompt: `${shot.prompt}. ${STYLE}`, aspect: ASPECT || '9:16' });
  }
  console.log(`${queue.length} picture(s) to make with ${lanes.join(' + ')} sharing one queue.`);
  const made = {};
  const failed = {};
  async function lane(model) {
    while (queue.length) {
      const job = queue.shift();
      console.log(`[${model}] ${path.basename(job.dir)}/${job.file}  (${queue.length} left in queue)`);
      let ok = false;
      for (let attempt = 0; attempt < 2 && !ok; attempt++) {
        const r = await run([bin, 'image', job.dir, job.file, job.prompt, '--aspect', job.aspect, '--model', model, '--no-style'], { quiet: true });
        ok = r.code === 0;
        if (!ok && attempt === 1) console.error(`[${model}] failed ${path.basename(job.dir)}/${job.file}: ${r.log.trim().split('\n').slice(-2).join(' | ')}`);
      }
      if (ok) { made[model] = (made[model] || 0) + 1; failed[model] = 0; continue; }
      failed[model] = (failed[model] || 0) + 1;
      queue.push(job); // another lane may do it
      if (failed[model] >= 3) { console.error(`[${model}] stopping after 3 failures in a row`); return; }
    }
  }
  await Promise.all(lanes.map(lane));
  console.log(`pictures made: ${Object.entries(made).map(([m, n]) => `${n} by ${m}`).join(', ') || 'none'}`);
  if (queue.length) { console.error(`${queue.length} picture(s) still missing; run \`images\` again (finished ones are kept).`); return false; }
  return true;
}

async function voice() {
  for (const s of shorts) {
    const dir = dirOf(s);
    await cli('voice', dir);
    await cli('check', dir);
  }
}

async function render() {
  const results = [];
  for (const s of shorts) {
    const dir = dirOf(s);
    const r = await cli('render', dir, hasFlag('draft') ? ['--draft'] : []);
    const v = r.code === 0 ? await cli('verify', dir, hasFlag('draft') ? ['--file', 'out/draft.mp4'] : []) : null;
    results.push({ dir: path.relative(root, dir), render: r.code, verify: v ? v.code : '-' });
  }
  console.log('\nsummary:');
  for (const r of results) console.log(`  ${r.dir}: render ${r.render === 0 ? 'ok' : 'FAILED'}, verify ${r.verify === 0 ? 'ok' : r.verify}`);
}

switch (command) {
  case 'plan': plan(); break;
  case 'build': build(); break;
  case 'images': build(); await images(); break;
  case 'voice': build(); await voice(); break;
  case 'render': await render(); break;
  case 'make': {
    build();
    await Promise.all([images(), voice()]);
    await render();
    break;
  }
  default: console.error(`unknown command ${command}`); process.exit(1);
}

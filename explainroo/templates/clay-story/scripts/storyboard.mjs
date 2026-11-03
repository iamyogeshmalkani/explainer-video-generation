#!/usr/bin/env node
// A sheet of the finished pictures with the narration under each, to check that (1) every picture shows what its words say and
// (2) every character looks the same from picture to picture.
//
//   node scripts/storyboard.mjs <project>                  out/storyboard-1.png, -2.png ... (20 shots a page)
//   node scripts/storyboard.mjs <project> --who mira       only the shots with this character: compare the face, the height, the clothes
//   node scripts/storyboard.mjs <project> --from 5 --to 12
// Remake a picture that does not match with:  node scripts/shot-images.mjs <project> --perchance --only 7  (delete assets/shot07.* first)
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const args = process.argv.slice(2);
const val = (n) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : null; };
const project = path.resolve(args.find((a, i) => !a.startsWith('--') && !['--who', '--from', '--to'].includes(args[i - 1])) || '.');
const mod = await import(`${pathToFileURL(path.join(project, 'shots.js')).href}?t=${Date.now()}`);
const ffmpeg = process.env.EXPLAINROO_FFMPEG || 'ffmpeg';
const font = ['/System/Library/Fonts/Supplemental/Arial.ttf', '/Library/Fonts/Arial.ttf', '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 'C:/Windows/Fonts/arial.ttf'].find((f) => fs.existsSync(f));
const who = val('who');
const from = Number(val('from') || 1);
const to = Number(val('to') || 1e9);
const list = mod.SHOTS.filter((s) => s.n >= from && s.n <= to && (!who || (s.who || []).includes(who)));
const found = list.map((s) => ({ s, f: ['png', 'jpg', 'jpeg', 'webp'].map((e) => path.join(project, 'assets', `${mod.fileOf(s)}.${e}`)).find(fs.existsSync) })).filter((x) => x.f);
if (!found.length) { console.error('no pictures yet for these shots'); process.exit(1); }
const W = 300, TXT = 74, COLS = 5, PER = 20;
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'story-'));
const wrap = (t, n) => { const out = ['']; for (const w of t.split(' ')) { const l = out[out.length - 1]; if ((l + ' ' + w).trim().length > n && l) out.push(w); else out[out.length - 1] = (l + ' ' + w).trim(); } return out.slice(0, 4).join('\n'); };
fs.mkdirSync(path.join(project, 'out'), { recursive: true });
let page = 0;
for (let i = 0; i < found.length; i += PER) {
  const chunk = found.slice(i, i + PER);
  const a = ['-v', 'error', '-y'];
  const parts = chunk.map(({ s, f }, k) => {
    a.push('-i', f);
    const tf = path.join(tmp, `t${i + k}.txt`);
    fs.writeFileSync(tf, `${s.n}: ${wrap(s.says || '', 40)}`);
    const draw = font ? `,drawtext=fontfile=${font}:textfile=${tf}:x=6:y=${W + 6}:fontsize=15:fontcolor=white:line_spacing=3` : '';
    return `[${k}:v]scale=${W}:${W}:force_original_aspect_ratio=decrease,pad=${W}:${W + TXT}:(ow-iw)/2:0:black${draw}[v${k}]`;
  });
  const layout = chunk.map((_, k) => `${(k % COLS) * W}_${Math.floor(k / COLS) * (W + TXT)}`).join('|');
  const out = path.join(project, 'out', `storyboard${who ? `-${who}` : ''}-${++page}.png`);
  a.push('-filter_complex', `${parts.join(';')};${chunk.map((_, k) => `[v${k}]`).join('')}xstack=inputs=${chunk.length}:layout=${layout}[o]`, '-map', '[o]', '-frames:v', '1', out);
  execFileSync(ffmpeg, a);
  console.log(path.relative(process.cwd(), out));
}
fs.rmSync(tmp, { recursive: true, force: true });

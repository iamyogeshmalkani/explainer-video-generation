#!/usr/bin/env node
// Hindi (or another language) with captions in Roman letters ("Hinglish"): write the story as pairs, one line per phrase:
//
//   Saudi ke ek sheikh ne || सऊदी के एक शेख ने
//   ek 10 feet lamba hatta-katta || एक दस फ़ीट लंबा हट्टा-कट्टा
//
// Left of "||": the words the CAPTIONS show. Right: the words the VOICE says, the same number of words ("_" joins two spoken words
// that are one caption word: ए_आई). Punctuation: put it on both sides (the voice needs the danda "।" or "," for pauses; the captions break on it).
//   node scripts/pairs-to-script.mjs <project> <pairs.txt>      writes <project>/script.md ("# Title" = a line "# Title" in the pairs file)
// Set "language": "hi" and a Hindi voice in video.json (for the F5 voice and a cloned voice see explainroo/AGENTS.md).
import fs from 'node:fs';
import path from 'node:path';

const [project, file] = process.argv.slice(2).filter((a) => !a.startsWith('--'));
if (!project || !file) { console.error('usage: node scripts/pairs-to-script.mjs <project> <pairs.txt>'); process.exit(1); }
let title = path.basename(path.resolve(project));
const out = [];
fs.readFileSync(file, 'utf8').split('\n').forEach((raw, i) => {
  const line = raw.trim();
  if (!line || line.startsWith('>')) return;
  if (line.startsWith('# ')) { title = line.slice(2).trim(); return; }
  const [shown, spoken] = line.split('||').map((x) => x?.trim());
  if (!shown || !spoken) { console.error(`line ${i + 1}: expected "Roman words || spoken words"`); process.exit(1); }
  const a = shown.split(/\s+/);
  const b = spoken.split(/\s+/);
  if (a.length !== b.length) { console.error(`line ${i + 1}: ${a.length} caption words but ${b.length} spoken words:\n  ${shown}\n  ${spoken}`); process.exit(1); }
  out.push(a.map((w, k) => `{${w}|${b[k].replaceAll('_', ' ')}}`).join(' '));
});
const script = `# ${title}\n\n## story {transition=fade hold=1.2 lead=0.3}\n${out.join(' ')}\n`;
fs.writeFileSync(path.join(project, 'script.md'), script);
console.log(`wrote ${path.join(project, 'script.md')} (${out.length} lines)`);

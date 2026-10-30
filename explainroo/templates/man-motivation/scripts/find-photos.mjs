#!/usr/bin/env node
// Finds REAL, openly licensed photographs for a founder story on Wikimedia Commons (free, no key) and saves the best
// match for each shot as assets/<file>.jpg. Only pictures that may be reused are kept: public domain, CC0, CC BY and
// CC BY-SA. Every picture's author, licence and page are written to credits.json, credits.js (for the end card) and
// credits.md (paste it into the video description: most licences ask for credit).
//
//   node scripts/find-photos.mjs <project> --dry-run            list what would be searched
//   node scripts/find-photos.mjs <project> [--only 3,5]          find the missing photos (the best match for each query)
//   node scripts/find-photos.mjs <project> --only 3 --pick 3=2   use the 2nd candidate for shot 3 (see build/photos/shot03.json)
//   node scripts/find-photos.mjs <project> --search "Apple I computer 1976"   just show candidates for a search
//   node scripts/find-photos.mjs <project> --only 3 --redo       search again and replace the photo
//   add --verbose to --search to see each picture's description. A shot may also list `avoid: ['Bing Gordon']`:
//   candidates whose title or description contain one of those words are skipped (use it when a search finds the wrong person).
//   options: --min-width 1000 (smallest accepted picture), --candidates 8 (how many to keep per shot)
//
// A picture of a person is the photographer's work, not a likeness made for this video: always look at what was saved.
// Be gentle with the service: one request at a time, a pause between requests, a user agent that says what this is.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';

const args = process.argv.slice(2);
const flag = (n) => args.includes(`--${n}`);
const opt = (n, d) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : d; };
const project = path.resolve(args.find((a) => !a.startsWith('--')) || '.');
const only = opt('only') ? opt('only').split(',').map(Number) : null;
const picks = Object.fromEntries((opt('pick') || '').split(',').filter(Boolean).map((p) => p.split('=').map(Number)));
const MIN_WIDTH = Number(opt('min-width', 1000));
const KEEP = Number(opt('candidates', 8));
const API = 'https://commons.wikimedia.org/w/api.php';
const UA = 'ExplainerStudio/1.0 (local video tool; finds openly licensed photos for narrated videos)';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Licences that allow reuse with credit (or none). Commons only hosts free licences; this keeps odd ones out.
const OK_LICENSE = /^(public domain|pd\b|pdm|cc0|cc[ -]by(-sa)?[ -]\d|no known copyright|attribution|copyrighted free use)/i;
const NO_CREDIT = /^(public domain|pd\b|pdm|cc0|no known copyright)/i;
// Titles that are rarely a useful photograph for a story.
const SKIP_TITLE = /logo|signature|autograph|stamp|banknote|coin\b|flag of|coat of arms|map of|diagram|chart|graph\b|cartoon|caricature|painting|drawing|poster|screenshot|wax figure|statue/i;

// Searches and downloads are kept on disk (shared by every video), so a person who appears in several videos is asked for once.
const CACHE = path.join(process.env.EXPLAINROO_CACHE || path.join(os.homedir(), '.cache', 'explainroo'), 'commons');
fs.mkdirSync(path.join(CACHE, 'files'), { recursive: true });
const SEARCH_CACHE = path.join(CACHE, 'search.json');
const searchCache = fs.existsSync(SEARCH_CACHE) ? JSON.parse(fs.readFileSync(SEARCH_CACHE, 'utf8')) : {};

// A busy answer (429, 503) is waited out, as long as the service asks, instead of stopping the whole run.
async function polite(fetchIt, what, tries = 8) {
  for (let attempt = 1; attempt <= tries; attempt++) {
    const res = await fetchIt().catch(() => null);
    if (res?.ok) return res;
    if (attempt === tries) throw new Error(`Wikimedia Commons did not answer for ${what} (${res ? res.status : 'no connection'})`);
    const asked = Number(res?.headers.get('retry-after'));
    const wait = res && (res.status === 429 || res.status === 503) ? Math.min(120, asked > 0 ? asked + 2 : 20 * attempt) : 1.5 * attempt;
    if (res) console.log(`  (Commons says ${res.status}; waiting ${wait}s)`);
    await sleep(wait * 1000);
  }
}

async function api(params) {
  const url = `${API}?${new URLSearchParams({ format: 'json', formatversion: '2', ...params })}`;
  return (await polite(() => fetch(url, { headers: { 'User-Agent': UA } }), 'a search')).json();
}

const decode = (s) => String(s || '').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();

async function search(query) {
  if (searchCache[query]) return searchCache[query];
  const found = await searchLive(query);
  searchCache[query] = found;
  fs.writeFileSync(SEARCH_CACHE, JSON.stringify(searchCache));
  return found;
}

async function searchLive(query) {
  const j = await api({
    action: 'query', generator: 'search', gsrnamespace: '6', gsrsearch: `${query} filetype:bitmap`, gsrlimit: '30',
    prop: 'imageinfo', iiprop: 'url|size|mime|extmetadata', iiurlwidth: '1600',
    iiextmetadatafilter: 'LicenseShortName|LicenseUrl|Artist|ImageDescription|DateTimeOriginal|NonFree|Credit',
  });
  const tokens = query.toLowerCase().split(/[^a-z0-9]+/).filter((t) => t.length > 2);
  const out = [];
  for (const p of j.query?.pages || []) {
    const i = p.imageinfo?.[0];
    const m = i?.extmetadata || {};
    if (!i || !/^image\/(jpeg|png|webp)$/.test(i.mime)) continue;
    const license = decode(m.LicenseShortName?.value);
    const title = p.title.replace(/^File:/, '');
    if (!OK_LICENSE.test(license) || m.NonFree?.value === 'true' || SKIP_TITLE.test(title) || i.width < MIN_WIDTH) continue;
    const text = `${title} ${decode(m.ImageDescription?.value)}`.toLowerCase();
    const hits = tokens.filter((t) => text.includes(t)).length;
    const score = hits * 1.2 + (NO_CREDIT.test(license) ? 1.5 : 0) + Math.min(2, i.width / 1600) - (p.index || 0) * 0.04;
    out.push({
      title, score: Math.round(score * 100) / 100, width: i.width, height: i.height, license,
      licenseUrl: decode(m.LicenseUrl?.value) || null, author: decode(m.Artist?.value).slice(0, 80) || 'Unknown',
      date: decode(m.DateTimeOriginal?.value).slice(0, 40), description: decode(m.ImageDescription?.value).slice(0, 160),
      page: i.descriptionurl, url: i.thumburl && i.thumbwidth < i.width ? i.thumburl : i.url,
    });
  }
  return out.sort((a, b) => b.score - a.score);
}

// Portrait photos beat wide ones, and group shots ("A with B", meetings, teams) lose: the grid wants one face per cell.
// This runs after the cached search, so changing it needs no new request.
const GROUP = /\b(and|with|meets?|meeting|conference|summit|delegation|team|group|crowd|ceremony|cabinet|family)\b/i;
function rank(list, query = '') {
  const tokens = query.toLowerCase().split(/[^a-z0-9]+/).filter((x) => x.length > 2);
  const adj = (c) => {
    const r = c.width / c.height;
    const text = `${c.title} ${c.description}`.toLowerCase();
    const whole = tokens.length > 1 && tokens.every((x) => text.includes(x));
    return c.score + (r <= 1.0 ? 1.5 : r <= 1.3 ? 0.8 : r > 1.8 ? -1 : 0) + (GROUP.test(c.title) ? -1.5 : 0)
      + (tokens.length > 1 ? (whole ? 1.5 : -3) : 0) + (/[^\x00-\x7F]/.test(c.title) ? -1 : 0);
  };
  return [...list].sort((a, b) => adj(b) - adj(a));
}

const show = (list) => list.forEach((c, k) => {
  console.log(`  ${k + 1}. ${c.title.slice(0, 64)}  ${c.width}x${c.height}  ${c.license}  ${c.author.slice(0, 28)}  (score ${c.score})`);
  if (flag('verbose') && c.description) console.log(`       ${c.description.slice(0, 150)}`);
});

if (flag('search')) {
  const found = await search(opt('search'));
  console.log(`${found.length} usable picture(s) for "${opt('search')}":`);
  show(found.slice(0, 12));
  process.exit(0);
}

if (!fs.existsSync(path.join(project, 'shots.js'))) { console.error(`no shots.js in ${project}`); process.exit(1); }
const { SHOTS } = await import(pathToFileURL(path.join(project, 'shots.js')).href);
const assets = path.join(project, 'assets');
fs.mkdirSync(assets, { recursive: true });
fs.mkdirSync(path.join(project, 'build', 'photos'), { recursive: true });
const have = (base) => ['jpg', 'jpeg', 'png', 'webp', 'mp4', 'mov', 'webm', 'm4v'].some((e) => fs.existsSync(path.join(assets, `${base}.${e}`)));
const creditsFile = path.join(project, 'credits.json');
const credits = fs.existsSync(creditsFile) ? JSON.parse(fs.readFileSync(creditsFile, 'utf8')) : {};
const wanted = SHOTS.filter((s) => s.query && (!only || only.includes(s.n)) && (flag('redo') || picks[s.n] || !have(s.file)));
console.log(`${wanted.length} photo(s) to find on Wikimedia Commons (only openly licensed pictures are used).`);
for (const s of wanted) console.log(`  shot ${String(s.n).padStart(2, '0')}  ${s.file}: ${s.query}`);
if (flag('dry-run')) { console.log('\n(dry run: nothing was searched)'); process.exit(0); }

const used = new Set(Object.values(credits).map((c) => c.title));
let missing = 0;
for (const shot of wanted) {
  const queries = [shot.query, ...(shot.alt || [])];
  let cands = [];
  for (const q of queries) {
    await sleep(700);
    const avoid = (shot.avoid || []).map((w) => w.toLowerCase());
    cands = rank(await search(q), q).filter((c) => (!used.has(c.title) || credits[shot.file]?.title === c.title) && !avoid.some((w) => `${c.title} ${c.description}`.toLowerCase().includes(w)));
    if (cands.length) break;
  }
  fs.writeFileSync(path.join(project, 'build', 'photos', `${shot.file}.json`), JSON.stringify(cands.slice(0, KEEP), null, 2));
  if (!cands.length) { console.log(`shot ${shot.n} ${shot.file}: NO usable picture for "${shot.query}". Try other words, --search, or an "alt" query.`); missing++; continue; }
  const chosen = cands[Math.min(cands.length, picks[shot.n] || 1) - 1];
  const key = path.join(CACHE, 'files', crypto.createHash('sha1').update(chosen.url).digest('hex'));
  let buf; let ext;
  if (fs.existsSync(`${key}.bin`)) { buf = fs.readFileSync(`${key}.bin`); ext = fs.readFileSync(`${key}.ext`, 'utf8'); } else {
    await sleep(700);
    let res;
    try { res = await polite(() => fetch(chosen.url, { headers: { 'User-Agent': UA } }), chosen.title); } catch (e) { console.log(`shot ${shot.n}: could not download ${chosen.title} (${e.message})`); missing++; continue; }
    buf = Buffer.from(await res.arrayBuffer());
    ext = /png/i.test(res.headers.get('content-type') || '') ? 'png' : /webp/i.test(res.headers.get('content-type') || '') ? 'webp' : 'jpg';
    fs.writeFileSync(`${key}.bin`, buf); fs.writeFileSync(`${key}.ext`, ext);
  }
  for (const e of ['jpg', 'jpeg', 'png', 'webp']) fs.rmSync(path.join(assets, `${shot.file}.${e}`), { force: true });
  fs.writeFileSync(path.join(assets, `${shot.file}.${ext}`), buf);
  used.delete(credits[shot.file]?.title);
  used.add(chosen.title);
  credits[shot.file] = { file: shot.file, n: shot.n, title: chosen.title, author: chosen.author, license: chosen.license, licenseUrl: chosen.licenseUrl, date: chosen.date, page: chosen.page, credit: !NO_CREDIT.test(chosen.license) };
  writeCredits();
  console.log(`shot ${shot.n} ${shot.file}: ${chosen.title.slice(0, 60)} (${chosen.width}x${chosen.height}, ${chosen.license}, ${chosen.author.slice(0, 30)})${cands.length > 1 ? `; ${cands.length - 1} other candidate(s) in build/photos/${shot.file}.json` : ''}`);
}

// credits.json is the record; credits.js feeds the end card; credits.md goes in the video description.
// Written after every photo, so a stop half way loses nothing.
function writeCredits() {
  const list = SHOTS.map((s) => credits[s.file]).filter(Boolean);
  fs.writeFileSync(creditsFile, JSON.stringify(credits, null, 2));
  fs.writeFileSync(path.join(project, 'credits.js'), `// Written by scripts/find-photos.mjs. Do not edit by hand.\nexport default ${JSON.stringify(list.map(({ file, title, author, license, credit }) => ({ file, title, author, license, credit })), null, 2)};\n`);
  const md = ['# Photo credits', '', ...list.map((c) => `- ${c.title.replace(/\.\w+$/, '')}: ${c.author}, ${c.license}${c.licenseUrl ? ` (${c.licenseUrl})` : ''}. ${c.page}`), ''];
  fs.writeFileSync(path.join(project, 'credits.md'), md.join('\n'));
}
writeCredits();
console.log(`\ncredits written (credits.md for the description). ${missing ? `${missing} shot(s) still need a photo.` : 'Open every photo in assets/ and check it fits the line it is under.'}`);
process.exit(missing ? 1 : 0);

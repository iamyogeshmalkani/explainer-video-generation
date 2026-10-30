#!/usr/bin/env node
// Makes the missing clay backdrops and puppets with explainroo's `image` command.
//
//   node scripts/shot-images.mjs <project-folder> --dry-run            list what would be made (add --puppets or --backdrops to do only one kind)
//   node scripts/shot-images.mjs <project-folder> --local [--only 3,yeast]        free: runs on this computer (mflux), nothing is sent anywhere
//   node scripts/shot-images.mjs <project-folder> --perchance [--only 3,yeast]    free: perchance.org in a Chrome window (no key); prompts are sent to that website
//   node scripts/shot-images.mjs <project-folder> --both [--only 3,yeast]        local AND Perchance at the same time, each taking the next missing picture
//   node scripts/shot-images.mjs <project-folder> --cloudflare [--only 3,yeast]   Cloudflare Workers AI; needs CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID in .env; prompts are sent to Cloudflare
//   node scripts/shot-images.mjs <project-folder> --all [--only 3,yeast]         local, Perchance and Cloudflare at the same time
//   node scripts/shot-images.mjs <project-folder> --pollinations [--only 3,yeast] fast, hosted FLUX; needs POLLINATIONS_API_KEY; prompts are sent to pollinations.ai
//   node scripts/shot-images.mjs <project-folder> --yes [--cheap] [--only 3,yeast]  OpenRouter: COSTS MONEY (about 7 to 13 cents a picture, about half with --cheap)
//
// Perchance works in several browser tabs at once (3 by default; --tabs N or EXPLAINROO_PERCHANCE_TABS, 1 to 6), each
// tab taking the next missing picture. --tabs 1 goes back to one picture at a time.
//
// OpenRouter needs OPENROUTER_API_KEY in the environment or in a .env file (never put it in a script).
// With --both or --all the lanes share one list of missing pictures, so the faster lane does more of them. The
// models draw in slightly different styles; if the video looks uneven, remake the odd ones with one model
// (delete the file, run again with --only). Look at every picture afterwards: picture models get details wrong.
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const args = process.argv.slice(2);
const project = path.resolve(args.find((a, i) => !a.startsWith('--') && !['--only', '--tabs'].includes(args[i - 1])) || '.');
const flag = (n) => args.includes(`--${n}`);
const only = (() => { const i = args.indexOf('--only'); return i >= 0 ? args[i + 1].split(',') : null; })(); // shot numbers (3,5) or file names (yeast,shot03)
const tabs = (() => {
  const i = args.indexOf('--tabs');
  const n = Math.floor(Number(i >= 0 ? args[i + 1] : process.env.EXPLAINROO_PERCHANCE_TABS));
  return Math.min(6, Math.max(1, Number.isFinite(n) && n > 0 ? n : 3));
})();
const bin = path.resolve(project, '../../bin/explainroo.js');
if (!fs.existsSync(path.join(project, 'shots.js'))) { console.error(`no shots.js in ${project}`); process.exit(1); }
if (!fs.existsSync(bin)) { console.error(`cannot find explainroo at ${bin}; run this from a project inside explainroo/videos/`); process.exit(1); }

const { SHOTS, PUPPETS = [], STYLE, ASPECT, PUPPET_STYLE, PUPPET_ASPECT } = await import(pathToFileURL(path.join(project, 'shots.js')).href);
// Backdrops are full-frame scenes; puppets are square pictures on a plain white background (they get cut out).
const JOBS = [
  ...(flag('puppets') ? [] : SHOTS.map((x) => ({ ...x, kind: 'backdrop', style: STYLE, aspect: ASPECT || '9:16' }))),
  ...(flag('backdrops') ? [] : PUPPETS.map((x) => ({ ...x, kind: 'puppet', style: PUPPET_STYLE, aspect: PUPPET_ASPECT || '1:1' }))),
];
const have = (base) => ['png', 'jpg', 'jpeg', 'webp', 'mp4', 'mov', 'webm', 'm4v'].some((e) => fs.existsSync(path.join(project, 'assets', `${base}.${e}`)));
const todo = JOBS.filter((s) => !have(s.file) && (!only || only.includes(s.file) || (s.kind === 'backdrop' && only.includes(String(s.n)))));

const makers = flag('all') ? ['perchance', 'cloudflare', 'local'] : flag('both') ? ['perchance', 'local']
  : [flag('perchance') ? 'perchance' : flag('cloudflare') ? 'cloudflare' : flag('pollinations') ? 'pollinations' : flag('local') ? 'local' : flag('cheap') ? 'cheap' : 'best'];
// Perchance gets one lane per browser tab (never more tabs than pictures); the other makers get one lane each.
const lanes = makers.flatMap((m) => m === 'perchance' ? Array.from({ length: Math.max(1, Math.min(tabs, todo.length)) }, (_, i) => ({ model: m, name: `perchance#${i + 1}` })) : [{ model: m, name: m }]);
const multi = lanes.length > 1;
const free = makers.every((m) => ['local', 'perchance', 'cloudflare', 'pollinations'].includes(m));
const describe = {
  local: 'on this computer (free, about 2 minutes each at 576x1024 on an M2)',
  perchance: `with perchance.org in ${tabs} Chrome tab${tabs === 1 ? '' : 's'} at a time (free, about 20 to 30 seconds each; prompts are sent to that website)`,
  cloudflare: 'with Cloudflare Workers AI (about 5 seconds each, free daily allowance; prompts are sent to Cloudflare)',
  pollinations: 'with hosted FLUX on pollinations.ai (about 10 seconds each; prompts are sent to that website)',
};

if (multi) console.log(`${todo.length} picture(s) to make, ${lanes.length} at a time (${lanes.map((l) => l.name).join(', ')}), each lane taking the next missing picture.`);
else if (describe[makers[0]]) console.log(`${todo.length} picture(s) to make ${describe[makers[0]]}.`);
else console.log(`${todo.length} picture(s) to make with --model ${makers[0]}; about ${(todo.length * (makers[0] === 'best' ? 0.07 : 0.035)).toFixed(2)} to ${(todo.length * (makers[0] === 'best' ? 0.13 : 0.065)).toFixed(2)} dollars (estimate).`);
for (const s of todo) console.log(`  ${s.kind === 'puppet' ? 'puppet' : 'shot  '} ${s.file}: ${s.prompt}`);
if (flag('dry-run') || !(free || flag('yes'))) { console.log(flag('dry-run') ? '\n(dry run: nothing was made)' : '\nAdd --yes to make them.'); process.exit(0); }

// Runs `explainroo image` for one shot with one model; every output line is tagged with the lane name when two lanes run.
function makeOne(shot, { model, name }) {
  return new Promise((resolve) => {
    const prompt = `${shot.prompt}. ${shot.style}`;
    console.log(`making ${shot.file} ${multi ? `with ${name} ` : ''}...`);
    const child = spawn('node', [bin, 'image', project, shot.file, prompt, '--aspect', shot.aspect, '--model', model, '--no-style'], { stdio: ['ignore', 'pipe', 'pipe'] });
    const tag = multi ? `[${name}] ` : '';
    for (const [stream, out] of [[child.stdout, process.stdout], [child.stderr, process.stderr]]) {
      let buf = '';
      stream.on('data', (d) => {
        buf += d;
        let i;
        while ((i = buf.indexOf('\n')) >= 0) { out.write(`${tag}${buf.slice(0, i)}\n`); buf = buf.slice(i + 1); }
      });
      stream.on('end', () => { if (buf) out.write(`${tag}${buf}\n`); });
    }
    child.on('error', () => resolve(1));
    child.on('close', (code) => resolve(code ?? 1));
  });
}

const queue = [...todo];
const made = {};
let stopped = false;
async function lane(l, index) {
  const { model, name } = l;
  // Start the lanes a few seconds apart: the first Perchance tab opens Chrome, the others join it.
  if (index > 0) await new Promise((r) => setTimeout(r, Math.min(index, 5) * 2500));
  while (queue.length && !stopped) {
    const shot = queue.shift();
    const code = await makeOne(shot, l);
    if (code === 0) { made[model] = (made[model] || 0) + 1; continue; }
    if (multi) {
      // This lane is out (no Chrome, check not completed, model not installed...): give the picture to the other lane.
      console.error(`${name} could not make ${shot.file}; leaving the rest to the other lanes.`);
      queue.unshift(shot);
      return;
    }
    console.error(`stopped at ${shot.file}; fix the problem above and run again (finished pictures are kept).`);
    stopped = true;
    queue.unshift(shot);
  }
}
await Promise.all(lanes.map(lane));
if (queue.length) { console.error(`${queue.length} picture(s) are still missing: ${queue.map((s) => s.file).join(', ')}. Run the command again (finished pictures are kept).`); process.exit(1); }
console.log(`done${multi ? ` (${Object.entries(made).map(([m, n]) => `${n} by ${m}`).join(', ')})` : ''}. Open every picture in assets/ and remake any that look wrong.`);

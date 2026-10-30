#!/usr/bin/env node
// Makes the missing shot pictures with explainroo's `image` command.
//
//   node scripts/shot-images.mjs <project-folder> --dry-run            list what would be made
//   node scripts/shot-images.mjs <project-folder> --local [--only 3,5,7]        free: runs on this computer (mflux), nothing is sent anywhere
//   node scripts/shot-images.mjs <project-folder> --perchance [--only 3,5,7]    free: perchance.org in a Chrome window (no key); prompts are sent to that website
//   node scripts/shot-images.mjs <project-folder> --both [--only 3,5,7]        local AND Perchance at the same time, each taking the next missing picture
//   node scripts/shot-images.mjs <project-folder> --cloudflare [--only 3,5,7]   Cloudflare Workers AI; needs CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID in .env; prompts are sent to Cloudflare
//   node scripts/shot-images.mjs <project-folder> --all [--only 3,5,7]         local, Perchance and Cloudflare at the same time
//   node scripts/shot-images.mjs <project-folder> --pollinations [--only 3,5,7] fast, hosted FLUX; needs POLLINATIONS_API_KEY; prompts are sent to pollinations.ai
//
// With --both or --all the lanes share one list of missing pictures, so the faster lane does more of them. The
// models draw in slightly different styles; if the video looks uneven, remake the odd ones with one model
// (delete the file, run again with --only). Look at every picture afterwards: picture models get details wrong.
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const args = process.argv.slice(2);
const project = path.resolve(args.find((a) => !a.startsWith('--')) || '.');
const flag = (n) => args.includes(`--${n}`);
const only = (() => { const i = args.indexOf('--only'); return i >= 0 ? args[i + 1].split(',').map(Number) : null; })();
const bin = path.resolve(project, '../../bin/explainroo.js');
if (!fs.existsSync(path.join(project, 'shots.js'))) { console.error(`no shots.js in ${project}`); process.exit(1); }
if (!fs.existsSync(bin)) { console.error(`cannot find explainroo at ${bin}; run this from a project inside explainroo/videos/`); process.exit(1); }

const { SHOTS, STYLE, ASPECT } = await import(pathToFileURL(path.join(project, 'shots.js')).href);
const have = (base) => ['png', 'jpg', 'jpeg', 'webp', 'mp4', 'mov', 'webm', 'm4v'].some((e) => fs.existsSync(path.join(project, 'assets', `${base}.${e}`)));
const todo = SHOTS.filter((s) => !have(s.file) && (!only || only.includes(s.n)));

const lanes = flag('all') ? ['perchance', 'cloudflare', 'local'] : flag('both') ? ['perchance', 'local']
  : [flag('perchance') ? 'perchance' : flag('cloudflare') ? 'cloudflare' : flag('pollinations') ? 'pollinations' : flag('local') ? 'local' : 'perchance'];
const multi = lanes.length > 1;
const free = lanes.every((m) => ['local', 'perchance', 'cloudflare', 'pollinations'].includes(m));
const describe = {
  local: 'on this computer (free, about 2 minutes each at 576x1024 on an M2)',
  perchance: 'with perchance.org in a Chrome window (free, about 20 to 30 seconds each; prompts are sent to that website)',
  cloudflare: 'with Cloudflare Workers AI (about 5 seconds each, free daily allowance; prompts are sent to Cloudflare)',
  pollinations: 'with hosted FLUX on pollinations.ai (about 10 seconds each; prompts are sent to that website)',
};

if (multi) console.log(`${todo.length} picture(s) to make, ${lanes.length} at a time (${lanes.join(', ')}), each lane taking the next missing picture.`);
else if (describe[lanes[0]]) console.log(`${todo.length} picture(s) to make ${describe[lanes[0]]}.`);
for (const s of todo) console.log(`  shot ${String(s.n).padStart(2, '0')}  ${s.file}: ${s.prompt}`);
if (flag('dry-run')) { console.log('\n(dry run: nothing was made)'); process.exit(0); }

// Runs `explainroo image` for one shot with one model; every output line is tagged with the lane name when two lanes run.
function makeOne(shot, model) {
  return new Promise((resolve) => {
    const prompt = `${shot.prompt}. ${STYLE}`;
    console.log(`making ${shot.file} ${multi ? `with ${model} ` : ''}...`);
    const child = spawn('node', [bin, 'image', project, shot.file, prompt, '--aspect', ASPECT || '9:16', '--model', model, '--no-style'], { stdio: ['ignore', 'pipe', 'pipe'] });
    const tag = multi ? `[${model}] ` : '';
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
async function lane(model) {
  while (queue.length && !stopped) {
    const shot = queue.shift();
    const code = await makeOne(shot, model);
    if (code === 0) { made[model] = (made[model] || 0) + 1; continue; }
    if (multi) {
      // This lane is out (no Chrome, check not completed, model not installed...): give the picture to the other lane.
      console.error(`${model} could not make ${shot.file}; leaving the rest to the other lane.`);
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

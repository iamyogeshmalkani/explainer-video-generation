#!/usr/bin/env node
// Makes a depth map for every picture in assets/ so the parallax camera moves work
// (assets/shot01.png -> assets/shot01.depth.png; white is near, black is far).
//
//   node scripts/depth.mjs <project-folder> [--only shot01,shot05] [--redo] [--dry-run]
//
// Runs on this computer with torch (Apple GPU when available); nothing is sent anywhere.
// It needs the depth environment: python with torch and transformers. Set EXPLAINROO_DEPTH_PYTHON to
// its python, or install it in ~/.local/venvs/explainroo-depth (see "Image depth" in README.md).
// The first run downloads the depth model (about 100 MB).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
const flagValue = (n) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : ''; };
const project = path.resolve(args.find((a, i) => !a.startsWith('--') && args[i - 1] !== '--only') || '.');
const assets = path.join(project, 'assets');
if (!fs.existsSync(assets)) { console.error(`no assets folder in ${project}`); process.exit(1); }

const python = process.env.EXPLAINROO_DEPTH_PYTHON || path.join(os.homedir(), '.local/venvs/explainroo-depth/bin/python');
if (!fs.existsSync(python)) {
  console.error(`cannot find the depth python at ${python}\nInstall it once:\n  python3 -m venv ~/.local/venvs/explainroo-depth\n  ~/.local/venvs/explainroo-depth/bin/python -m pip install torch torchvision transformers\nor set EXPLAINROO_DEPTH_PYTHON.`);
  process.exit(1);
}

const pics = fs.readdirSync(assets).filter((f) => /\.(png|jpe?g|webp)$/i.test(f) && !/\.depth\.png$/i.test(f));
const missing = pics.filter((f) => !fs.existsSync(path.join(assets, `${f.replace(/\.[^.]+$/, '')}.depth.png`)));
console.log(`${pics.length} picture(s), ${missing.length} without a depth map${missing.length ? `: ${missing.join(', ')}` : ''}`);
if (args.includes('--dry-run')) process.exit(0);

const script = path.join(path.dirname(fileURLToPath(import.meta.url)), 'depth.py');
const pyArgs = [script, assets];
if (flagValue('only')) pyArgs.push('--only', flagValue('only'));
if (args.includes('--redo')) pyArgs.push('--redo');
const r = spawnSync(python, pyArgs, { stdio: 'inherit', env: { ...process.env, HF_HUB_DISABLE_XET: '1', PYTHONWARNINGS: 'ignore' } });
process.exit(r.status ?? 1);

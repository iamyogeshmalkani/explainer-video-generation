// Optional illustrations through OpenRouter. Needs OPENROUTER_API_KEY in the
// environment or in a .env file in the project folder or the explainroo
// folder. Every request is logged with its cost in build/images/usage.jsonl.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import os from 'node:os';
import { spawn } from 'node:child_process';
import { findEnv } from './env.js';
import { ProjectError } from './project.js';
import { perchanceImages } from './perchance.js';

export const IMAGE_MODELS = {
  best: 'openai/gpt-5.4-image-2',
  cheap: 'google/gemini-3.1-flash-image',
  // Runs on this computer with mflux (Z-Image-Turbo on Apple Silicon): free, no API key, no refs.
  local: 'local/z-image-turbo',
  // Pollinations.ai (FLUX), fast and hosted: needs POLLINATIONS_API_KEY, sends the prompt to that service, no refs.
  pollinations: 'pollinations/flux',
  // perchance.org's free generator, driven in a Chrome window (no API, no key, no refs): see src/perchance.js.
  perchance: 'perchance/text-to-image',
  // Cloudflare Workers AI (FLUX.1 schnell for square pictures, SDXL Lightning for other shapes): needs CLOUDFLARE_API_TOKEN and
  // CLOUDFLARE_ACCOUNT_ID, sends the prompt to Cloudflare, no refs. Has a free daily allowance.
  cloudflare: 'cloudflare/workers-ai',
};

const CLOUDFLARE_FLUX = '@cf/black-forest-labs/flux-1-schnell';
const CLOUDFLARE_SDXL = '@cf/bytedance/stable-diffusion-xl-lightning';
// SDXL sizes (multiples of 8, about one megapixel) per aspect ratio; FLUX schnell always makes square pictures.
const CLOUDFLARE_SIZES = {
  '16:9': [1344, 768], '9:16': [768, 1344], '1:1': [1024, 1024], '4:3': [1152, 896],
  '3:4': [896, 1152], '3:2': [1216, 832], '2:3': [832, 1216],
};

// Picture size per aspect ratio for Pollinations (the server does the work, so it can be larger).
const POLLINATIONS_SIZES = {
  '16:9': [1280, 720], '9:16': [720, 1280], '1:1': [1024, 1024], '4:3': [1152, 864],
  '3:4': [864, 1152], '3:2': [1152, 768], '2:3': [768, 1152],
};

// Picture size (multiples of 16) per aspect ratio for the local model, sized for a 16 GB Mac.
const LOCAL_SIZES = {
  '16:9': [1024, 576], '9:16': [576, 1024], '1:1': [768, 768], '4:3': [896, 672],
  '3:4': [672, 896], '3:2': [960, 640], '2:3': [640, 960],
};
const LOCAL_STEPS = 8;
// Pre-quantized 4-bit Z-Image-Turbo (about 6 GB); fits a 16 GB Mac. Override with EXPLAINROO_LOCAL_IMAGE_MODEL.
const LOCAL_MODEL = 'filipstrand/Z-Image-Turbo-mflux-4bit';

const ASPECTS = ['16:9', '9:16', '1:1', '4:3', '3:4', '3:2', '2:3'];

export const DEFAULT_STYLE =
  'Flat illustration for a friendly how-to video, soft colors, simple shapes, clear subject in the middle, plain light background, no text, no letters, no numbers, no logos, no watermark.';

export function findKey(projectDir) {
  return findEnv('OPENROUTER_API_KEY', projectDir);
}

export function resolveModel(name) {
  if (!name) return IMAGE_MODELS.best;
  if (IMAGE_MODELS[name]) return IMAGE_MODELS[name];
  if (/^[\w.-]+\/[\w.:-]+$/.test(name)) return name;
  throw new ProjectError(`image model must be "best", "cheap", "local", "pollinations", "perchance", "cloudflare" or an OpenRouter model id like ${IMAGE_MODELS.best}`);
}

function toDataUrl(file) {
  const ext = path.extname(file).toLowerCase().slice(1);
  const mime = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : ext === 'webp' ? 'image/webp' : 'image/png';
  return `data:${mime};base64,${fs.readFileSync(file).toString('base64')}`;
}


function mfluxBin() {
  const candidates = [process.env.EXPLAINROO_MFLUX, path.join(os.homedir(), '.local/bin/mflux-generate-z-image-turbo')].filter(Boolean);
  return candidates.find((f) => fs.existsSync(f));
}

function runMflux(bin, args, log) {
  return new Promise((resolve, reject) => {
    const child = spawn(bin, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let tail = '';
    const keep = (d) => { tail = (tail + d).slice(-1500); };
    child.stdout.on('data', keep);
    child.stderr.on('data', keep);
    child.on('error', reject);
    child.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`mflux failed (exit ${code}): ${tail.trim().split('\n').slice(-6).join('\n')}`))));
    log('making the picture on this computer (first run loads the model and takes longer)');
  });
}

function saveAndLog(project, { name, file, buf, entry }) {
  const logDir = path.join(project.paths.build, 'images');
  fs.mkdirSync(logDir, { recursive: true });
  const full = {
    time: new Date().toISOString(),
    name,
    file: path.relative(project.dir, file),
    ...entry,
    bytes: buf.length,
    sha256: crypto.createHash('sha256').update(buf).digest('hex').slice(0, 16),
  };
  fs.appendFileSync(path.join(logDir, 'usage.jsonl'), JSON.stringify(full) + '\n');
  return full;
}

async function generateLocal(project, { name, text, prompt, ratio, styleText, refs, seed, log }) {
  if (refs.length) throw new ProjectError('the local model makes pictures from text only; --ref needs an OpenRouter model (--model best or cheap)');
  const bin = mfluxBin();
  if (!bin) throw new ProjectError('the local image model is not installed. Install it with: uv tool install --python 3.13 mflux (then: uv pip install --python ~/.local/share/uv/tools/mflux/bin/python "pillow<13"), or set EXPLAINROO_MFLUX to the mflux-generate-z-image-turbo path.');
  const [width, height] = LOCAL_SIZES[ratio];
  const assets = path.join(project.dir, 'assets');
  fs.mkdirSync(assets, { recursive: true });
  for (const e of ['png', 'jpg', 'webp']) fs.rmSync(path.join(assets, `${name}.${e}`), { force: true });
  const file = path.join(assets, `${name}.png`);
  const usedSeed = Number.isInteger(seed) ? seed : Math.floor(Math.random() * 2 ** 31);
  const t0 = Date.now();
  await runMflux(bin, ['--model', process.env.EXPLAINROO_LOCAL_IMAGE_MODEL || LOCAL_MODEL, '--base-model', 'z-image-turbo', '--prompt', text, '--width', String(width), '--height', String(height), '--steps', String(LOCAL_STEPS), '--seed', String(usedSeed), '--output', file], log);
  if (!fs.existsSync(file)) throw new Error('the local model finished but wrote no picture');
  const buf = fs.readFileSync(file);
  const entry = saveAndLog(project, {
    name, file, buf,
    entry: { provider: 'local', model: IMAGE_MODELS.local, served_by: 'mflux', aspect: ratio, size: `${width}x${height}`, seed: usedSeed, prompt: prompt.trim(), style: styleText, refs, cost_usd: 0, seconds: Math.round((Date.now() - t0) / 100) / 10 },
  });
  return { ...entry, file, total_usd: imageSpend(project) };
}

async function generatePollinations(project, { name, prompt, ratio, styleText, refs, seed, log }) {
  if (refs.length) throw new ProjectError('the Pollinations model makes pictures from text only; --ref needs an OpenRouter model (--model best or cheap)');
  const key = findEnv('POLLINATIONS_API_KEY', project.dir);
  if (!key) throw new ProjectError('Pollinations needs an API key. Set POLLINATIONS_API_KEY or put POLLINATIONS_API_KEY=... in a .env file in the explainroo folder.');
  const [width, height] = POLLINATIONS_SIZES[ratio];
  const usedSeed = Number.isInteger(seed) ? seed : Math.floor(Math.random() * 2 ** 31);
  const text = `${prompt.trim()}${styleText ? `. ${styleText}` : ''}`;
  const url = `https://gen.pollinations.ai/image/${encodeURIComponent(text)}?model=flux&width=${width}&height=${height}&seed=${usedSeed}&nologo=true`;
  const t0 = Date.now();
  let res;
  // The service sometimes answers 401 or 429 to a valid key (it comes and goes), so those are retried a few times.
  const tries = 8;
  for (let attempt = 1; attempt <= tries; attempt++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 180000);
    try {
      res = await fetch(url, { signal: ctrl.signal, headers: { Authorization: `Bearer ${key}` } });
    } catch (e) {
      if (attempt === tries) throw new Error(`Pollinations request failed: ${e.name === 'AbortError' ? 'no answer after 3 minutes' : e.message}`);
      log('Pollinations did not answer, trying again');
      continue;
    } finally {
      clearTimeout(timer);
    }
    if ((res.status === 401 || res.status === 403 || res.status === 429 || res.status >= 500) && attempt < tries) {
      const wait = Math.min(8, attempt * 2);
      log(`Pollinations returned ${res.status}, trying again in ${wait} seconds (${attempt}/${tries})`);
      await new Promise((r) => setTimeout(r, wait * 1000));
      continue;
    }
    break;
  }
  if (res.status === 401 || res.status === 403) throw new ProjectError(`Pollinations rejected the API key on all ${tries} tries. It may be revoked or out of credit: check it at enter.pollinations.ai.`);
  if (!res.ok) throw new Error(`Pollinations error: HTTP ${res.status} ${(await res.text().catch(() => '')).slice(0, 200)}`);
  const type = res.headers.get('content-type') || '';
  if (!type.startsWith('image/')) throw new Error(`Pollinations returned ${type || 'no picture'} instead of an image`);
  const ext = type.includes('png') ? 'png' : type.includes('webp') ? 'webp' : 'jpg';
  const buf = Buffer.from(await res.arrayBuffer());
  const assets = path.join(project.dir, 'assets');
  fs.mkdirSync(assets, { recursive: true });
  for (const e of ['png', 'jpg', 'jpeg', 'webp']) fs.rmSync(path.join(assets, `${name}.${e}`), { force: true });
  const file = path.join(assets, `${name}.${ext}`);
  fs.writeFileSync(file, buf);
  const entry = saveAndLog(project, {
    name, file, buf,
    entry: { provider: 'pollinations', model: IMAGE_MODELS.pollinations, served_by: 'gen.pollinations.ai', aspect: ratio, size: `${width}x${height}`, seed: usedSeed, prompt: prompt.trim(), style: styleText, refs, cost_usd: null, seconds: Math.round((Date.now() - t0) / 100) / 10 },
  });
  return { ...entry, file, total_usd: imageSpend(project) };
}

async function generateCloudflare(project, { name, prompt, ratio, styleText, refs, seed, log }) {
  if (refs.length) throw new ProjectError('the Cloudflare model makes pictures from text only; --ref needs an OpenRouter model (--model best or cheap)');
  const token = findEnv('CLOUDFLARE_API_TOKEN', project.dir);
  const account = findEnv('CLOUDFLARE_ACCOUNT_ID', project.dir);
  if (!token) throw new ProjectError('Cloudflare needs an API token. Put CLOUDFLARE_API_TOKEN=... in a .env file in the explainroo folder (a token with the "Workers AI" permission).');
  if (!account) throw new ProjectError('Cloudflare also needs your account ID. Put CLOUDFLARE_ACCOUNT_ID=... in the .env file in the explainroo folder (the long hex id in your dashboard URL, dash.cloudflare.com/<account id>/...).');
  const model = process.env.EXPLAINROO_CLOUDFLARE_MODEL || (ratio === '1:1' ? CLOUDFLARE_FLUX : CLOUDFLARE_SDXL);
  const [width, height] = CLOUDFLARE_SIZES[ratio];
  const usedSeed = Number.isInteger(seed) ? seed : Math.floor(Math.random() * 2 ** 31);
  const text = `${prompt.trim()}${styleText ? `, ${styleText}` : ''}`;
  const body = /flux/i.test(model) ? { prompt: text, steps: 6 } : { prompt: text, width, height, seed: usedSeed };
  const url = `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(account)}/ai/run/${model}`;
  const t0 = Date.now();
  const tries = 3;
  let res;
  for (let attempt = 1; attempt <= tries; attempt++) {
    try {
      res = await fetch(url, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: AbortSignal.timeout(120000) });
    } catch (e) {
      if (attempt === tries) throw new Error(`Cloudflare did not answer: ${e.message}`);
      log('Cloudflare did not answer, trying again');
      continue;
    }
    if ((res.status === 429 || res.status >= 500) && attempt < tries) {
      const wait = attempt * 4;
      log(`Cloudflare returned ${res.status}, trying again in ${wait} seconds (${attempt}/${tries})`);
      await new Promise((r) => setTimeout(r, wait * 1000));
      continue;
    }
    break;
  }
  const type = res.headers.get('content-type') || '';
  let buf;
  if (type.startsWith('image/')) {
    buf = Buffer.from(await res.arrayBuffer());
  } else {
    const json = await res.json().catch(() => null);
    const problem = json?.errors?.map((e) => e.message).filter(Boolean).join('; ');
    if (res.status === 401 || res.status === 403) throw new ProjectError(`Cloudflare rejected the token (${problem || res.status}). It needs the "Workers AI" permission for this account.`);
    if (!res.ok || json?.success === false) throw new Error(`Cloudflare error: ${problem || `HTTP ${res.status}`}`);
    const b64 = json?.result?.image;
    if (!b64) throw new Error('Cloudflare returned no picture. Try another wording.');
    buf = Buffer.from(b64, 'base64');
  }
  const ext = buf[0] === 0x89 && buf[1] === 0x50 ? 'png' : 'jpg';
  const assets = path.join(project.dir, 'assets');
  fs.mkdirSync(assets, { recursive: true });
  for (const e of ['png', 'jpg', 'jpeg', 'webp']) fs.rmSync(path.join(assets, `${name}.${e}`), { force: true });
  const file = path.join(assets, `${name}.${ext}`);
  fs.writeFileSync(file, buf);
  const entry = saveAndLog(project, {
    name, file, buf,
    entry: { provider: 'cloudflare', model, served_by: 'api.cloudflare.com', aspect: ratio, size: /flux/i.test(model) ? 'square' : `${width}x${height}`, prompt: prompt.trim(), style: styleText, refs, cost_usd: null, seconds: Math.round((Date.now() - t0) / 100) / 10 },
  });
  return { ...entry, file, total_usd: imageSpend(project) };
}

async function generatePerchance(project, { name, prompt, ratio, styleText, refs, log }) {
  if (refs.length) throw new ProjectError('the Perchance model makes pictures from text only; --ref needs an OpenRouter model (--model best or cheap)');
  const t0 = Date.now();
  const text = `${prompt.trim()}${styleText ? `, ${styleText}` : ''}`;
  const picks = await perchanceImages({ prompt: text, ratio, log });
  const assets = path.join(project.dir, 'assets');
  fs.mkdirSync(assets, { recursive: true });
  for (const e of ['png', 'jpg', 'jpeg', 'webp']) fs.rmSync(path.join(assets, `${name}.${e}`), { force: true });
  const file = path.join(assets, `${name}.jpg`);
  fs.writeFileSync(file, picks[0]);
  // The other candidates are kept, in case the first one is not the best (copy one over assets/<name>.jpg).
  const alts = path.join(project.paths.build, 'images', 'alternatives');
  fs.mkdirSync(alts, { recursive: true });
  picks.slice(1).forEach((b, i) => fs.writeFileSync(path.join(alts, `${name}-${i + 2}.jpg`), b));
  const entry = saveAndLog(project, {
    name, file, buf: picks[0],
    entry: { provider: 'perchance', model: IMAGE_MODELS.perchance, served_by: 'perchance.org', aspect: ratio, prompt: prompt.trim(), style: styleText, refs, candidates: picks.length, cost_usd: 0, seconds: Math.round((Date.now() - t0) / 100) / 10 },
  });
  return { ...entry, file, total_usd: imageSpend(project) };
}

// Generates one image and saves it as assets/<name>.<ext>.
export async function generateImage(project, { name, prompt, model, aspect, refs = [], style, seed, log = () => {} }) {
  if (!name || !/^[\w-]+$/.test(name)) throw new ProjectError('the image name may only use letters, digits, "-" and "_" (it becomes assets/<name>.png)');
  if (!prompt || prompt.trim().length < 8) throw new ProjectError('describe the image in a sentence or two');
  const cfg = project.config.images || {};
  const modelId = resolveModel(model || cfg.model);
  const ratio = aspect || (project.config.height > project.config.width ? '9:16' : project.config.height === project.config.width ? '1:1' : '16:9');
  if (!ASPECTS.includes(ratio)) throw new ProjectError(`aspect must be one of ${ASPECTS.join(', ')}`);
  const styleText = style === false ? '' : (style || cfg.style || DEFAULT_STYLE);
  const text = `${prompt.trim()}\n\nStyle: ${styleText}\nAspect ratio: ${ratio}.`.trim();
  if (modelId.startsWith('local/')) {
    return generateLocal(project, { name, text, prompt, ratio, styleText, refs, seed, log });
  }
  if (modelId.startsWith('cloudflare/')) {
    return generateCloudflare(project, { name, prompt, ratio, styleText, refs, seed, log });
  }
  if (modelId.startsWith('perchance/')) {
    return generatePerchance(project, { name, prompt, ratio, styleText, refs, log });
  }
  if (modelId.startsWith('pollinations/')) {
    return generatePollinations(project, { name, prompt, ratio, styleText, refs, seed, log });
  }
  const key = findKey(project.dir);
  if (!key) {
    throw new ProjectError('images need an OpenRouter API key. Ask the user for one (openrouter.ai/keys), then set OPENROUTER_API_KEY or put OPENROUTER_API_KEY=... in a .env file in the explainroo folder.');
  }
  const content = [{ type: 'text', text }];
  for (const r of refs) {
    // Accept paths relative to the project (assets/a.png) or to the current folder.
    const file = [path.resolve(project.dir, r), path.resolve(r)].find((f) => fs.existsSync(f));
    if (!file) throw new ProjectError(`reference image ${r} does not exist (use a path like assets/${path.basename(r)})`);
    content.push({ type: 'image_url', image_url: { url: toDataUrl(file) } });
  }
  const body = {
    model: modelId,
    messages: [{ role: 'user', content }],
    modalities: ['image', 'text'],
    image_config: { aspect_ratio: ratio },
    usage: { include: true },
  };
  const t0 = Date.now();
  let res;
  let json;
  for (let attempt = 1; attempt <= 2; attempt++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 300000);
    try {
      res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        signal: ctrl.signal,
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://explainroo.com',
          'X-Title': 'explainroo',
        },
        body: JSON.stringify(body),
      });
      json = await res.json().catch(() => null);
    } catch (e) {
      if (attempt === 2) throw new Error(`OpenRouter request failed: ${e.name === 'AbortError' ? 'no answer after 5 minutes' : e.message}`);
      log('OpenRouter did not answer, trying once more');
      continue;
    } finally {
      clearTimeout(timer);
    }
    if (res.status >= 500 && attempt === 1) {
      log(`OpenRouter returned ${res.status}, trying once more`);
      continue;
    }
    break;
  }
  if (!res.ok) {
    const msg = json?.error?.message || `HTTP ${res.status}`;
    if (res.status === 401) throw new ProjectError(`OpenRouter rejected the API key (${msg}). Ask the user to check it.`);
    if (res.status === 402) throw new ProjectError(`the OpenRouter account has no credit left (${msg}).`);
    throw new Error(`OpenRouter error: ${msg}`);
  }
  const msg = json?.choices?.[0]?.message;
  const url = msg?.images?.[0]?.image_url?.url;
  if (!url || !url.startsWith('data:')) {
    const said = typeof msg?.content === 'string' ? msg.content.slice(0, 300) : '';
    throw new Error(`the model returned no image${said ? `. It said: "${said}"` : ''}. Try another wording or the other model.`);
  }
  const [, mime, b64] = /^data:([^;]+);base64,(.*)$/s.exec(url) || [];
  const ext = mime === 'image/jpeg' ? 'jpg' : mime === 'image/webp' ? 'webp' : 'png';
  const assets = path.join(project.dir, 'assets');
  fs.mkdirSync(assets, { recursive: true });
  for (const e of ['png', 'jpg', 'webp']) fs.rmSync(path.join(assets, `${name}.${e}`), { force: true });
  const file = path.join(assets, `${name}.${ext}`);
  const buf = Buffer.from(b64, 'base64');
  fs.writeFileSync(file, buf);

  const usage = json.usage || {};
  const entry = {
    time: new Date().toISOString(),
    name,
    file: path.relative(project.dir, file),
    provider: 'openrouter',
    model: modelId,
    served_by: json.model || modelId,
    aspect: ratio,
    prompt: prompt.trim(),
    style: styleText,
    refs,
    cost_usd: typeof usage.cost === 'number' ? usage.cost : null,
    prompt_tokens: usage.prompt_tokens ?? null,
    completion_tokens: usage.completion_tokens ?? null,
    seconds: Math.round((Date.now() - t0) / 100) / 10,
    bytes: buf.length,
    sha256: crypto.createHash('sha256').update(buf).digest('hex').slice(0, 16),
  };
  const logDir = path.join(project.paths.build, 'images');
  fs.mkdirSync(logDir, { recursive: true });
  fs.appendFileSync(path.join(logDir, 'usage.jsonl'), JSON.stringify(entry) + '\n');
  return { ...entry, file, total_usd: imageSpend(project) };
}

export function imageLog(project) {
  const p = path.join(project.paths.build, 'images', 'usage.jsonl');
  if (!fs.existsSync(p)) return [];
  return fs.readFileSync(p, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));
}

export function imageSpend(project) {
  return Math.round(imageLog(project).reduce((a, e) => a + (e.cost_usd || 0), 0) * 10000) / 10000;
}

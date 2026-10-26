import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { generateImage } from '../src/images.js';

function fakeProject() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cf-img-'));
  return { dir, paths: { build: path.join(dir, 'build') }, config: { images: {}, width: 1080, height: 1920 } };
}
const JPEG = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 1, 2, 3, 4]);
const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 1, 2, 3, 4]);
const jsonRes = (obj, status = 200) => new Response(JSON.stringify(obj), { status, headers: { 'content-type': 'application/json' } });

async function withCloudflare(fn, handler) {
  const saved = { fetch: globalThis.fetch, t: process.env.CLOUDFLARE_API_TOKEN, a: process.env.CLOUDFLARE_ACCOUNT_ID };
  const calls = [];
  globalThis.fetch = async (url, init) => { calls.push({ url: String(url), init }); return handler(url, init, calls.length); };
  process.env.CLOUDFLARE_API_TOKEN = 'test-token';
  process.env.CLOUDFLARE_ACCOUNT_ID = 'abc123';
  try { await fn(calls); } finally {
    globalThis.fetch = saved.fetch;
    for (const [k, v] of [['CLOUDFLARE_API_TOKEN', saved.t], ['CLOUDFLARE_ACCOUNT_ID', saved.a]]) { if (v === undefined) delete process.env[k]; else process.env[k] = v; }
  }
}

test('cloudflare: square pictures use FLUX and decode the base64 reply', async () => {
  const project = fakeProject();
  await withCloudflare(async (calls) => {
    const r = await generateImage(project, { name: 'coins', prompt: 'A stack of gold coins', model: 'cloudflare', aspect: '1:1', style: 'flat sticker' });
    assert.equal(path.basename(r.file), 'coins.jpg');
    assert.deepEqual(fs.readFileSync(r.file), JPEG);
    assert.equal(calls.length, 1);
    assert.match(calls[0].url, /\/accounts\/abc123\/ai\/run\/@cf\/black-forest-labs\/flux-1-schnell$/);
    assert.equal(calls[0].init.headers.Authorization, 'Bearer test-token');
    const body = JSON.parse(calls[0].init.body);
    assert.equal(body.prompt, 'A stack of gold coins, flat sticker');
    assert.ok(body.steps >= 1 && body.steps <= 8);
  }, () => jsonRes({ success: true, errors: [], result: { image: JPEG.toString('base64') } }));
});

test('cloudflare: other shapes use SDXL with a size and accept a raw PNG reply', async () => {
  const project = fakeProject();
  await withCloudflare(async (calls) => {
    const r = await generateImage(project, { name: 'wide', prompt: 'A mountain lake at dawn', model: 'cloudflare', aspect: '9:16', style: false });
    assert.equal(path.basename(r.file), 'wide.png');
    assert.match(calls[0].url, /stable-diffusion-xl-lightning$/);
    const body = JSON.parse(calls[0].init.body);
    assert.deepEqual([body.width, body.height], [768, 1344]);
    assert.equal(body.prompt, 'A mountain lake at dawn');
  }, () => new Response(PNG, { status: 200, headers: { 'content-type': 'image/png' } }));
});

test('cloudflare: a rejected token gives a clear message and the secret is not leaked', async () => {
  const project = fakeProject();
  await withCloudflare(async () => {
    await assert.rejects(
      generateImage(project, { name: 'x', prompt: 'A stack of gold coins', model: 'cloudflare', aspect: '1:1' }),
      (e) => /Workers AI/.test(e.message) && !e.message.includes('test-token'),
    );
  }, () => jsonRes({ success: false, errors: [{ code: 10000, message: 'Authentication error' }] }, 403));
});

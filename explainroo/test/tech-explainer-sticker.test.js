import test from 'node:test';
import assert from 'node:assert/strict';
import { kit } from '../templates/tech-explainer/lib/kit.js';

// A stand-in for the scene API: it records every draw call and runs it against a recording canvas.
function run(build) {
  const draws = [];
  const calls = [];
  const ctx = new Proxy({}, {
    get: (_, k) => (k === 'measureText' ? () => ({ width: 100 }) : k === 'createLinearGradient' ? () => ({ addColorStop() {} }) : (...a) => calls.push([k, ...a])),
    set: () => true,
  });
  const s = {
    W: 1080, H: 1920, t: 2,
    safe: { x: 54, y: 100, w: 972, h: 1400 },
    time: (v) => (typeof v === 'number' ? v : 0),
    draw: (o, fn) => draws.push({ o, fn }),
    engine: { images: new Map(), icons: { rocket: ['M4 4h16v16H4z'], bug: ['M2 2l20 20'] } },
  };
  build(kit(s), s);
  return { draws, ctx, calls };
}

test('sticker draws one element that pops in with the default sound', () => {
  const { draws, ctx } = run((k) => k.sticker('rocket', { x: 0.8, y: 0.1, at: 1, out: 5 }));
  assert.equal(draws.length, 1);
  assert.equal(draws[0].o.sfx, 'pop');
  assert.equal(draws[0].o.out, 5);
  globalThis.Path2D ??= class {};
  assert.doesNotThrow(() => draws[0].fn(ctx, { p: 1, local: 1 }));
});

test('sticker supports an icon with a label, a burst and text only', () => {
  globalThis.Path2D ??= class {};
  const { draws, ctx } = run((k) => {
    k.sticker('bug', { label: 'Bug!', shape: 'burst', color: 'red', from: 'slap', id: 'bug' });
    k.sticker(null, { label: 'New', color: '#ff00aa' });
  });
  assert.equal(draws.length, 2);
  for (const d of draws) assert.doesNotThrow(() => d.fn(ctx, { p: 1, local: 0.1 }));
});

test('sticker explains a missing icon, a missing label and a bad color', () => {
  assert.throws(() => run((k) => k.sticker('nope')), /icon "nope" does not exist/);
  assert.throws(() => run((k) => k.sticker(null)), /icon name, a label, or both/);
  assert.throws(() => run((k) => k.sticker('rocket', { color: 'mauve' })), /sticker color "mauve"/);
});

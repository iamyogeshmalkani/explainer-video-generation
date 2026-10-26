import test from 'node:test';
import assert from 'node:assert/strict';
import { kit } from '../templates/tech-explainer/lib/kit.js';

// A stand-in for the scene API that records every draw call and runs it against a recording canvas.
function run(build) {
  const draws = [];
  const calls = [];
  const ctx = new Proxy({}, {
    get: (_, k) => (k === 'measureText' ? () => ({ width: 100 }) : (...a) => calls.push([k, ...a])),
    set: () => true,
  });
  const s = {
    W: 1080, H: 1920, t: 2,
    safe: { x: 54, y: 100, w: 972, h: 1400 },
    time: (v) => (typeof v === 'number' ? v : 0),
    draw: (o, fn) => draws.push({ o, fn }),
    engine: { images: new Map(), icons: {} },
  };
  build(kit(s), s);
  return { draws, ctx, calls };
}

test('pic shows a labelled placeholder while its file is missing', () => {
  const { draws, ctx, calls } = run((k) => k.pic('server', { id: 'srv', x: 0.5, y: 0.3, w: 0.4, label: 'Server', at: 1, out: 5 }));
  assert.equal(draws.length, 1);
  assert.equal(draws[0].o.out, 5);
  draws[0].fn(ctx, { p: 1, local: 1 });
  assert.ok(calls.some((c) => c[0] === 'fillText' && c[1] === 'assets/server'), 'placeholder text');
  assert.ok(calls.some((c) => c[0] === 'fillText' && c[1] === 'SERVER'), 'label');
});

test('link draws between two pics and accepts a block label', () => {
  const { draws, ctx, calls } = run((k) => {
    k.pic('phone', { id: 'a', x: 0.5, y: 0.2, w: 0.4, label: 'App' });
    k.pic('server', { id: 'b', x: 0.5, y: 0.8, w: 0.4, label: 'Server' });
    k.link('a', 'b', { pair: true, label: 'API', block: true });
  });
  assert.equal(draws.length, 3);
  for (const d of draws) d.fn(ctx, { p: 1, local: 1 });
  assert.ok(calls.some((c) => c[0] === 'fillText' && c[1] === 'API'), 'block label drawn');
  assert.ok(calls.filter((c) => c[0] === 'stroke').length >= 2, 'two dashed lines');
});

test('pic from every direction draws without error', () => {
  const { draws, ctx } = run((k) => { for (const from of ['pop', 'slap', 'bottom', 'top', 'left', 'right']) k.pic('x', { from }); });
  for (const d of draws) assert.doesNotThrow(() => { d.fn(ctx, { p: 0.4, local: 0.2 }); d.fn(ctx, { p: 1, local: 2 }); });
});

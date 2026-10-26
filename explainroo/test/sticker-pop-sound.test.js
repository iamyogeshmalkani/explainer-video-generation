import test from 'node:test';
import assert from 'node:assert/strict';
import { pop, SOUND_LEVELS } from '../templates/sticker-pop/lib/pop.js';

// A stand-in for the scene API: it records every sound the kit asks for.
function run(sound, build) {
  const sounds = [];
  const s = {
    W: 1080, H: 1920, t: 0,
    time: (v) => (typeof v === 'number' ? v : Number(String(v).replace('#', ''))),
    rand: () => 0.5,
    draw: () => {},
    sfx: (name, at, o = {}) => sounds.push({ name, at, gain: o.gain ?? 1 }),
    engine: { images: new Map(), image: () => null },
  };
  build(pop(s, sound ? { sound } : {}), s);
  return sounds.sort((a, b) => a.at - b.at);
}

// Roughly the opening of the Nobel sample: scenes with a title, stickers, notes, chips, eyes, a burst, a banner.
function story(k) {
  k.scene({ look: 'sun', at: 0, out: 6 }, () => {
    k.title('DYNAMITE?', { at: 0.1 });
    k.sticker('dynamite', { at: 0.4, burst: { kind: 'stars' } });
    k.sparks({ x: 0.6, y: 0.3, at: 0.9 });
    k.ping({ x: 0.8, y: 0.2, at: 1.0, count: 3 });
  });
  k.scene({ look: 'paper', at: 6, out: 12 }, () => {
    k.sticker('nobel', { at: 6.2 });
    k.note('Born in\nStockholm', { at: 6.8 });
    k.chip('1833', { at: 7.2 });
    k.eyes({ at: 7.6 });
    k.arrow([0.1, 0.1], [0.4, 0.4], { at: 8 });
    k.banner('WEAPONS', { at: 9 });
    k.heading('HIS\nWILL', { at: 10 });
  });
  k.scene({ look: 'blueprint', at: 12 }, () => {
    k.title('1901', { at: 12.2 });
    k.sticker('medal', { at: 12.5, burst: { kind: 'rays' } });
  });
}

test('the sound levels are off, calm, light and full', () => {
  assert.deepEqual(Object.keys(SOUND_LEVELS), ['off', 'calm', 'light', 'full']);
  assert.throws(() => run('loud', story), /must be one of/);
});

test('calm (the default) is much quieter and sparser than the old full behaviour', () => {
  const full = run('full', story);
  const calm = run(undefined, story);
  const light = run('light', story);
  assert.ok(full.length > light.length && light.length > calm.length, `${full.length} > ${light.length} > ${calm.length}`);
  assert.ok(calm.length <= full.length * 0.4, `calm ${calm.length} of ${full.length}`);
  // no stacked layers, only the loud kinds of element, and a gap of at least a second between them (swipes aside)
  const body = calm.filter((x) => x.name !== 'swipe');
  for (let i = 1; i < body.length; i++) assert.ok(body[i].at - body[i - 1].at >= 1.19, `${body[i - 1].at} then ${body[i].at}`);
  assert.ok(calm.every((x) => x.name === 'swipe' || x.name === 'pop' || x.name === 'click'));
  assert.ok(Math.max(...calm.map((x) => x.gain)) <= 0.8, 'calm sounds are soft');
  assert.ok(!calm.some((x) => ['sparkle', 'blip', 'tick', 'whoosh'].includes(x.name)), 'no sparkles, blips, ticks or whooshes');
});

test('off keeps only a soft swipe between scenes; full still plays everything', () => {
  const off = run('off', story);
  assert.ok(off.length > 0 && off.every((x) => x.name === 'swipe' && x.gain <= 0.7));
  const full = run('full', story);
  const names = new Set(full.map((x) => x.name));
  for (const n of ['pop', 'click', 'swipe', 'sparkle', 'blip', 'tick']) assert.ok(names.has(n), `full still has ${n}`);
});

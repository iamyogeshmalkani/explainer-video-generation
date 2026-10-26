import test from 'node:test';
import assert from 'node:assert/strict';
import { boostRegions } from '../src/wav.js';

const sr = 16000;
const tone = (seconds, level) => Float32Array.from({ length: Math.round(seconds * sr) }, (_, i) => level * Math.sin(i / 7));
const rms = (s, a, b) => { const seg = s.subarray(Math.round(a * sr), Math.round(b * sr)); return Math.sqrt(seg.reduce((n, x) => n + x * x, 0) / seg.length); };

test('boostRegions raises only the chosen stretch by the given decibels', () => {
  const x = tone(2, 0.2);
  const y = boostRegions(x, sr, [{ start: 0.8, end: 1.2 }], 6);
  assert.equal(y.length, x.length);
  const gain = 20 * Math.log10(rms(y, 0.9, 1.1) / rms(x, 0.9, 1.1));
  assert.ok(Math.abs(gain - 6) < 0.2, `gain was ${gain}`);
  assert.equal(rms(y, 0, 0.5), rms(x, 0, 0.5));
  assert.equal(rms(y, 1.6, 2), rms(x, 1.6, 2));
});

test('boostRegions ramps in and out smoothly and never clips', () => {
  const loud = boostRegions(tone(1, 0.7), sr, [{ start: 0.4, end: 0.6 }], 9);
  assert.ok(loud.every((v) => Math.abs(v) <= 1));
  // a steady signal shows the gain curve itself: it must move in small steps, not jump
  const steady = new Float32Array(sr).fill(0.1);
  const y = boostRegions(steady, sr, [{ start: 0.4, end: 0.6 }], 9);
  let step = 0;
  for (let i = 1; i < y.length; i++) step = Math.max(step, Math.abs(y[i] - y[i - 1]));
  assert.ok(step < 0.001, `largest step was ${step}`);
  assert.ok(y[Math.round(0.5 * sr)] > 0.27 && y[0] === Math.fround(0.1) && y[y.length - 1] === Math.fround(0.1));
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { createMusic, musicPlan } from '../engine/audio/music.js';
import { BLOCK } from '../engine/audio/synth.js';
import { MUSIC_STYLES } from '../src/project.js';

function render(style, seconds, seed = 1) {
  const sr = 24000;
  const n = Math.ceil(seconds * sr);
  const { synth } = createMusic({ style, seed, duration: seconds, sampleRate: sr });
  const L = new Float32Array(n);
  const R = new Float32Array(n);
  const bl = new Float32Array(BLOCK);
  const br = new Float32Array(BLOCK);
  for (let i0 = 0; i0 < n; i0 += BLOCK) {
    const c = Math.min(BLOCK, n - i0);
    bl.fill(0); br.fill(0);
    synth.renderBlock(i0, c, bl, br);
    L.set(bl.subarray(0, c), i0);
    R.set(br.subarray(0, c), i0);
  }
  return { L, R, sr };
}
const rms = (a, from, to) => { let s = 0; for (let i = from; i < to; i++) s += a[i] * a[i]; return Math.sqrt(s / Math.max(1, to - from)); };

test('inspiring is a known style in a major key at about 96 bpm', () => {
  assert.ok(MUSIC_STYLES.includes('inspiring'));
  const plan = musicPlan({ style: 'inspiring', seed: 1 });
  assert.equal(plan.bpm, 96);
  assert.ok(['D', 'G', 'C', 'A'].includes(plan.key));
});

test('inspiring renders clean audio that builds and never clips', () => {
  const { L, R, sr } = render('inspiring', 40);
  let peak = 0;
  for (let i = 0; i < L.length; i++) {
    assert.ok(Number.isFinite(L[i]) && Number.isFinite(R[i]), 'no NaN or infinity');
    peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
  }
  assert.ok(peak > 0.02 && peak < 0.99, `peak ${peak}`);
  const first = rms(L, 0, 5 * sr);
  const last = rms(L, 26 * sr, 38 * sr);
  assert.ok(last > first * 1.6, `the end (${last}) should be clearly fuller than the start (${first})`);
});

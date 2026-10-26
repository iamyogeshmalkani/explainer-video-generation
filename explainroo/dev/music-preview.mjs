#!/usr/bin/env node
// Renders one music style to a WAV file in Node (no browser), for listening or measuring.
//   node dev/music-preview.mjs [style] [seconds] [out.wav] [seed] [key] [bpm]
import fs from 'node:fs';
import { createMusic } from '../engine/audio/music.js';
import { BLOCK } from '../engine/audio/synth.js';

const [style = 'cinematic', secs = '32', out = '/tmp/music-preview.wav', seed = '1', key, bpm] = process.argv.slice(2);
const sr = 48000;
const n = Math.ceil(Number(secs) * sr);
const { synth, plan } = createMusic({ style, seed: Number(seed), key, bpm: bpm ? Number(bpm) : undefined, duration: Number(secs), sampleRate: sr });
const L = new Float32Array(n);
const R = new Float32Array(n);
const bl = new Float32Array(BLOCK);
const br = new Float32Array(BLOCK);
for (let i0 = 0; i0 < n; i0 += BLOCK) {
  const c = Math.min(BLOCK, n - i0);
  bl.fill(0);
  br.fill(0);
  synth.renderBlock(i0, c, bl, br);
  L.set(bl.subarray(0, c), i0);
  R.set(br.subarray(0, c), i0);
}
const buf = Buffer.alloc(44 + n * 4);
buf.write('RIFF', 0); buf.writeUInt32LE(36 + n * 4, 4); buf.write('WAVEfmt ', 8); buf.writeUInt32LE(16, 16);
buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22); buf.writeUInt32LE(sr, 24); buf.writeUInt32LE(sr * 4, 28);
buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(n * 4, 40);
const s16 = (x) => Math.round(Math.max(-1, Math.min(1, x)) * 32767);
for (let i = 0; i < n; i++) { buf.writeInt16LE(s16(L[i]), 44 + i * 4); buf.writeInt16LE(s16(R[i]), 46 + i * 4); }
fs.writeFileSync(out, buf);
console.log(`${out}: ${style}, key ${plan.key}, ${plan.bpm} bpm, ${plan.bars} bars, ${secs}s`);

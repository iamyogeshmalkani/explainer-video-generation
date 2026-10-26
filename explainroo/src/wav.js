// Minimal WAV reading and writing for mono/stereo PCM16 and float32 files.
import fs from 'node:fs';

export function readWav(file) {
  const buf = fs.readFileSync(file);
  if (buf.toString('ascii', 0, 4) !== 'RIFF' || buf.toString('ascii', 8, 12) !== 'WAVE') {
    throw new Error(`${file} is not a WAV file`);
  }
  let off = 12;
  let fmt = null;
  while (off + 8 <= buf.length) {
    const id = buf.toString('ascii', off, off + 4);
    const size = buf.readUInt32LE(off + 4);
    const body = off + 8;
    if (id === 'fmt ') {
      fmt = {
        format: buf.readUInt16LE(body),
        channels: buf.readUInt16LE(body + 2),
        sampleRate: buf.readUInt32LE(body + 4),
        bits: buf.readUInt16LE(body + 14),
      };
    } else if (id === 'data') {
      if (!fmt) throw new Error(`${file}: data chunk before fmt chunk`);
      const bytes = fmt.bits / 8;
      const frames = Math.floor(size / (bytes * fmt.channels));
      const out = new Float32Array(frames);
      for (let i = 0; i < frames; i++) {
        let sum = 0;
        for (let c = 0; c < fmt.channels; c++) {
          const p = body + (i * fmt.channels + c) * bytes;
          if (fmt.format === 3 && fmt.bits === 32) sum += buf.readFloatLE(p);
          else if (fmt.bits === 16) sum += buf.readInt16LE(p) / 32768;
          else if (fmt.bits === 24) sum += buf.readIntLE(p, 3) / 8388608;
          else if (fmt.bits === 32) sum += buf.readInt32LE(p) / 2147483648;
          else throw new Error(`${file}: unsupported ${fmt.bits}-bit WAV`);
        }
        out[i] = sum / fmt.channels;
      }
      return { sampleRate: fmt.sampleRate, samples: out };
    }
    off = body + size + (size % 2);
  }
  throw new Error(`${file}: no audio data`);
}

export function writeWav(file, samples, sampleRate) {
  const data = Buffer.alloc(samples.length * 2);
  for (let i = 0; i < samples.length; i++) {
    const v = Math.max(-1, Math.min(1, samples[i]));
    data.writeInt16LE(Math.round(v < 0 ? v * 32768 : v * 32767), i * 2);
  }
  const head = Buffer.alloc(44);
  head.write('RIFF', 0, 'ascii');
  head.writeUInt32LE(36 + data.length, 4);
  head.write('WAVE', 8, 'ascii');
  head.write('fmt ', 12, 'ascii');
  head.writeUInt32LE(16, 16);
  head.writeUInt16LE(1, 20);
  head.writeUInt16LE(1, 22);
  head.writeUInt32LE(sampleRate, 24);
  head.writeUInt32LE(sampleRate * 2, 28);
  head.writeUInt16LE(2, 32);
  head.writeUInt16LE(16, 34);
  head.write('data', 36, 'ascii');
  head.writeUInt32LE(data.length, 40);
  fs.writeFileSync(file, Buffer.concat([head, data]));
}

// Makes chosen stretches of a narration louder (the words in [loud] ... [/loud]). Each region is
// { start, end } in seconds; it gets `db` more gain with short ramps so nothing clicks, and peaks that the boost
// pushes up are rounded off softly instead of clipping. Returns a new array.
export function boostRegions(samples, sampleRate, regions, db, { ramp = 0.04, pad = 0.04 } = {}) {
  const gain = new Float32Array(samples.length).fill(1);
  const top = 10 ** (db / 20);
  const r = Math.max(1, Math.round(ramp * sampleRate));
  for (const { start, end } of regions) {
    const a = Math.max(0, Math.round((start - pad) * sampleRate));
    const b = Math.min(samples.length, Math.round((end + pad) * sampleRate));
    for (let i = Math.max(0, a - r); i < Math.min(samples.length, b + r); i++) {
      const edge = i < a ? (i - (a - r)) / r : i >= b ? 1 - (i - b) / r : 1;
      const g = 1 + (top - 1) * Math.min(1, Math.max(0, edge));
      if (g > gain[i]) gain[i] = g;
    }
  }
  const out = new Float32Array(samples.length);
  const knee = 0.85;
  for (let i = 0; i < samples.length; i++) {
    const y = samples[i] * gain[i];
    const m = Math.abs(y);
    out[i] = m > knee ? Math.sign(y) * (knee + (1 - knee) * Math.tanh((m - knee) / (1 - knee))) : y;
  }
  return out;
}

export function resample(samples, from, to) {
  if (from === to) return samples;
  const ratio = from / to;
  const out = new Float32Array(Math.floor(samples.length / ratio));
  for (let i = 0; i < out.length; i++) {
    const x = i * ratio;
    const i0 = Math.floor(x);
    const f = x - i0;
    out[i] = samples[i0] * (1 - f) + (samples[i0 + 1] ?? 0) * f;
  }
  return out;
}

// Trims leading and trailing near-silence, keeping a short natural margin.
export function trimSilence(samples, sampleRate, { threshold = 0.004, keep = 0.04 } = {}) {
  const win = Math.round(sampleRate * 0.01);
  const loud = (i) => {
    let peak = 0;
    for (let k = i; k < Math.min(samples.length, i + win); k++) peak = Math.max(peak, Math.abs(samples[k]));
    return peak > threshold;
  };
  let a = 0;
  while (a < samples.length && !loud(a)) a += win;
  let b = samples.length - win;
  while (b > a && !loud(b)) b -= win;
  const pad = Math.round(sampleRate * keep);
  const start = Math.max(0, a - pad);
  const end = Math.min(samples.length, b + win + pad);
  return samples.subarray(start, Math.max(start, end));
}

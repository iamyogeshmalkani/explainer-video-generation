import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { normalizeConfig, loadProject, ProjectError } from '../src/project.js';
import { parseScript, speechChunks } from '../src/script.js';
import { findEnv, readEnvFile } from '../src/env.js';
import { recordingCuts, recordingFiles, decodeRecording, saveRecording } from '../src/recordings.js';
import { sceneHash } from '../src/voice.js';
import { readWav, writeWav } from '../src/wav.js';
import { loudness } from '../src/ffmpeg.js';
import { main } from '../src/cli.js';

function temp(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'explainroo-voices-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  return dir;
}

function project(t, voice = 'af_heart') {
  const dir = temp(t);
  fs.mkdirSync(path.join(dir, 'assets'));
  fs.writeFileSync(path.join(dir, 'video.json'), JSON.stringify({ voice }));
  fs.writeFileSync(path.join(dir, 'script.md'), '# Test\n## first\nHello.\n## silent\n## second\nGoodbye.');
  fs.writeFileSync(path.join(dir, 'scenes.js'), 'export default { first() {}, silent() {}, second() {} };');
  return loadProject(dir);
}

function setEnv(t, name, value) {
  const previous = process.env[name];
  process.env[name] = value;
  t.after(() => {
    if (previous === undefined) delete process.env[name];
    else process.env[name] = previous;
  });
}

test('voice config accepts strings and all providers, with provider speed defaults', () => {
  assert.equal(normalizeConfig({}).voice, 'af_heart');
  assert.equal(normalizeConfig({ voice: 'am_michael' }).speed, 0.9);
  assert.equal(normalizeConfig({ voice: { provider: 'kokoro', id: 'af_heart' } }).voice, 'af_heart');
  assert.equal(normalizeConfig({ voice: { provider: 'kokoro', id: 'af_heart' } }).speed, 0.9);
  for (const src of ['assets/narration.wav', 'assets/narration/', 'assets/take.m4a']) {
    assert.equal(normalizeConfig({ voice: { provider: 'recording', src } }).speed, 1);
    assert.equal(normalizeConfig({ voice: { provider: 'recording', src }, speed: 1.2 }).speed, 1.2);
  }
  assert.throws(() => normalizeConfig({ speed: 1.6, pace: 1.6 }), /too fast/);
});

test('voice config rejects bad providers, missing ids, unknown keys and unsafe paths', () => {
  for (const voice of [null, [], 1, {}, { provider: 'bad' }, { provider: 'toString' }, { provider: ['kokoro'], id: 'af_heart' },
    { provider: 'kokoro' }, { provider: 'kokoro', id: 'bad' }, { provider: 'kokoro', id: 'toString' },
    { provider: 'kokoro', id: 'af_heart', model: 'x' }, { provider: 'elevenlabs', id: 'v' },
    { provider: 'recording' },
    { provider: 'recording', src: '../take.wav' }, { provider: 'recording', src: 'assets/../take.wav' },
    { provider: 'recording', src: 'assets/..\\take.wav' }, { provider: 'recording', src: 'assets/a.wav', id: 'x' }]) {
    assert.throws(() => normalizeConfig({ voice }), ProjectError);
  }
});

test('shared env reader keeps environment, project, root precedence and quoted exports', (t) => {
  const dir = temp(t);
  const root = temp(t);
  const name = 'EXPLAINROO_TEST_KEY';
  const file = path.join(dir, '.env');
  setEnv(t, name, 'environment');
  fs.writeFileSync(path.join(root, '.env'), `${name}=root\n`);
  fs.writeFileSync(file, `UNRELATED=x\n  export ${name} = "project"  \n`);
  assert.equal(readEnvFile(file, name), 'project');
  assert.equal(findEnv(name, dir, root), 'environment');
  process.env[name] = '';
  assert.equal(findEnv(name, dir, root), 'project');
  fs.writeFileSync(file, `${name}=''\n`);
  assert.equal(findEnv(name, dir, root), 'root');
  fs.rmSync(file);
  assert.equal(readEnvFile(file, name), null);
});

test('cached CLI voice output reports recording mismatches', async (t) => {
  const p = project(t, { provider: 'recording', src: 'assets/take.wav' });
  writeWav(path.join(p.dir, 'assets/take.wav'), new Float32Array(24000), 24000);
  const recordings = recordingFiles(p);
  fs.mkdirSync(p.paths.voice, { recursive: true });
  const cache = (recording) => {
    for (const scene of p.script.scenes) {
      const chunks = speechChunks(scene.units, p.config);
      const hash = sceneHash(scene, chunks, p.config, recording && chunks.length
        ? { content: recordings.files[scene.id].hash, scenes: p.script.scenes.map((s) => s.spoken) } : null);
      const info = { hash, id: scene.id, duration: chunks.length ? 1 : 0, words: [], marks: {}, chunks: [], transcript: 'Different words.', matchRate: chunks.length ? 0 : 1, unmatched: chunks.length ? [scene.spoken] : [] };
      fs.writeFileSync(path.join(p.paths.voice, scene.id + '.json'), JSON.stringify(info));
      if (chunks.length) writeWav(path.join(p.paths.voice, scene.id + '.wav'), new Float32Array(24000), 24000);
    }
  };
  cache(true);
  let output = '';
  t.mock.method(process.stdout, 'write', (s) => { output += s; return true; });
  assert.equal(await main(['voice', p.dir, '--json']), 0);
  assert.match(JSON.parse(output).scenes[0].message, /recording does not match.*actually said/);
});

test('single-take cuts retain internal pauses and margins, skip silent scenes and avoid overlap', () => {
  const scenes = parseScript('## first\n[#hello] Hello [pause 9] {world|world}.\n## silent\n## second\nGoodbye now.').scenes;
  const heard = [{ text: 'Hello', start: 1, end: 1.5 }, { text: 'world', start: 3, end: 3.5 },
    { text: 'Goodbye', start: 5, end: 5.5 }, { text: 'now', start: 6, end: 6.5 }];
  const cuts = recordingCuts(scenes, heard, 8);
  assert.equal(cuts.length, 2);
  assert.equal(cuts[0].scene.id, 'first');
  assert.equal(cuts[0].start, 0.85);
  assert.equal(cuts[0].end, 3.65);
  assert.deepEqual(cuts[0].words, [{ start: 1, end: 1.5, matched: true }, { start: 3, end: 3.5, matched: true }]);
  assert.equal(cuts[1].start, 4.85);
  assert.equal(cuts[1].end, 6.65);
  heard[2].start = 3.6;
  const close = recordingCuts(scenes, heard, 6.5);
  assert.equal(close[0].end, 3.55);
  assert.equal(close[1].start, 3.55);
  assert.equal(close[1].end, 6.5);
  assert.deepEqual(recordingCuts(scenes.filter((s) => s.id === 'silent'), [], 8), []);
});

test('recording folders report all missing scenes, validate files and stay inside assets', (t) => {
  const p = project(t, { provider: 'recording', src: 'assets/narration/' });
  const folder = path.join(p.dir, 'assets/narration');
  fs.mkdirSync(folder);
  assert.throws(() => recordingFiles(p), /missing scene recordings.*first, second/);
  fs.writeFileSync(path.join(folder, 'first.mp3'), 'first');
  fs.writeFileSync(path.join(folder, 'second.M4A'), 'second');
  const files = recordingFiles(p);
  assert.equal(files.folder, true);
  assert.deepEqual(Object.keys(files.files), ['first', 'second']);
  fs.writeFileSync(path.join(folder, 'first.mp3'), 'replaced');
  const changed = recordingFiles(p);
  assert.notEqual(changed.files.first.hash, files.files.first.hash);
  assert.equal(changed.files.second.hash, files.files.second.hash);
  fs.rmSync(path.join(folder, 'first.mp3'));
  const outside = path.join(temp(t), 'outside.wav');
  fs.writeFileSync(outside, 'outside');
  fs.symlinkSync(outside, path.join(folder, 'first.wav'));
  assert.throws(() => recordingFiles(p), /including symlinks/);
  p.config.voice.src = 'assets/no.wav';
  assert.throws(() => recordingFiles(p), /missing/);
  p.config.voice.src = 'assets/bad.txt';
  fs.writeFileSync(path.join(p.dir, 'assets/bad.txt'), 'not audio');
  assert.throws(() => recordingFiles(p), /wav, mp3/);
});

test('scene cache includes audio settings and recording contents, ignores recording gaps', () => {
  const scene = parseScript('## first\n[#a] Hello. Goodbye.').scenes[0];
  const cfg = normalizeConfig({});
  const chunks = speechChunks(scene.units);
  const hash = sceneHash(scene, chunks, cfg);
  assert.notEqual(hash, sceneHash(scene, chunks, { ...cfg, voice: 'am_michael' }));
  assert.notEqual(hash, sceneHash(scene, chunks, { ...cfg, speed: 1 }));
  const recording = normalizeConfig({ voice: { provider: 'recording', src: 'assets/take.wav' } });
  const recHash = sceneHash(scene, chunks, recording, { content: 'abc' });
  assert.notEqual(recHash, sceneHash(scene, chunks, recording, { content: 'def' }));
  assert.equal(recHash, sceneHash(scene, speechChunks(scene.units, { sentenceGap: 9 }), recording, { content: 'abc' }));
  assert.notEqual(recHash, sceneHash(scene, chunks, { ...recording, pace: 1.2 }, { content: 'abc' }));
  const paused = parseScript('## first\n[#a] Hello. [pause 9] Goodbye.').scenes[0];
  assert.equal(recHash, sceneHash(paused, speechChunks(paused.units), recording, { content: 'abc' }));
});

test('recordings preserve sample rate up to 48 kHz, apply tempo and normalize loudness', async (t) => {
  const dir = temp(t);
  const file = path.join(dir, 'tone.wav');
  const sr = 24000;
  const samples = Float32Array.from({ length: sr * 4 }, (_, i) => 0.02 * Math.sin(2 * Math.PI * 440 * i / sr));
  writeWav(file, samples, sr);
  const decoded = await decodeRecording(file, dir, 1.25);
  assert.equal(decoded.sampleRate, sr);
  assert.ok(Math.abs(decoded.samples.length / sr - 3.2) < 0.05);
  const out = path.join(dir, 'out.wav');
  await saveRecording(out, decoded.samples, decoded.sampleRate);
  assert.equal(readWav(out).sampleRate, sr);
  assert.ok(Math.abs((await loudness(out)).integrated - -22.3) < 0.5);
  const high = path.join(dir, 'high.wav');
  writeWav(high, new Float32Array(96000), 96000);
  assert.equal((await decodeRecording(high, dir, 1)).sampleRate, 48000);
  const silent = path.join(dir, 'silent.wav');
  await saveRecording(silent, new Float32Array(sr), sr);
  assert.equal(readWav(silent).samples.length, sr);
  assert.deepEqual(fs.readdirSync(dir).filter((n) => n.startsWith('recording-')), []);
});

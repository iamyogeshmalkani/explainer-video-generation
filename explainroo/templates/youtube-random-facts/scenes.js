// youtube-random-facts template (same kit as sticker-pop). Normally you edit script.md (the hook, the
// fact and the [#markers]), shots.js (the sticker pictures) and this file (what pops on each marker).
// The kit is in lib/pop.js; its header lists every call. Keep the content in the upper two thirds:
// the bottom stays free for app buttons.
//
// The shape of every video: scene 1 is the HOOK ("DID YOU KNOW?" with a sticker of the thing the fact
// is about), the middle scenes tell the fact one idea at a time, the last scene is "NOW YOU KNOW!".
// One scene per idea: k.scene({ look, at, out }) starts it and the next scene pushes it away.
import { pop } from './lib/pop.js';

export default {
  story(s) {
    const k = pop(s); // sounds are quiet by default; pop(s, { sound: 'light' | 'off' | 'full' }) changes that (see README)
    const t = (m, d = 0) => k.t(m, d);

    // 1. The hook (s1): the big question, a sticker, a thought bubble
    k.scene({ look: 'sun', at: 0, out: '#s2' }, () => {
      k.title('DID YOU\nKNOW?', { y: 0.2, size: 0.17, at: 0.05 });
      k.sticker('cowboy', { x: 0.5, y: 0.58, w: 0.6, from: 'bottom', at: 0.3, burst: { kind: 'stars', dy: 0.3 } });
      k.thought({ x: 0.84, y: 0.4, at: 0.9 });
      k.eyes({ x: 0.14, y: 0.42, size: 0.05, at: 1.0 });
    });

    // 2. The fact in a few bold words (s2)
    k.scene({ look: 'blueprint', at: '#s2', out: '#s3' }, () => {
      k.heading('PIXAR\nALMOST\nLOST', { x: 0.08, y: 0.14, at: t('#s2', 0.1) });
      k.sticker('clapper', { x: 0.7, y: 0.62, w: 0.55, from: 'right', at: t('#s2', 0.5), rotate: -8, burst: { kind: 'rays', dy: 0.22 } });
      k.chip('TOY STORY 2', { x: 0.36, y: 0.52, size: 0.075, at: t('#s2', 1.3) });
    });

    // 3. One wrong command (s3)
    k.scene({ look: 'paper', at: '#s3', out: '#s4' }, () => {
      k.chip('1998', { x: 0.2, y: 0.12, size: 0.09, at: t('#s3', 0.1) });
      k.sticker('computer', { x: 0.5, y: 0.5, w: 0.62, from: 'bottom', at: t('#s3', 0.3) });
      k.note('ONE WRONG\nCOMMAND', { x: 0.7, y: 0.22, w: 0.44, size: 0.05, at: t('#s3', 1.4), rotate: 5 });
      k.ping({ x: 0.5, y: 0.37, r: 0.07, at: t('#s3', 1.9) });
    });

    // 4. The files vanish (s4)
    k.scene({ look: 'sun', at: '#s4', out: '#s5' }, () => {
      k.title('DELETED!', { y: 0.14, size: 0.16, at: t('#s4', 0.1), rotate: -3 });
      k.sticker('folder', { x: 0.3, y: 0.46, w: 0.42, from: 'left', at: t('#s4', 0.4) });
      k.sticker('trash', { x: 0.72, y: 0.52, w: 0.42, from: 'right', at: t('#s4', 0.8) });
      k.arrow([0.44, 0.4], [0.62, 0.45], { at: t('#s4', 1.2), bend: -0.3 });
    });

    // 5. The backups failed (s5 to s6)
    k.scene({ look: 'blueprint', at: '#s5', out: '#s7' }, () => {
      k.heading('AND THE\nBACKUPS?', { x: 0.08, y: 0.14, at: t('#s5', 0.1) });
      k.sticker('folder', { x: 0.5, y: 0.52, w: 0.5, from: 'pop', at: '#s6' });
      k.banner('ALSO BROKEN', { y: 0.74, at: t('#s6', 0.9) });
      k.eyes({ x: 0.82, y: 0.3, at: t('#s6', 0.3) });
    });

    // 6. The home copy (s7 to s8)
    k.scene({ look: 'paper', at: '#s7', out: '#s9' }, () => {
      k.sticker('house', { x: 0.3, y: 0.34, w: 0.46, from: 'left', at: t('#s7', 0.1) });
      k.sticker('computer', { x: 0.72, y: 0.56, w: 0.5, from: 'right', at: '#s8' });
      k.note('A COPY\nAT HOME', { x: 0.3, y: 0.62, w: 0.42, size: 0.05, at: t('#s8', 0.5), rotate: -4 });
      k.chip('SAVED!', { x: 0.7, y: 0.28, size: 0.09, at: t('#s8', 1.2), rotate: 4 });
      k.burst({ x: 0.72, y: 0.56, at: t('#s8', 1.2), kind: 'stars' });
    });

    // 7. The outro (s9): now you know + follow
    k.scene({ look: 'sun', at: '#s9' }, () => {
      k.title('NOW YOU\nKNOW!', { y: 0.2, size: 0.17, at: t('#s9', 0.1) });
      k.sticker('cowboy', { x: 0.5, y: 0.58, w: 0.55, from: 'pop', at: t('#s9', 0.5), burst: { kind: 'rays', dy: 0.28 } });
      k.line('Follow for more tech facts', { x: 0.5, y: 0.8, size: 0.05, at: t('#s9', 1.6) });
      k.burst({ x: 0.16, y: 0.4, at: t('#s9', 1.0), kind: 'stars' });
      k.burst({ x: 0.84, y: 0.4, at: t('#s9', 1.2), kind: 'stars' });
    });
  },
};

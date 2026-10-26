// Sticker-pop template. Normally you edit script.md (the words and the [#markers]), shots.js
// (the sticker pictures) and this file (what pops up on each marker). The kit is in lib/pop.js;
// its header lists every call. Keep the content in the upper two thirds: the bottom stays free
// for app buttons.
//
// One scene per idea: k.scene({ look, at, out }) starts it and the next scene pushes it away.
// Inside it, every element pops in on its own marker and makes a click.
import { pop } from './lib/pop.js';

export default {
  story(s) {
    const k = pop(s); // sounds are quiet by default; pop(s, { sound: 'light' | 'off' | 'full' }) changes that (see README)
    const t = (m, d = 0) => k.t(m, d);

    // 1. A question on yellow (s1)
    k.scene({ look: 'sun', at: 0, out: '#s2' }, () => {
      k.title('DYNAMITE?', { y: 0.2, at: 0.05 });
      k.sticker('dynamite', { x: 0.5, y: 0.52, w: 0.5, from: 'bottom', at: 0.25 });
      k.sparks({ x: 0.64, y: 0.285, at: 0.9 });
      k.ping({ x: 0.84, y: 0.2, r: 0.06, at: 0.9, count: 3 });
    });

    // 2. The prize, on a blueprint (s2)
    k.scene({ look: 'blueprint', at: '#s2', out: '#s3' }, () => {
      k.sticker('dynamite', { x: 0.12, y: 0.12, w: 0.14, from: 'pop', at: t('#s2', 0.05) });
      k.heading('THE\nNOBEL\nPRIZE', { x: 0.08, y: 0.3, at: t('#s2', 0.45) });
      k.sticker('medal', { x: 0.58, y: 0.62, w: 0.7, from: 'pop', at: t('#s2', 0.2), burst: { kind: 'rays', dy: 0.26 } });
      k.eyes({ x: 0.78, y: 0.25, at: t('#s2', 1.4) });
    });

    // 3. A person: a portrait, a tag and a year (s3 to s4)
    k.scene({ look: 'paper', at: '#s3', out: '#s4' }, () => {
      k.line('Stranger\nthan you think!', { x: 0.42, y: 0.11, size: 0.06, at: t('#s3', 0.05) });
      k.thought({ x: 0.83, y: 0.09, at: t('#s3', 0.55) });
      k.eyes({ x: 0.12, y: 0.17, size: 0.05, at: t('#s3', 0.9) });
      k.sticker('nobel', { x: 0.3, y: 0.58, w: 0.62, from: 'bottom', at: '#born', burst: { kind: 'stars', dy: 0.33 } });
      k.note('Born in\nStockholm, Sweden', { x: 0.73, y: 0.38, w: 0.4, size: 0.045, at: t('#born', 0.4) });
      k.chip('1833', { x: 0.76, y: 0.5, size: 0.08, at: '#year' });
    });

    // 4. What he made (s4)
    k.scene({ look: 'paper', at: '#s4', out: '#s5' }, () => {
      k.sticker('nobel', { x: 0.27, y: 0.52, w: 0.56, from: 'left', at: t('#s4', 0.05) });
      k.sticker('dynamite', { x: 0.76, y: 0.37, w: 0.26, from: 'pop', at: t('#s4', 0.5), rotate: 12 });
      k.sticker('pistol', { x: 0.78, y: 0.12, w: 0.28, from: 'right', at: '#guns' });
      k.sticker('rifle', { x: 0.55, y: 0.24, w: 0.4, from: 'right', at: t('#guns', 0.4), rotate: -8 });
      k.sticker('barrels', { x: 0.76, y: 0.56, w: 0.32, from: 'bottom', at: t('#guns', 0.9), burst: { kind: 'stars', dy: 0.1 } });
      k.arrow([0.62, 0.17], [0.66, 0.34], { at: t('#guns', 0.8), bend: -0.3 });
      k.banner('WEAPONS &\nEXPLOSIVES', { y: 0.76, at: t('#s4', 1.0) });
    });

    // 5. The mistake (s5 to s6)
    k.scene({ look: 'sun', at: '#s5', out: '#s7' }, () => {
      k.title('OOPS!', { y: 0.13, size: 0.2, at: t('#s5', 0.1), rotate: 4 });
      k.sticker('newspaper', { x: 0.5, y: 0.4, w: 0.72, from: 'bottom', at: t('#s5', 0.7), rotate: -4 });
      k.note('FRANCE, 1888', { x: 0.24, y: 0.24, w: 0.4, size: 0.045, at: t('#s5', 1.5), rotate: -6 });
      k.note('"THE MERCHANT OF\nDEATH IS DEAD"', { x: 0.5, y: 0.68, w: 0.84, size: 0.066, at: '#s6', rotate: 2 });
      k.burst({ x: 0.14, y: 0.55, at: '#s6', kind: 'rays' });
    });

    // 6. The will and the five prizes (s7 to s8)
    k.scene({ look: 'blueprint', at: '#s7', out: '#s9' }, () => {
      k.heading('HIS\nWILL', { x: 0.08, y: 0.17, at: t('#s7', 0.2) });
      k.sticker('scroll', { x: 0.68, y: 0.2, w: 0.5, from: 'top', at: t('#s7', 0.4), burst: { kind: 'stars', dy: 0.12 } });
      k.chip('5 PRIZES', { x: 0.5, y: 0.38, size: 0.09, at: '#s8' });
      [['Physics', '#p1', 0.5, 0.47, 7], ['Chemistry', '#p2', 0.5, 0.54, 7], ['Medicine', '#p3', 0.5, 0.61, 7], ['Literature', '#p4', 0.5, 0.68, 7], ['Peace', '#p5', 0.5, 0.75, 7]].forEach(([label, at, x, y, rot], i) => {
        k.chip(label, { x: x + (i % 2 ? 0.1 : -0.1), y, size: 0.07, at, rotate: i % 2 ? -3 : 3, pitch: 2 + i });
      });
    });

    // 7. The first prizes (s9)
    k.scene({ look: 'sun', at: '#s9' }, () => {
      k.title('1901', { y: 0.2, size: 0.26, at: t('#s9', 0.1) });
      k.sticker('medal', { x: 0.5, y: 0.52, w: 0.8, from: 'pop', at: t('#s9', 0.4), burst: { kind: 'rays', dy: 0.3 } });
      k.burst({ x: 0.2, y: 0.4, at: t('#s9', 0.9), kind: 'stars' });
      k.burst({ x: 0.82, y: 0.4, at: t('#s9', 1.1), kind: 'stars' });
    });
  },
};

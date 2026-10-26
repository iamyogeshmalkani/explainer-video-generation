// "The richest person in history" (Mansa Musa), sticker-pop template.
// Content stays in the upper two thirds; the bottom third is left free for app buttons.
import { pop } from './lib/pop.js';

export default {
  story(s) {
    const k = pop(s);
    const t = (m, d = 0) => k.t(m, d);

    // 1. The question (s1)
    k.scene({ look: 'sun', at: 0, out: '#s2', color: '#1d2b45' }, () => {
      k.title('RICHEST\nEVER?', { y: 0.2, size: 0.17, at: 0.05 });
      k.sticker('coins', { x: 0.5, y: 0.55, w: 0.5, from: 'bottom', at: 0.4, burst: { kind: 'stars', dy: 0.25 } });
      k.ping({ x: 0.82, y: 0.34, r: 0.06, at: 1.0, count: 3 });
    });

    // 2. The king (s2 to s3)
    k.scene({ look: 'blueprint', at: '#s2', out: '#s3', color: '#23473f' }, () => {
      k.heading('MANSA\nMUSA', { x: 0.08, y: 0.17, at: t('#s2', 0.1) });
      k.sticker('king', { x: 0.66, y: 0.52, w: 0.62, from: 'bottom', at: t('#s2', 0.5), burst: { kind: 'rays', dy: 0.28 } });
      k.sticker('africa', { x: 0.2, y: 0.5, w: 0.34, from: 'pop', at: t('#s2', 2.0) });
      k.note('King of the\nMali Empire', { x: 0.26, y: 0.7, w: 0.4, size: 0.045, at: t('#s2', 2.8), rotate: -4 });
      k.chip('EARLY 1300s', { x: 0.74, y: 0.27, size: 0.06, at: '#year', rotate: 4 });
    });

    // 3. Gold and salt (s3 to s4)
    k.scene({ look: 'paper', at: '#s3', out: '#s4', color: '#d6c3a0' }, () => {
      k.title('RICH LAND', { y: 0.13, size: 0.14, at: t('#s3', 0.05), color: '#ffd84a' });
      k.sticker('nuggets', { x: 0.3, y: 0.48, w: 0.5, from: 'left', at: t('#s3', 0.5) });
      k.chip('GOLD', { x: 0.3, y: 0.68, size: 0.08, at: t('#s3', 1.2) });
      k.sticker('sack', { x: 0.74, y: 0.46, w: 0.38, from: 'right', at: '#salt', burst: { kind: 'stars', dy: 0.15 } });
      k.chip('SALT', { x: 0.74, y: 0.64, size: 0.08, at: t('#salt', 0.5), rotate: 3 });
    });

    // 4. The pilgrimage (s4)
    k.scene({ look: 'sun', at: '#s4', out: '#s5', color: '#5a2231' }, () => {
      k.title('1324', { y: 0.14, size: 0.22, at: t('#s4', 0.2) });
      k.sticker('camel', { x: 0.3, y: 0.55, w: 0.5, from: 'left', at: t('#s4', 1.0) });
      k.note('Pilgrimage\nto Mecca', { x: 0.7, y: 0.3, w: 0.4, size: 0.048, at: t('#s4', 1.9), rotate: 4 });
      k.sticker('camel', { x: 0.72, y: 0.5, w: 0.36, from: 'right', at: '#camels' });
      k.chip('THOUSANDS OF PEOPLE', { x: 0.5, y: 0.74, size: 0.055, at: t('#camels', 1.0) });
    });

    // 5. Cairo: so much gold the price fell (s5)
    k.scene({ look: 'blueprint', at: '#s5', out: '#s6', color: '#1d2b45' }, () => {
      k.heading('CAIRO', { x: 0.08, y: 0.13, at: t('#s5', 0.1) });
      k.sticker('nuggets', { x: 0.3, y: 0.5, w: 0.48, from: 'left', at: t('#s5', 0.5) });
      k.sticker('coins', { x: 0.74, y: 0.34, w: 0.36, from: 'top', at: t('#s5', 1.1) });
      k.arrow([0.46, 0.46], [0.66, 0.36], { at: t('#s5', 1.8), bend: -0.3 });
      k.chip('PRICE FELL', { x: 0.6, y: 0.7, size: 0.09, at: '#fell', rotate: -3 });
      k.burst({ x: 0.82, y: 0.68, at: '#fell', kind: 'stars' });
    });

    // 6. Mosques (s6)
    k.scene({ look: 'paper', at: '#s6', out: '#s7', color: '#d6c3a0' }, () => {
      k.title('GRAND\nMOSQUES', { y: 0.15, size: 0.14, at: t('#s6', 0.05), color: '#ffd84a' });
      k.sticker('mosque', { x: 0.5, y: 0.55, w: 0.62, from: 'bottom', at: t('#s6', 0.3), burst: { kind: 'stars', dy: 0.25 } });
    });

    // 7. Timbuktu (s7)
    k.scene({ look: 'blueprint', at: '#s7', out: '#s8', color: '#23473f' }, () => {
      k.heading('TIMBUKTU', { x: 0.08, y: 0.13, size: 0.15, at: t('#s7', 0.1) });
      k.sticker('books', { x: 0.5, y: 0.5, w: 0.55, from: 'pop', at: t('#s7', 0.8), burst: { kind: 'rays', dy: 0.22 } });
      k.chip('CENTER OF LEARNING', { x: 0.5, y: 0.74, size: 0.055, at: t('#s7', 2.0) });
      k.eyes({ x: 0.82, y: 0.3, at: t('#s7', 2.6) });
    });

    // 8. The verdict (s8)
    k.scene({ look: 'sun', at: '#s8', color: '#5a2231' }, () => {
      k.chip('MANSA MUSA', { x: 0.5, y: 0.1, size: 0.09, at: t('#s8', 0.2) });
      k.title('RICHEST\nEVER', { y: 0.27, size: 0.17, at: s.cue('richest', 2) - 0.1 });
      k.sticker('king', { x: 0.3, y: 0.56, w: 0.5, from: 'bottom', at: t('#s8', 0.1) });
      k.sticker('crown', { x: 0.72, y: 0.55, w: 0.4, from: 'pop', at: s.cue('richest', 2) + 0.5, burst: { kind: 'rays', dy: 0.16 } });
      k.banner('NO ONE CAN COUNT IT', { y: 0.74, at: t('#s8', 0.6) });
    });
  },
};

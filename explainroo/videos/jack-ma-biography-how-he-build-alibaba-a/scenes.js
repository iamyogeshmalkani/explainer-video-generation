// Jack Ma: rejected 30 times, then Alibaba. Sticker-pop template.
// One scene per idea: k.scene({ look, at, out }) starts it and the next scene pushes it away.
// Inside it, every element pops in on its own marker and makes a click.
import { pop } from './lib/pop.js';

export default {
  story(s) {
    const k = pop(s);
    const t = (m, d = 0) => k.t(m, d);

    // 1. The hook on yellow (s1 to s3)
    k.scene({ look: 'sun', at: 0, out: '#s3' }, () => {
      k.title('REJECTED', { y: 0.17, size: 0.17, at: 0.05 });
      k.sticker('stamp', { x: 0.5, y: 0.5, w: 0.42, from: 'bottom', at: 0.3, rotate: -8 });
      k.chip('30 TIMES', { x: 0.5, y: 0.3, size: 0.095, at: t('#s1', 0.6), rotate: -3 });
      k.ping({ x: 0.82, y: 0.68, r: 0.05, at: t('#s1', 1.0), count: 2 });
      k.banner('WORTH BILLIONS', { y: 0.76, at: t('#s2', 0.3) });
      k.burst({ x: 0.22, y: 0.7, at: t('#s2', 0.6), kind: 'stars' });
    });

    // 2. The man: portrait, name, place, year (s3 to s4)
    k.scene({ look: 'paper', at: '#s3', out: '#s4' }, () => {
      k.heading('JACK\nMA', { x: 0.6, y: 0.17, at: t('#s3', 0.25) });
      k.eyes({ x: 0.14, y: 0.12, size: 0.06, at: t('#s3', 0.7) });
      k.sticker('jackma', { x: 0.32, y: 0.55, w: 0.58, from: 'bottom', at: t('#s3', 0.05), burst: { kind: 'stars', dy: 0.32 } });
      k.note('Born in\nHangzhou, China', { x: 0.73, y: 0.42, w: 0.42, size: 0.045, at: '#born' });
      k.chip('1964', { x: 0.75, y: 0.56, size: 0.085, at: '#year' });
    });

    // 3. The exam (s4 to s5)
    k.scene({ look: 'blueprint', at: '#s4', out: '#s5' }, () => {
      k.heading('COLLEGE\nEXAM', { x: 0.08, y: 0.16, at: t('#s4', 0.1) });
      k.sticker('exam', { x: 0.5, y: 0.48, w: 0.5, from: 'pop', at: t('#s4', 0.6), rotate: 6 });
      k.chip('FAILED TWICE', { x: 0.5, y: 0.7, size: 0.08, at: '#twice', rotate: -3 });
    });

    // 4. Harvard (s5 to s6)
    k.scene({ look: 'sun', at: '#s5', out: '#s6' }, () => {
      k.title('HARVARD', { y: 0.15, size: 0.16, at: t('#s5', 0.1) });
      k.sticker('harvard', { x: 0.5, y: 0.46, w: 0.62, from: 'bottom', at: t('#s5', 0.4) });
      k.chip('NO x 10', { x: 0.5, y: 0.7, size: 0.1, at: '#ten', rotate: 3, pitch: 2 });
      k.burst({ x: 0.8, y: 0.62, at: t('#ten', 0.3), kind: 'rays' });
    });

    // 5. Thirty jobs and the KFC story (s6 to s7)
    k.scene({ look: 'paper', at: '#s6', out: '#s7' }, () => {
      k.heading('30 JOBS', { x: 0.08, y: 0.12, at: t('#s6', 0.1) });
      k.sticker('stamp', { x: 0.8, y: 0.13, w: 0.2, from: 'pop', at: t('#s6', 0.7), rotate: 14 });
      k.ping({ x: 0.8, y: 0.13, r: 0.07, at: t('#s6', 1.3), count: 2 });
      k.chip('ALL SAID NO', { x: 0.5, y: 0.26, size: 0.07, at: '#no', rotate: -3 });
      k.sticker('chicken', { x: 0.5, y: 0.49, w: 0.44, from: 'bottom', at: '#kfc' });
      k.chip('24 APPLIED', { x: 0.27, y: 0.67, size: 0.062, at: '#apply', rotate: -4, pitch: 2 });
      k.chip('23 HIRED', { x: 0.73, y: 0.67, size: 0.062, at: '#hired', rotate: 4, pitch: 4 });
      k.banner('THE ONE REJECTED', { y: 0.76, at: '#one', size: 0.068 });
    });

    // 6. The question (s7 to s8)
    k.scene({ look: 'blueprint', at: '#s7', out: '#s8' }, () => {
      k.heading('HOW?', { x: 0.5, y: 0.17, size: 0.22, align: 'center', at: t('#s7', 0.1) });
      k.thought({ x: 0.78, y: 0.34, size: 0.11, at: t('#s7', 0.5) });
      k.sticker('jackma', { x: 0.42, y: 0.58, w: 0.52, from: 'bottom', at: t('#s7', 0.35) });
      k.eyes({ x: 0.14, y: 0.34, size: 0.06, at: t('#s7', 0.9) });
    });

    // 7. 1995: America and the internet (s8 to s10)
    k.scene({ look: 'sun', at: '#s8', out: '#s10' }, () => {
      k.chip('1995', { x: 0.22, y: 0.1, size: 0.09, at: t('#s8', 0.1) });
      k.sticker('plane', { x: 0.62, y: 0.22, w: 0.52, from: 'right', at: t('#s8', 0.4) });
      k.chip('USA', { x: 0.22, y: 0.3, size: 0.08, at: t('#s8', 1.5), rotate: -4, pitch: 4 });
      k.sticker('computer', { x: 0.5, y: 0.5, w: 0.5, from: 'bottom', at: '#net', burst: { kind: 'stars', dy: 0.28 } });
      k.note('China Pages:\nwent nowhere', { x: 0.5, y: 0.73, w: 0.6, size: 0.05, at: t('#s9', 0.3), rotate: -2 });
    });

    // 8. 1999: the apartment and the name (s10 to s11)
    k.scene({ look: 'paper', at: '#s10', out: '#s11' }, () => {
      k.chip('1999', { x: 0.5, y: 0.09, size: 0.09, at: t('#s10', 0.1) });
      k.sticker('apartment', { x: 0.34, y: 0.4, w: 0.5, from: 'bottom', at: t('#s10', 0.4) });
      k.chip('17 FRIENDS', { x: 0.72, y: 0.3, size: 0.065, at: '#friends', rotate: 4 });
      k.arrow([0.72, 0.36], [0.58, 0.45], { at: t('#friends', 0.3), bend: -0.3 });
      k.title('ALIBABA', { y: 0.7, size: 0.18, at: '#name', rotate: -3, color: '#ffd84a' });
      k.burst({ x: 0.2, y: 0.62, at: t('#name', 0.3), kind: 'rays' });
      k.burst({ x: 0.82, y: 0.62, at: t('#name', 0.45), kind: 'stars' });
    });

    // 9. 2000: SoftBank money (s11 to s12)
    k.scene({ look: 'blueprint', at: '#s11', out: '#s12' }, () => {
      k.chip('2000', { x: 0.5, y: 0.09, size: 0.09, at: t('#s11', 0.1) });
      k.heading('SOFTBANK', { x: 0.5, y: 0.22, size: 0.1, align: 'center', at: t('#s11', 0.6) });
      k.sticker('money', { x: 0.5, y: 0.5, w: 0.46, from: 'pop', at: '#money', burst: { kind: 'stars', dy: 0.26 } });
      k.chip('$20 MILLION', { x: 0.5, y: 0.72, size: 0.085, at: t('#money', 0.5), rotate: -2, pitch: 5 });
    });

    // 10. 2014: the listing (s12 to s13)
    k.scene({ look: 'sun', at: '#s12', out: '#s13' }, () => {
      k.chip('2014', { x: 0.5, y: 0.09, size: 0.09, at: t('#s12', 0.1) });
      k.sticker('chart', { x: 0.5, y: 0.38, w: 0.56, from: 'bottom', at: t('#s12', 0.4) });
      k.title('$25 BILLION', { y: 0.63, size: 0.14, at: '#raised', rotate: -2 });
      k.burst({ x: 0.18, y: 0.56, at: t('#raised', 0.3), kind: 'rays' });
      k.banner('BIGGEST EVER', { y: 0.77, at: '#biggest' });
    });

    // 11. The payoff (s13 to the end)
    k.scene({ look: 'paper', at: '#s13' }, () => {
      k.sticker('jackma', { x: 0.5, y: 0.5, w: 0.6, from: 'bottom', at: t('#s13', 0.05), burst: { kind: 'stars', dy: 0.33 } });
      k.chip('30 x NO', { x: 0.25, y: 0.15, size: 0.08, at: t('#s13', 0.3), rotate: -5 });
      k.chip('1 x YES', { x: 0.75, y: 0.15, size: 0.08, at: '#yes', rotate: 5, pitch: 6, fill: '#ffd84a' });
      k.banner('ONE OF THE BIGGEST\nCOMPANIES ON EARTH', { y: 0.74, size: 0.06, at: '#big' });
      k.burst({ x: 0.5, y: 0.17, at: t('#big', 0.4), kind: 'stars' });
    });
  },
};

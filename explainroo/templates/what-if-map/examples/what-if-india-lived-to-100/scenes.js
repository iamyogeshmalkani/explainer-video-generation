// What if every Indian lived to 100? A counter from 70 to 100, over-60 bars, pension, hospitals, four generations at one table.
import { setParallel, fly, basemap, kit } from './lib/kit.js';
import { frames } from './lib/frames.js';

setParallel(22);

export default {
  story(s) {
    const t = (m) => s.time(m);
    const MARKS = ['#p1', '#p2', '#p3', '#p4', '#p5', '#end'].map(t);
    const [p1, p2, p3, p4, p5, end] = MARKS;
    const cam = fly(s, [{ lon: 82.5, lat: 21.5, span: 50 }], { beats: MARKS });
    const k = kit(s, cam);
    const f = frames(s, cam);
    const sky = (a, b) => f.backdrop('sky', { at: a - 0.1, out: b - 0.05 });
    const elder = { hair: '#e8e8e8', tie: null, shirt: '#f08c00', pants: '#5c3d2e' };

    basemap(s);
    k.grade(); k.ambient(); k.credit('@YourChannel'); k.vignette();

    // opening: a 100 year old holding a sign
    f.backdrop('sky', { at: -1, out: p1 - 0.05, sound: false });
    f.emoji('💯', { x: 0.5, y: 0.36, size: 280, at: 0.2, out: p1 - 0.05, bob: 6 });
    f.person({ x: 0.5, y: 0.93, height: 0.3, hold: 'sign', mood: 'happy', at: 0.1, from: -0.2, out: p1 - 0.05, outfit: elder });
    f.headline('WHAT IF EVERYONE\nLIVED TO 100?', { at: 0, y: 0.095, out: p1 - 0.05 });

    // 70 becomes 100
    sky(p1, p2);
    f.countUp(70, 100, { at: p1 + 0.3, dur: 2.6, out: p2 - 0.05, y: 0.3, size: 220, suffix: '', color: '#ffd23f', sub: 'YEARS' });
    f.emoji('🎂', { x: 0.5, y: 0.62, size: 230, at: p1 + 3.4, out: p2 - 0.05, bob: 6 });
    f.headline('ADD 30 YEARS', { at: p1 + 0.1, out: p2 - 0.05 });

    // over 60: 1 in 10 becomes 4 in 10
    sky(p2, p3);
    f.bars({ rows: [{ label: 'TODAY', value: 1, color: '#f2a516', text: '1 IN 10' }, { label: 'AT 100', value: 4, color: '#e5342d', text: '4 IN 10', emoji: '🧓' }], at: p2 + 0.4, out: p3 - 0.05, y: 0.78, h: 0.45, w: 0.62, stagger: 0.9 });
    f.headline('OVER 60', { at: p2 + 0.1, out: p3 - 0.05 });

    // pension: 40 years
    sky(p3, p4);
    f.big('40 YEARS', { at: p3 + 0.4, out: p4 - 0.05, y: 0.28, size: 170, color: '#ffffff', sub: 'OF PENSION' });
    f.emoji('💰', { x: 0.25, y: 0.58, size: 190, at: p3 + 2.2, out: p4 - 0.05, bob: 6 });
    f.emoji('🏦', { x: 0.7, y: 0.58, size: 230, at: p3 + 3.2, out: p4 - 0.05, cross: true, crossAt: p3 + 5.8 });
    f.headline('PENSIONS STRETCHED', { at: p3 + 0.1, out: p4 - 0.05, size: 54 });

    // hospitals and elder care
    sky(p4, p5);
    f.emojiRow(['🏥', '💊', '🧠'], { y: 0.36, size: 180, gap: 0.3, stagger: 1.2, at: p4 + 0.6, out: p5 - 0.05, bob: 6 });
    f.banner('ELDER CARE BOOM', { at: p4 + 5.0, out: p5 - 0.05, x: 0.5, y: 0.62, size: 62, color: '#2f9e44' });
    f.headline('HOSPITALS FILL UP', { at: p4 + 0.1, out: p5 - 0.05 });

    // four generations, and the jobs that never open
    sky(p5, end);
    [[0.15, 0.12, 'happy', { shirt: '#ffd23f', tie: null }], [0.38, 0.19, 'happy', { shirt: '#4dabf7', pants: '#24407a' }], [0.62, 0.22, 'happy', { shirt: '#e64980', tie: null, long: true, pants: '#364fc7' }], [0.85, 0.22, 'happy', elder]].forEach(([x, h, mood, outfit], i) =>
      f.person({ x, y: 0.9, height: h, mood, at: p5 + 0.3 + i * 0.5, from: x < 0.5 ? -0.2 : 1.2, out: end - 0.05, outfit }));
    f.emoji('💼', { x: 0.5, y: 0.38, size: 200, at: p5 + 3.6, out: end - 0.05, cross: true, crossAt: p5 + 5.0 });
    f.headline('FOUR GENERATIONS', { at: p5 + 0.1, out: end - 0.05 });

    // closing
    f.backdrop('sky', { at: end - 0.1 });
    f.silhouette('India', { x: 0.5, y: 0.52, w: 0.55, color: '#f6b43a', at: end + 0.1 });
    f.big('100', { at: end + 0.5, y: 0.52, size: 230, color: '#ffffff' });
    f.headline('A LONGER LIFE.\nA BIGGER PLAN.', { at: end + 0.05, y: 0.095 });
    f.person({ x: 0.82, y: 0.9, height: 0.25, hold: 'sign', mood: 'happy', at: end + 0.1, from: 1.3, outfit: elder });

    k.progress();
    k.whatIfCaptions({ size: 64, maxChars: 12, lit: ['100', '70', '30', '60', 'pension', 'hospitals', 'generations'] });
    [p1, p2, p3, p4, p5].forEach((m) => s.sfx('whoosh', m - 0.3, { gain: 0.2 }));
  },
};

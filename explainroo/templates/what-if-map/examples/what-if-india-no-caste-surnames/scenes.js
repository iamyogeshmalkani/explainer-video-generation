// What if India had no caste surnames? Blank nameplates, the shortcut that disappears, identical CVs, Tamil Nadu's Self-Respect Movement, and why caste outlasts a name.
import { setParallel, fly, basemap, kit } from './lib/kit.js';
import { frames } from './lib/frames.js';

setParallel(22);

export default {
  story(s) {
    const t = (m) => s.time(m);
    const MARKS = ['#p1', '#p2', '#p3', '#p4', '#p5', '#end'].map(t);
    const [p1, p2, p3, p4, p5, end] = MARKS;
    const cam = fly(s, [
      { lon: 82.5, lat: 21.5, span: 50 },
      { at: p3 - 0.35, lon: 78.4, lat: 11.1, span: 9, dur: 1.5 },
    ], { beats: MARKS });
    const k = kit(s, cam);
    const f = frames(s, cam);
    const sky = (a, b) => f.backdrop('sky', { at: a - 0.1, out: b - 0.05 });

    // map beat: Tamil Nadu, where people dropped caste surnames (official outline)
    basemap(s);
    k.fill('Tamil Nadu', { color: '#ffd23f', alpha: 0.85, border: '#ffffff', at: p3 + 0.5, out: p4 - 0.05 });
    k.label('TAMIL NADU', { lon: 78.4, lat: 11.1, dash: false, size: 40, plate: true, at: p3 + 1.4, out: p4 - 0.05, sound: false });
    k.tint('#08182b', { at: p3 + 0.2, out: p4 - 0.05, alpha: 0.5, fade: 0.8 });

    k.grade(); k.ambient(); k.credit('@YourChannel'); k.vignette();

    // opening: nameplates that go blank
    f.backdrop('street', { at: -1, out: p1 - 0.05, sound: false });
    [0.3, 0.46, 0.62].forEach((y, i) => {
      f.banner('SURNAME', { at: 0.3 + i * 0.2, out: p1 - 0.05, x: 0.5, y, size: 62, color: '#1c7ed6', rot: i % 2 ? 3 : -3, sound: i === 0 });
      f.cross({ x: 0.5, y, size: 130, at: 1.2 + i * 0.25, out: p1 - 0.05, sound: false });
    });
    f.headline('WHAT IF NO\nCASTE SURNAMES?', { at: 0, y: 0.095, out: p1 - 0.05 });

    // a name says too much
    sky(p1, p2);
    f.emojiRow(['🏷️', '📍', '🏡'], { y: 0.4, size: 200, gap: 0.3, stagger: 1.2, at: p1 + 0.8, out: p2 - 0.05, bob: 6 });
    f.headline('A NAME SAYS\nTOO MUCH', { at: p1 + 0.1, out: p2 - 0.05, y: 0.095 });

    // the shortcut disappears, then identical CVs
    sky(p2, p3);
    f.emojiRow(['🏘️', '💼', '💍'], { y: 0.36, size: 170, gap: 0.3, stagger: 0.8, at: p2 + 0.4, out: p2 + 6.0, bob: 6 });
    f.cross({ x: 0.5, y: 0.36, size: 360, at: p2 + 3.6, out: p2 + 6.0 });
    f.headline('THE SHORTCUT GOES', { at: p2 + 0.1, out: p2 + 6.0 });
    f.backdrop('sky', { at: p2 + 6.1, out: p3 - 0.05 });
    f.emojiRow(['📄', '📄'], { y: 0.32, size: 200, gap: 0.4, stagger: 0.5, at: p2 + 6.4, out: p3 - 0.05, bob: 5 });
    f.bars({ rows: [{ label: 'NAME A', value: 10, color: '#2f9e44', text: 'MORE' }, { label: 'NAME B', value: 6, color: '#e5342d', text: 'FEWER' }], at: p2 + 8.6, out: p3 - 0.05, y: 0.74, h: 0.26, w: 0.62, stagger: 0.7 });
    f.headline('SAME CV, SOME STUDIES', { at: p2 + 6.3, out: p3 - 0.05, size: 50 });

    // caste is more than a name
    f.backdrop('street', { at: p4 - 0.1, out: p5 - 0.05 });
    f.emojiRow(['🏘️', '🍽️', '💍'], { y: 0.36, size: 170, gap: 0.3, stagger: 0.9, at: p4 + 0.6, out: p5 - 0.05, bob: 6 });
    f.banner('STILL THERE', { at: p4 + 5.2, out: p5 - 0.05, x: 0.5, y: 0.6, size: 66 });
    f.headline("CASTE ISN'T\nONLY A NAME", { at: p4 + 0.1, out: p5 - 0.05, y: 0.095 });

    // reservations need records
    sky(p5, end);
    f.emoji('📋', { x: 0.5, y: 0.38, size: 260, at: p5 + 0.4, out: end - 0.05, bob: 5 });
    f.banner('CASTE RECORDS', { at: p5 + 2.2, out: end - 0.05, x: 0.5, y: 0.62, size: 58, color: '#1c7ed6' });
    f.headline('RESERVATIONS NEED\nRECORDS', { at: p5 + 0.1, out: end - 0.05, y: 0.095, size: 50 });

    // closing
    f.backdrop('street', { at: end - 0.1 });
    f.banner('NAME', { at: end + 0.4, x: 0.5, y: 0.4, size: 90, color: '#2f9e44', rot: -3 });
    f.person({ x: 0.5, y: 0.93, height: 0.28, hold: 'sign', mood: 'happy', at: end + 0.1, from: -0.2 });
    f.headline('A FIRST STEP,\nNOT THE LAST', { at: end + 0.05, y: 0.095 });

    k.progress();
    k.whatIfCaptions({ size: 64, maxChars: 12, lit: ['surname', 'caste', 'tamil', 'nadu', 'marry', 'reservations'] });
    [p1, p2, p3, p4, p5].forEach((m) => s.sfx('whoosh', m - 0.3, { gain: 0.2 }));
  },
};

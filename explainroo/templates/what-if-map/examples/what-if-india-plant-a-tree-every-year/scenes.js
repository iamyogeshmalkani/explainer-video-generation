// What if every Indian planted a tree every year? 1.4 billion saplings, 25% to 33% forest, cooler cities, the sapling problem, and keeping them alive.
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

    basemap(s);
    k.grade(); k.ambient(); k.credit('@YourChannel'); k.vignette();

    // opening: a sapling and a person with a watering can
    f.backdrop('sky', { at: -1, out: p1 - 0.05, sound: false });
    f.emoji('🌱', { x: 0.5, y: 0.4, size: 290, at: 0.2, out: p1 - 0.05, bob: 6 });
    f.person({ x: 0.5, y: 0.93, height: 0.28, hold: 'can', mood: 'happy', at: 0.1, from: -0.2, out: p1 - 0.05 });
    f.headline('EVERY INDIAN.\nONE TREE. EVERY YEAR.', { at: 0, y: 0.095, out: p1 - 0.05, size: 50 });

    // 1.4 billion a year
    sky(p1, p2);
    f.countUp(0, 1.4, { at: p1 + 0.1, dur: 1.8, out: p2 - 0.05, y: 0.3, size: 200, decimals: 1, suffix: ' B', color: '#51cf66', sub: 'TREES A YEAR' });
    f.emoji('🌳', { x: 0.5, y: 0.64, size: 230, at: p1 + 1.8, out: p2 - 0.05, bob: 6 });
    f.headline('EVERY YEAR', { at: p1 + 0.1, out: p2 - 0.05 });

    // 25% to 33%
    sky(p2, p3);
    f.bars({ rows: [{ label: 'NOW', value: 25, color: '#2f9e44', text: '~25%' }, { label: 'GOAL', value: 33, color: '#ffd23f', text: '33%', emoji: '🌳' }], at: p2 + 0.4, out: p3 - 0.05, y: 0.78, h: 0.45, w: 0.62, stagger: 0.9 });
    f.headline('FOREST COVER', { at: p2 + 0.1, out: p3 - 0.05 });

    // cooler cities
    sky(p3, p4);
    f.emojiRow(['🏙️', '🌳'], { y: 0.34, size: 210, gap: 0.34, stagger: 0.7, at: p3 + 0.5, out: p4 - 0.05, bob: 6 });
    f.emoji('🌡️', { x: 0.35, y: 0.62, size: 200, at: p3 + 2.6, out: p4 - 0.05, bob: 4 });
    f.arrowUp({ x: 0.68, y: 0.62, size: 230, down: true, color: '#2f9e44', at: p3 + 3.6, out: p4 - 0.05 });
    f.headline('COOLER CITIES', { at: p3 + 0.1, out: p4 - 0.05 });

    // saplings: the scale, and nowhere to plant
    sky(p4, p5);
    f.emojiRow(['🌱', '💧', '🌍'], { y: 0.28, size: 160, gap: 0.28, stagger: 0.8, at: p4 + 0.4, out: p4 + 7.2, bob: 6 });
    f.big('1.4 B', { at: p4 + 3.4, out: p4 + 7.2, y: 0.55, size: 200, color: '#ffffff', sub: 'SAPLINGS' });
    f.emoji('🏢', { x: 0.5, y: 0.42, size: 270, at: p4 + 7.4, out: p5 - 0.05, cross: true, crossAt: p4 + 8.8 });
    f.banner('NOWHERE TO PLANT', { at: p4 + 8.9, out: p5 - 0.05, x: 0.5, y: 0.66, size: 50 });
    f.headline('A HUGE JOB', { at: p4 + 0.1, out: p5 - 0.05 });

    // saplings that die without water
    sky(p5, end);
    f.emojiRow(['🌱', '🌱', '🌱', '🌱'], { y: 0.36, size: 150, gap: 0.22, stagger: 0.4, at: p5 + 0.4, out: p5 + 3.2, bob: 5 });
    f.emojiRow(['🥀', '🌱', '🥀', '🌱'], { y: 0.36, size: 150, gap: 0.22, stagger: 0.2, at: p5 + 3.3, out: end - 0.05, bob: 5 });
    f.banner('NO ONE WATERS', { at: p5 + 4.6, out: end - 0.05, x: 0.5, y: 0.62, size: 62 });
    f.headline('THE HARD PART', { at: p5 + 0.1, out: end - 0.05 });

    // closing
    f.backdrop('sky', { at: end - 0.1 });
    f.emoji('🌳', { x: 0.5, y: 0.44, size: 300, at: end + 0.3, bob: 6 });
    f.person({ x: 0.2, y: 0.93, height: 0.25, hold: 'can', mood: 'happy', at: end + 0.1, from: -0.2 });
    f.headline('KEEP IT ALIVE', { at: end + 0.05, y: 0.075 });

    k.progress();
    k.whatIfCaptions({ size: 64, maxChars: 12, lit: ['trees', 'billion', 'quarter', 'third', 'saplings', 'water'] });
    [p1, p2, p3, p4, p5].forEach((m) => s.sfx('whoosh', m - 0.3, { gain: 0.2 }));
  },
};

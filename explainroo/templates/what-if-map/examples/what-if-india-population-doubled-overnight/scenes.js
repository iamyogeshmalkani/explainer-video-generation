// What if India's population doubled overnight? A counter to 2.8 billion, the same map with twice the dots, then food, water and queues times two.
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

    // map beat: the same land, 440 people per sq km, then 900 (official outline)
    basemap(s);
    k.fill('India', { color: '#1b6b4a', alpha: 0.85, border: '#ffffff', at: p2 - 0.1, out: p3 - 0.05, sound: false });
    f.swarm('India', { n: 1000, at: p2 + 0.2, dur: 1.6, out: p3 - 0.05, icon: 'coin', size: 7, color: '#ffffff', seed: 2 });
    f.swarm('India', { n: 1000, at: p2 + 3.4, dur: 1.6, out: p3 - 0.05, icon: 'coin', size: 7, color: '#ffd23f', seed: 17 });

    k.grade(); k.ambient(); k.credit('@YourChannel'); k.vignette();

    // opening: the counter spins from 1.4 to 2.8 billion
    f.backdrop('sky', { at: -1, out: p1 - 0.05, sound: false });
    f.silhouette('India', { x: 0.5, y: 0.62, w: 0.5, color: '#f6b43a', at: 0.3, out: p1 - 0.05 });
    f.countUp(1.4, 2.8, { at: 0.4, dur: 2.0, out: p1 - 0.05, y: 0.3, size: 200, decimals: 1, suffix: ' B', color: '#ff6b6b', sub: 'PEOPLE' });
    f.person({ x: 0.83, y: 0.92, height: 0.2, mood: 'shock', at: 0.1, from: 1.3, out: p1 - 0.05 });
    f.headline('WHAT IF INDIA\nDOUBLED TONIGHT?', { at: 0, y: 0.095, out: p1 - 0.05 });

    // 2.8 billion = India + China today
    sky(p1, p2);
    f.big('2.8 B', { at: p1 + 0.3, out: p2 - 0.05, y: 0.3, size: 230, color: '#ff6b6b' });
    f.banner('INDIA + CHINA TODAY', { at: p1 + 2.2, out: p2 - 0.05, x: 0.5, y: 0.58, size: 54, color: '#1c7ed6' });
    f.headline('THE SAME AS BOTH', { at: p1 + 0.1, out: p2 - 0.05 });

    // map labels
    f.big('440', { at: p2 + 0.3, out: p2 + 3.2, y: 0.16, size: 190, color: '#ffffff', sub: 'PER SQ KM' });
    f.big('900', { at: p2 + 3.4, out: p3 - 0.05, y: 0.16, size: 230, color: '#ffd23f', sub: 'PER SQ KM' });

    // food goes first
    sky(p3, p4);
    f.emojiRow(['🍚', '🥛', '🥦'], { y: 0.38, size: 200, gap: 0.3, stagger: 0.7, at: p3 + 0.8, out: p4 - 0.05, bob: 6 });
    f.big('× 2', { at: p3 + 4.2, out: p4 - 0.05, y: 0.64, size: 240 });
    f.headline('FOOD GOES FIRST', { at: p3 + 0.1, out: p4 - 0.05 });

    // then water
    sky(p4, p5);
    f.emojiRow(['💧', '🚰', '🚚'], { y: 0.38, size: 200, gap: 0.3, stagger: 0.7, at: p4 + 0.8, out: p5 - 0.05, bob: 6 });
    f.big('× 2', { at: p4 + 4.8, out: p5 - 0.05, y: 0.64, size: 240 });
    f.headline('THEN WATER', { at: p4 + 0.1, out: p5 - 0.05 });

    // every queue doubles
    f.backdrop('street', { at: p5 - 0.1, out: end - 0.05 });
    f.emojiRow(['🚆', '🏫', '🏥', '💼'], { y: 0.34, size: 130, gap: 0.2, stagger: 0.5, at: p5 + 0.4, out: end - 0.05, bob: 5 });
    [0.2, 0.35, 0.5, 0.65].forEach((x, i) => f.person({ x, y: 0.92, height: 0.2, mood: 'worried', at: p5 + 1.2 + i * 0.3, from: -0.2, out: end - 0.05, outfit: { shirt: ['#ffd23f', '#4dabf7', '#ff6b6b', '#51cf66'][i], tie: null } }));
    f.big('× 2', { at: p5 + 3.0, out: end - 0.05, y: 0.58, size: 220 });
    f.headline('EVERY QUEUE DOUBLES', { at: p5 + 0.1, out: end - 0.05, size: 52 });

    // closing
    f.backdrop('sky', { at: end - 0.1 });
    f.silhouette('India', { x: 0.45, y: 0.52, w: 0.55, color: '#f6b43a', at: end + 0.1 });
    f.big('2.8 B', { at: end + 0.6, y: 0.52, size: 200, color: '#ffffff' });
    f.headline('TWICE THE\nPEOPLE', { at: end + 0.05, y: 0.095 });
    f.person({ x: 0.82, y: 0.9, height: 0.25, hold: 'sign', mood: 'shock', at: end + 0.1, from: 1.3 });

    k.progress();
    k.whatIfCaptions({ size: 64, maxChars: 12, lit: ['billion', 'double', 'food', 'water', 'twice', 'queue'] });
    [p1, p2, p3, p4, p5].forEach((m) => s.sfx('whoosh', m - 0.3, { gain: 0.2 }));
  },
};

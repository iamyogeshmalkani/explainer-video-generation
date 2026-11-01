// What if every Indian city had Mumbai's density? Crowd dots on Mumbai, Delhi and Bengaluru, 52 crore city dwellers, Meghalaya's size, what it frees up, and the cost.
import { setParallel, fly, basemap, kit } from './lib/kit.js';
import { frames } from './lib/frames.js';

setParallel(22);

export default {
  story(s) {
    const t = (m) => s.time(m);
    const MARKS = ['#p1', '#p2', '#p3', '#p4', '#p5', '#end'].map(t);
    const [p1, p2, p3, p4, p5, end] = MARKS;
    const cam = fly(s, [
      { lon: 72.88, lat: 19.05, span: 2.6 },
      { at: p1 - 0.35, lon: 77.21, lat: 28.6, span: 2.6, dur: 1.5 },
      { at: p1 + 4.2, lon: 77.59, lat: 12.97, span: 2.6, dur: 1.4 },
      { at: p3 - 0.35, lon: 91.3, lat: 25.5, span: 4, dur: 1.5 },
    ], { beats: MARKS });
    const k = kit(s, cam);
    const f = frames(s, cam);
    const sky = (a, b) => f.backdrop('sky', { at: a - 0.1, out: b - 0.05 });

    // map beats: crowd dots on three cities, then Meghalaya (official outline for the state)
    basemap(s);
    k.tint('#08182b', { at: 0, out: p2 - 0.05, alpha: 0.7, fade: 0.8 });
    f.crowd({ lon: 72.88, lat: 19.05, r0: 0.03, r1: 0.3, n: 1200, at: 0.3, dur: 1.6, out: p1 - 0.05, size: 3.6, colors: ['#ffd23f', '#ffffff'], sound: false });
    k.label('MUMBAI', { lon: 72.88, lat: 19.3, dash: false, size: 40, plate: true, at: 1.0, out: p1 - 0.05, sound: false });
    f.crowd({ lon: 77.21, lat: 28.6, r0: 0.03, r1: 0.3, n: 600, at: p1 + 0.4, dur: 1.4, out: p2 - 0.05, size: 3.6, colors: ['#ff6b6b', '#ffffff'], sound: false });
    k.label('DELHI', { lon: 77.21, lat: 28.85, dash: false, size: 40, plate: true, at: p1 + 1.0, out: p2 - 0.05, sound: false });
    f.crowd({ lon: 77.59, lat: 12.97, r0: 0.03, r1: 0.3, n: 300, at: p1 + 4.6, dur: 1.2, out: p2 - 0.05, size: 3.6, colors: ['#4dd2ff', '#ffffff'], sound: false });
    k.label('BENGALURU', { lon: 77.59, lat: 13.2, dash: false, size: 40, plate: true, at: p1 + 5.0, out: p2 - 0.05, sound: false });
    k.tint('#08182b', { at: p3 - 0.1, out: p4 - 0.05, alpha: 0.7, fade: 0.6 });
    k.fill('Meghalaya', { color: '#f2a516', alpha: 0.8, border: '#ffffff', at: p3 + 0.3, out: p4 - 0.05 });
    f.crowd({ lon: 91.3, lat: 25.5, r0: 0.05, r1: 0.45, n: 900, at: p3 + 1.0, dur: 1.6, out: p4 - 0.05, size: 3.6, colors: ['#ffd23f', '#ffffff'], sound: false });
    k.label('MEGHALAYA', { lon: 91.3, lat: 25.95, dash: false, size: 40, plate: true, at: p3 + 1.4, out: p4 - 0.05, sound: false });

    k.grade(); k.ambient(); k.credit('@YourChannel'); k.vignette();

    f.headline('WHAT IF EVERY CITY\nWAS MUMBAI?', { at: 0, y: 0.095, out: p1 - 0.05 });
    f.headline('21,000 PER SQ KM', { at: 1.2, y: 0.22, out: p1 - 0.05, size: 54 });
    f.headline('DELHI: ABOUT HALF', { at: p1 + 0.3, out: p1 + 4.2, y: 0.075, size: 54 });
    f.headline('OTHERS: FAR LESS', { at: p1 + 4.4, out: p2 - 0.05, y: 0.075, size: 54 });

    // 52 crore live in cities
    sky(p2, p3);
    f.big('52 CRORE', { at: p2 + 0.3, out: p3 - 0.05, y: 0.3, size: 190, color: '#ffd23f', sub: 'LIVE IN CITIES' });
    f.emoji('🏙️', { x: 0.5, y: 0.62, size: 230, at: p2 + 1.6, out: p3 - 0.05, bob: 6 });
    f.headline('INDIA IN CITIES', { at: p2 + 0.1, out: p3 - 0.05 });

    f.headline('ALL FIT IN ONE MEGHALAYA', { at: p3 + 0.1, out: p4 - 0.05, y: 0.075, size: 46 });

    // what it frees up
    sky(p4, p5);
    f.emojiRow(['🌾', '🌳', '🚶', '🚌'], { y: 0.38, size: 140, gap: 0.22, stagger: 0.7, at: p4 + 0.6, out: p5 - 0.05, bob: 5 });
    f.headline('WHAT IT FREES UP', { at: p4 + 0.1, out: p5 - 0.05 });

    // the cost: packed trains, pricey homes
    f.backdrop('station', { at: p5 - 0.1, out: p5 + 5.4 });
    f.big('7 MILLION', { at: p5 + 1.0, out: p5 + 5.4, y: 0.4, size: 170, color: '#ffffff', sub: 'RIDERS A DAY' });
    f.headline('PACKED TRAINS', { at: p5 + 0.1, out: p5 + 5.4 });
    f.backdrop('sky', { at: p5 + 5.5, out: end - 0.05 });
    f.emojiRow(['🏢', '🏚️'], { y: 0.36, size: 210, gap: 0.34, stagger: 0.8, at: p5 + 5.8, out: end - 0.05, bob: 6 });
    f.banner('PRICEY HOMES', { at: p5 + 7.6, out: end - 0.05, x: 0.5, y: 0.62, size: 62, color: '#e5342d' });
    f.headline('THE COST', { at: p5 + 5.6, out: end - 0.05 });

    // closing
    f.backdrop('sky', { at: end - 0.1 });
    f.silhouette('India', { x: 0.5, y: 0.52, w: 0.5, color: '#f6b43a', at: end + 0.1 });
    f.banner('PLANNING', { at: end + 1.4, x: 0.5, y: 0.52, size: 100, color: '#2f9e44', rot: -4 });
    f.headline("CROWDING ISN'T\nTHE PROBLEM", { at: end + 0.05, y: 0.095 });
    f.person({ x: 0.82, y: 0.9, height: 0.25, hold: 'sign', mood: 'happy', at: end + 0.1, from: 1.3 });

    k.progress();
    k.whatIfCaptions({ size: 64, maxChars: 12, lit: ['mumbai', 'delhi', '21,000', 'crore', 'meghalaya', 'planning'] });
    [p1, p2, p3, p4, p5].forEach((m) => s.sfx('whoosh', m - 0.3, { gain: 0.2 }));
  },
};

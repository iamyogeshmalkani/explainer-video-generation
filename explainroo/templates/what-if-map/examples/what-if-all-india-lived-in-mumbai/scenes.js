// What if all of India lived in Mumbai? A zoomed Mumbai map filling with dots, cut-aways for the numbers, then the dots flood out.
import { setParallel, fly, basemap, kit, addRegion } from './lib/kit.js';
import { frames } from './lib/frames.js';

setParallel(19);

// Greater Mumbai (the city), a hand-drawn outline of about 600 square kilometres. Approximate, for a schematic map.
addRegion('Mumbai', [[72.806, 18.905], [72.815, 18.93], [72.810, 18.96], [72.803, 18.985], [72.815, 19.01], [72.822, 19.05], [72.828, 19.085], [72.822, 19.12], [72.805, 19.14], [72.795, 19.175], [72.795, 19.21], [72.80, 19.245], [72.835, 19.27], [72.87, 19.27], [72.89, 19.24], [72.905, 19.20], [72.935, 19.185], [72.96, 19.17], [72.945, 19.12], [72.93, 19.08], [72.92, 19.045], [72.90, 19.03], [72.885, 19.04], [72.87, 19.01], [72.855, 18.98], [72.845, 18.95], [72.835, 18.92]]);

export default {
  story(s) {
    const t = (m) => s.time(m);
    const MARKS = ['#area', '#crowd', '#nospace', '#trains', '#water', '#grow', '#end'].map(t);
    const cam = fly(s, [
      { lon: 72.89, lat: 19.09, span: 1.0 },
      { at: t('#grow') - 0.3, lon: 73.3, lat: 18.9, span: 11, dur: 2.0 },
    ], { beats: MARKS });
    const k = kit(s, cam);
    const f = frames(s, cam);

    basemap(s);
    k.tint('#08182b', { at: 0, out: t('#grow') - 0.2, alpha: 0.82, fade: 0.01 });     // the satellite is blurry this close, so it sits far back
    // the city, filling up with people
    k.fill('Mumbai', { color: '#f6b43a', alpha: 0.55, border: '#ffffff', at: 0.2, out: t('#crowd'), sound: false });
    f.swarm('Mumbai', { n: 700, at: 0.3, dur: 2.6, out: t('#crowd'), icon: 'coin', size: 5, color: '#ffffff', seed: 3 });
    k.label('MUMBAI', { lon: 72.78, lat: 19.33, dash: false, size: 44, plate: true, at: t('#area') + 0.1, out: t('#crowd') });
    f.swarm('Mumbai', { n: 1400, at: t('#area') + 3.5, dur: 2.2, out: t('#crowd'), icon: 'coin', size: 5, color: '#ff6b6b', seed: 9 });

    // everyone: the dots flood past the city limits
    k.fill('Mumbai', { color: '#d7282f', alpha: 0.6, border: '#ffffff', at: t('#grow') - 0.2, sound: false });
    f.crowd({ lon: 72.9, lat: 19.1, lon1: 73.35, lat1: 19.05, r0: 0.14, r1: 1.15, n: 3400, at: t('#grow') - 0.2, dur: 1.2, growAt: t('#grow') + 0.4, growDur: 3.8, size: 4.2, colors: ['#ffd23f', '#ff6b6b', '#ffffff'] });
    k.label('THANE', { lon: 72.98, lat: 19.2, dash: false, size: 38, plate: true, at: t('#grow') + 1.9 });
    k.label('PUNE', { lon: 73.86, lat: 18.52, dash: false, size: 38, plate: true, at: t('#grow') + 3.6 });
    k.label('NASHIK', { lon: 73.79, lat: 20.0, dash: false, size: 38, plate: true, at: t('#grow') + 3.0 });

    k.grade(); k.ambient(); k.credit('@YourChannel'); k.vignette();

    // opening: the map fills up; a person holds the question
    f.headline('WHAT IF ALL\nOF INDIA LIVED HERE?', { at: 0, y: 0.095, out: t('#area') - 0.05 });
    f.person({ x: 0.72, y: 0.9, height: 0.25, hold: 'sign', mood: 'shock', at: 0.1, from: 1.2, out: t('#area') - 0.05 });

    // 600 square kilometres
    f.big('600 km²', { at: t('#area') + 0.3, out: t('#crowd') - 0.05, y: 0.22, size: 200, sub: 'THE WHOLE CITY' });

    // all of India in one city
    f.backdrop('sky', { at: t('#crowd') - 0.1, out: t('#nospace') - 0.05 });
    f.silhouette('India', { x: 0.3, y: 0.42, w: 0.46, color: '#f6b43a', at: t('#crowd') + 0.1, out: t('#nospace') - 0.05 });
    f.emoji('➡️', { x: 0.58, y: 0.42, size: 150, at: t('#crowd') + 0.6, out: t('#nospace') - 0.05, bob: 6 });
    f.emoji('🏙️', { x: 0.82, y: 0.42, size: 230, at: t('#crowd') + 0.9, out: t('#nospace') - 0.05, bob: 6 });
    f.countUp(20000, 2300000, { at: t('#crowd') + 2.2, dur: 2.8, out: t('#nospace') - 0.05, y: 0.66, size: 130, color: '#ff6b6b', sub: 'PEOPLE PER KM²' });
    f.headline('100× MORE CROWDED', { at: t('#crowd') + 0.1, out: t('#nospace') - 0.05 });

    // no space
    f.backdrop('sky', { at: t('#nospace') - 0.1, out: t('#trains') - 0.05 });
    f.emoji('🏠', { x: 0.2, y: 0.42, size: 220, at: t('#nospace') + 0.2, out: t('#trains') - 0.05, cross: true, crossAt: t('#nospace') + 1.0 });
    f.emoji('🛣️', { x: 0.5, y: 0.42, size: 220, at: t('#nospace') + 0.5, out: t('#trains') - 0.05, cross: true, crossAt: t('#nospace') + 1.4 });
    f.emoji('🌳', { x: 0.8, y: 0.42, size: 220, at: t('#nospace') + 0.9, out: t('#trains') - 0.05, cross: true, crossAt: t('#nospace') + 1.8 });
    f.headline('NO SPACE LEFT', { at: t('#nospace') + 0.1, out: t('#trains') - 0.05 });

    // local trains
    f.backdrop('station', { at: t('#trains') - 0.1, out: t('#water') - 0.05 });
    f.train({ x: 0.02, y: 0.93, size: 0.9, at: t('#trains') - 0.1, out: t('#water') - 0.05, sound: false });
    f.queue({ y: 0.7, items: ['🧍', '🧍‍♀️', '🧍‍♂️'], n: 10, at: t('#trains') + 0.2, gap: 0.16, x0: 0.07, spacing: 0.095, size: 135, out: t('#water') - 0.05 });
    f.banner('IMPOSSIBLE', { at: t('#trains') + 1.5, out: t('#water') - 0.05, x: 0.5, y: 0.4, size: 80 });
    f.headline('LOCAL TRAINS', { at: t('#trains') + 0.1, y: 0.095, out: t('#water') - 0.05 });

    // water
    f.backdrop('sky', { at: t('#water') - 0.1, out: t('#grow') - 0.05 });
    f.emoji('🚰', { x: 0.5, y: 0.45, size: 330, at: t('#water') + 0.2, out: t('#grow') - 0.05 });
    [0.35, 0.5, 0.65].forEach((x, i) => f.emoji('💧', { x, y: 0.58, size: 110, at: t('#water') + 0.8 + i * 0.35, to: { x, y: 0.82 }, dur: 1.1, moveAt: t('#water') + 1.0 + i * 0.35, out: t('#grow') - 0.05, pop: true }));
    f.headline('WATER EVERY DAY', { at: t('#water') + 0.1, out: t('#grow') - 0.05 });

    // closing
    f.headline('MUMBAI IS\nALREADY PACKED', { at: t('#end') + 0.05, y: 0.095 });
    f.person({ x: 0.72, y: 0.9, height: 0.25, hold: 'sign', mood: 'worried', at: t('#end') + 0.1, from: 1.2 });

    k.progress();
    k.whatIfCaptions({ size: 64, maxChars: 12, lit: ['mumbai', 'hundred', 'crowded', 'water', 'packed'] });
    [t('#crowd'), t('#nospace'), t('#trains'), t('#water'), t('#grow')].forEach((m) => s.sfx('whoosh', m - 0.3, { gain: 0.2 }));
  },
};

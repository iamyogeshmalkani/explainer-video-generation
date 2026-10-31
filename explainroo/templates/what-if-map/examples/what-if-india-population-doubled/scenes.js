// What if India had 2.8 billion people? A counter, a map of dots, food, and Delhi's neighbours growing into one city.
import { setParallel, fly, basemap, kit } from './lib/kit.js';
import { frames } from './lib/frames.js';

setParallel(22);

const NCR = { Delhi: [77.21, 28.61], Gurugram: [77.03, 28.46], Noida: [77.39, 28.54], Ghaziabad: [77.43, 28.67], Faridabad: [77.31, 28.41] };

export default {
  story(s) {
    const t = (m) => s.time(m);
    const MARKS = ['#already', '#food', '#water', '#cities', '#power', '#roads', '#end'].map(t);
    const cam = fly(s, [
      { lon: 82.5, lat: 21.5, span: 50 },
      { at: t('#cities') - 0.35, lon: 77.2, lat: 28.55, span: 2.4, dur: 1.5 },
    ], { beats: MARKS });
    const k = kit(s, cam);
    const f = frames(s, cam);

    basemap(s);
    // map beat 1: 1.4 billion dots across India (official outline), then the same again
    k.fill('India', { color: '#1b6b4a', alpha: 0.85, border: '#ffffff', at: t('#already') - 0.1, out: t('#food') - 0.05, sound: false });
    f.swarm('India', { n: 1100, at: t('#already') + 0.2, dur: 1.8, out: t('#food') - 0.05, icon: 'coin', size: 7, color: '#ffffff', seed: 2 });
    f.swarm('India', { n: 1100, at: t('#already') + 3.0, dur: 1.8, out: t('#food') - 0.05, icon: 'coin', size: 7, color: '#ffd23f', seed: 17 });

    // map beat 2: Delhi and its neighbours grow into one city
    k.tint('#08182b', { at: t('#cities') - 0.1, out: t('#power') - 0.05, alpha: 0.7, fade: 0.8 });
    const cols = ['#ffd23f', '#ff6b6b', '#4dd2ff', '#7cff6b', '#c77dff'];
    Object.entries(NCR).forEach(([name, [lon, lat]], i) => {
      f.crowd({ lon, lat, r0: 0.03, r1: 0.2, n: 380, at: t('#cities') + 1.0 + i * 0.25, dur: 0.9, growAt: t('#cities') + 2.4, growDur: 2.4, out: t('#power') - 0.05, size: 3.6, colors: [cols[i], '#ffffff'], sound: false });
      k.label(name.toUpperCase(), { lon, lat: lat + (i === 0 ? 0.01 : i % 2 ? 0.1 : -0.12), dash: false, size: 34, plate: true, at: t('#cities') + 1.2 + i * 0.25, out: t('#cities') + 3.6, sound: false });
    });

    k.grade(); k.ambient(); k.credit('@YourChannel'); k.vignette();

    // opening: the counter spins up from 1.4 to 2.8 billion
    f.backdrop('sky', { at: -1, out: t('#already') - 0.05, sound: false });
    f.silhouette('India', { x: 0.5, y: 0.6, w: 0.58, color: '#f6b43a', at: 0.3, out: t('#already') - 0.05 });
    f.countUp(1.4, 2.8, { at: 0.4, dur: 2.0, out: t('#already') - 0.05, y: 0.3, size: 200, decimals: 1, suffix: ' B', color: '#ff6b6b', sub: 'PEOPLE' });
    f.person({ x: 0.83, y: 0.92, height: 0.2, mood: 'shock', at: 0.1, from: 1.3, out: t('#already') - 0.05 });
    f.headline('WHAT IF INDIA\nDOUBLED?', { at: 0, y: 0.095, out: t('#already') - 0.05 });

    f.big('1.4 B', { at: t('#already') + 0.3, out: t('#already') + 2.9, y: 0.16, size: 190, color: '#ffffff' });
    f.big('× 2', { at: t('#already') + 3.2, out: t('#food') - 0.05, y: 0.16, size: 230, color: '#ffd23f' });

    // food on the same land
    f.backdrop('sky', { at: t('#food') - 0.1, out: t('#water') - 0.05 });
    f.emojiRow(['🍚', '🌾', '🥦'], { y: 0.4, size: 210, gap: 0.3, stagger: 0.6, at: t('#food') + 0.9, out: t('#water') - 0.05, bob: 6 });
    f.big('× 2', { at: t('#food') + 3.0, out: t('#water') - 0.05, x: 0.5, y: 0.62, size: 230 });
    f.silhouette('India', { x: 0.5, y: 0.85, w: 0.2, color: '#f6b43a', at: t('#food') + 4.6, out: t('#water') - 0.05 });
    f.banner('SAME LAND', { at: t('#food') + 4.9, out: t('#water') - 0.05, x: 0.5, y: 0.74, size: 62, color: '#2f9e44' });
    f.headline('FIRST, FOOD', { at: t('#food') + 0.1, out: t('#water') - 0.05 });

    // water, homes, jobs
    f.backdrop('sky', { at: t('#water') - 0.1, out: t('#cities') - 0.05 });
    f.emojiRow(['💧', '🏠', '💼'], { y: 0.42, size: 220, gap: 0.3, stagger: 0.5, at: t('#water') + 0.1, out: t('#cities') - 0.05, bob: 6 });
    f.headline('WATER, HOMES, JOBS', { at: t('#water') + 0.1, out: t('#cities') - 0.05 });

    // cities merge
    f.headline('ONE BIG CITY', { at: t('#cities') + 2.6, out: t('#power') - 0.05 });

    // electricity demand
    f.backdrop('sky', { at: t('#power') - 0.1, out: t('#roads') - 0.05 });
    f.bars({ rows: [{ label: 'TODAY', value: 1, color: '#f2a516', text: '1×' }, { label: 'DOUBLE', value: 2, color: '#e5342d', text: '2×', emoji: '⚡' }], at: t('#power') + 0.1, out: t('#roads') - 0.05, y: 0.75, h: 0.4, w: 0.6, stagger: 0.5 });
    f.headline('POWER DEMAND SOARS', { at: t('#power') + 0.1, out: t('#roads') - 0.05 });

    // everything doubles
    f.backdrop('sky', { at: t('#roads') - 0.1, out: t('#end') - 0.05 });
    f.emojiRow(['🛣️', '🛣️', '🏫', '🏫', '🏥', '🏥'], { y: 0.42, size: 150, gap: 0.16, stagger: 0.45, at: t('#roads') + 0.1, out: t('#end') - 0.05, bob: 6 });
    f.big('× 2', { at: t('#roads') + 3.4, out: t('#end') - 0.05, y: 0.68, size: 240 });
    f.headline('ROADS, SCHOOLS, HOSPITALS', { at: t('#roads') + 0.1, out: t('#end') - 0.05, size: 54 });

    // closing
    f.backdrop('sky', { at: t('#end') - 0.1 });
    f.silhouette('India', { x: 0.45, y: 0.52, w: 0.55, color: '#f6b43a', at: t('#end') + 0.1 });
    f.headline('1.4 BILLION.\nNOW DOUBLE IT.', { at: t('#end') + 0.05, y: 0.095 });
    f.person({ x: 0.8, y: 0.9, height: 0.25, hold: 'sign', mood: 'shock', at: t('#end') + 0.1, from: 1.3 });

    k.progress();
    k.whatIfCaptions({ size: 64, maxChars: 12, lit: ['billion', 'double', 'food', 'water', 'jobs', 'electricity'] });
    [t('#already'), t('#food'), t('#water'), t('#cities'), t('#power'), t('#roads')].forEach((m) => s.sfx('whoosh', m - 0.3, { gain: 0.2 }));
  },
};

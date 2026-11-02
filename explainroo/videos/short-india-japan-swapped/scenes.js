// What if India and Japan swapped places? A 20 s Short that loops: the two outlines swap at the start, India lands off China's coast, Japan lands in
// South Asia, and at the end they slide back so the last frame matches the first. Schematic: shapes move flat on the map (true size, small distortion).
import { setParallel, basemap, kit } from './lib/kit.js';
import { cinema, cine } from './lib/cine.js';
import { centroid, ringsOf } from './lib/series.js';

setParallel(30);
const sm = (q) => { q = Math.min(1, Math.max(0, q)); return q * q * (3 - 2 * q); };

export default {
  story(s) {
    const t = (m) => s.time(m);
    const MARKS = ['#east', '#south', '#end'].map(t);
    const end = s.dur;
    const cam = cinema(s, [
      { lon: 108, lat: 30, span: 100, tilt: 0.15 },
      { at: t('#east') - 0.4, dur: 2.0, lon: 136, lat: 35, span: 62, tilt: 0.3 },
      { at: t('#south') - 0.4, dur: 2.2, lon: 81, lat: 25, span: 40, tilt: 0.32 },
      { at: t('#end') - 0.9, dur: 1.7, lon: 108, lat: 30, span: 100, tilt: 0.15 },
    ], { beats: MARKS });
    const k = kit(s, cam); const c = cine(s, cam);

    const [iLon, iLat] = centroid(ringsOf('India')); const [jLon, jLat] = centroid(ringsOf('Japan', false));
    const toJapan = [jLon - iLon, jLat - iLat];
    const swap = (v) => (tt) => { const p = sm((tt - 0.5) / 0.9) * (1 - sm((tt - (t('#end') - 0.2)) / 1.0)); return [v[0] * p, v[1] * p]; };

    basemap(s); c.dim(0.5);
    c.shape('India', { fill: '#f2a516', alpha: 0.7, border: '#ffe3a3', offset: swap(toJapan), at: 0 });
    c.shape('Japan', { fill: '#3da5ff', alpha: 0.8, border: '#bfe3ff', offset: swap([-toJapan[0], -toJapan[1]]), mainland: false, at: 0 });
    // labels follow the swap: before, during the hold after it, and again at the end
    const lab = (txt, lon, lat, deg, col, a, o) => c.ground(txt, { lon, lat, deg, color: col, at: a, out: o });
    lab('INDIA', iLon, iLat - 1, 2.6, '#ffffff', 0, 0.9); lab('JAPAN', jLon, jLat, 1.6, '#ffffff', 0, 0.9);
    lab('INDIA', jLon, jLat - 1, 2.6, '#ffffff', 1.3, t('#end') - 0.2); lab('JAPAN', iLon, iLat, 1.6, '#ffffff', 1.3, t('#end') - 0.2);
    lab('INDIA', iLon, iLat - 1, 2.6, '#ffffff', t('#end') + 0.9, end + 1); lab('JAPAN', jLon, jLat, 1.6, '#ffffff', t('#end') + 0.9, end + 1);
    // India in East Asia
    lab('CHINA', 112, 38, 2.2, '#ffd84a', t('#east'), t('#south')); lab('KOREA', 127.6, 36.4, 1.1, '#ffd84a', t('#east') + 0.8, t('#south')); lab('RUSSIA', 136, 52, 2.4, '#ffd84a', t('#east') + 1.6, t('#south'));
    // Japan in South Asia
    lab('PAKISTAN', 67.5, 30.2, 1.7, '#ffd84a', t('#south'), t('#end') - 0.6); lab('CHINA', 88, 37, 2.2, '#ffd84a', t('#south') + 0.6, t('#end') - 0.6); lab('BANGLADESH', 91.2, 23.0, 0.9, '#ffd84a', t('#south') + 1.2, t('#end') - 0.6);

    c.zoomBlur(); c.tilt();
    k.stat('9×', { at: t('#east') + 0.3, out: t('#south') - 0.3, label: 'bigger than Japan', y: 0.62, size: 130 });
    c.chip("Right off China's coast", { lon: 123.5, lat: 35.0, at: t('#east') + 1.2, out: t('#south') - 0.3, size: 34 });
    c.chip('Between Pakistan, China and Bangladesh', { lon: 80.0, lat: 24.0, at: t('#south') + 1.4, out: t('#end') - 0.6, size: 32 });

    k.grade(); k.ambient(); k.vignette();
    k.credit('Map is schematic', { y: 0.955 });
    k.hook('What if India and Japan *swapped places*?', { at: 0.1, out: 2.4 });
    k.hook('Which would *struggle*?', { at: t('#end') + 0.2, out: end, y: 0.17 });
    k.progress();
    k.whatIfCaptions({ size: 64, maxChars: 12 });
  },
};

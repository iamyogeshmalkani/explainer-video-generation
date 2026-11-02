// What if India was the size of Russia? India's outline (true shape) scales up on Russia until its area matches (about 5 times), a density counter
// falls from 430 to 80 people per square kilometre, then India shrinks back so the Short loops. Schematic.
import { setParallel, basemap, kit } from './lib/kit.js';
import { cinema, cine } from './lib/cine.js';
import { moved, unwrap, ringsOf } from './lib/series.js';

setParallel(55);
const sm = (q) => { q = Math.min(1, Math.max(0, q)); return q * q * (3 - 2 * q); };

export default {
  story(s) {
    const t = (m) => s.time(m);
    const MARKS = ['#area', '#density', '#end'].map(t);
    const end = s.dur;
    const cam = cinema(s, [
      { lon: 100, lat: 55, span: 100, tilt: 0.2 },
      { at: t('#density') - 0.3, dur: 2.0, lon: 100, lat: 55, span: 84, tilt: 0.28 },
      { at: end - 2.6, dur: 1.8, lon: 100, lat: 55, span: 100, tilt: 0.2 },
    ], { beats: MARKS, focusY: 0.3 });
    const k = kit(s, cam); const c = cine(s, cam);

    basemap(s); c.dim(0.55);
    c.shape(unwrap(ringsOf('Russia', false)), { fill: '#d7282f', alpha: 0.45, border: '#ff9a9a', at: 0.2 });
    const IN = moved('India', { lon: 100, lat: 62 });
    const grow = (tt) => 1 + 1.28 * sm((tt - (t('#area') + 1.0) ) / 3.6) * (1 - sm((tt - (end - 2.2)) / 1.4));   // 1 to 2.28 times as wide and tall = 5 times the area
    c.shape(IN, { fill: '#f2a516', alpha: 0.78, border: '#ffe3a3', edge: 3, scale: grow, at: 0.3 });
    c.ground('RUSSIA', { lon: 118, lat: 68, deg: 4.2, color: '#ffd0cc', at: 0.5 });
    c.ground('INDIA', { lon: 100, lat: 62, deg: 2.6, color: '#2b1a00', at: 0.7, out: t('#area') + 1.0 });

    c.zoomBlur(); c.tilt();
    c.chip('Russia: 17 million km²', { lon: 130, lat: 66, at: t('#area') + 0.2, out: end - 1.5, size: 36, dy: -50 });
    c.chip('India: 3.3 million km²', { lon: 100, lat: 62, at: t('#area') + 0.9, out: end - 1.5, size: 36, dy: -80 });
    c.number(430, 80, { at: t('#density'), out: t('#end') - 0.2, delay: 0.4, dur: 3.2, suffix: '', label: 'people per km²', y: 0.64, size: 130 });
    k.emoji('🧑‍🤝‍🧑', { lon: 60, lat: 58, size: 150, at: t('#end') + 0.3, out: end - 1.2 });

    k.grade(); k.ambient(); k.vignette();
    k.hook("What if India was *Russia's size*?", { at: 0.1, out: 2.4 });
    k.hook('Still *crowded*?', { at: t('#end') + 0.2, out: end, y: 0.17 });
    k.progress();
    k.whatIfCaptions({ size: 64, maxChars: 12 });
  },
};

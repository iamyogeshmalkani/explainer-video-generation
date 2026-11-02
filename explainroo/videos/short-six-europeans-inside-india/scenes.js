// What if six big European countries fit inside India? India's outline; France, Germany, Spain, Italy, the UK and Poland drop in one by one
// at their true size and snap into place. The last frame matches the first (the countries fade out) so the Short loops. Schematic.
import { setParallel, basemap, kit } from './lib/kit.js';
import { cinema, cine } from './lib/cine.js';
import { moved } from './lib/series.js';

setParallel(22);
const sm = (q) => { q = Math.min(1, Math.max(0, q)); return q * q * (3 - 2 * q); };
const COUNTRIES = [
  ['France', '#six', 76.3, 28.5, 0, '#3b6fff'], ['Germany', '#ger', 84.6, 28.0, 0, '#ffd84a'], ['Spain', '#spa', 73.9, 20.8, 0, '#ff5d5d'],
  ['Italy', '#ita', 86.6, 21.8, -35, '#3ddc6a'], ['United Kingdom', '#uk', 78.6, 13.4, 0, '#c77dff'], ['Poland', '#pol', 80.6, 24.3, 0, '#ff9f43'],
];

export default {
  story(s) {
    const t = (m) => s.time(m);
    const MARKS = ['#six', '#ger', '#spa', '#ita', '#uk', '#pol', '#left', '#end'].map(t);
    const end = s.dur;
    const cam = cinema(s, [
      { lon: 82.5, lat: 22, span: 44, tilt: 0.22 },
      { at: t('#left') - 0.3, dur: 1.8, lon: 82.5, lat: 22, span: 41, tilt: 0.26 },
      { at: t('#end') - 0.3, dur: 1.6, lon: 82.5, lat: 22, span: 44, tilt: 0.22 },
    ], { beats: MARKS });
    const k = kit(s, cam); const c = cine(s, cam);

    basemap(s); c.dim(0.55);
    k.fill('India', { color: '#12395e', alpha: 0.55, border: '#7fc0ff', at: 0.2 });
    c.ground('INDIA', { lon: 80.5, lat: 8.5, deg: 1.6, color: '#cfe3ff', at: 0.4 });
    COUNTRIES.forEach(([name, m, lon, lat, rot, col]) => {
      const drop = (tt) => { const q = Math.min(1, Math.max(0, tt / 0.5)); const e = 1 - (1 - q) ** 3; return [0, 9 * (1 - e) + (q > 0.7 && q < 1 ? Math.sin((q - 0.7) * Math.PI / 0.3) * 0.5 : 0)]; };
      c.shape(moved(name, { lon, lat, rotate: rot, mainland: true }), { at: t(m), fill: col, alpha: (tt) => 0.72 * (1 - sm((tt - (end - t(m) - 1.2)) / 1.0)), border: '#ffffff', edge: 3, offset: drop, fadeIn: 0.2 });
      s.sfx('thud', t(m) + 0.45, { gain: 0.3 });
      c.ground(name === 'United Kingdom' ? 'UK' : name.toUpperCase(), { lon, lat, deg: 0.7, color: '#ffffff', rotate: rot * 0.5, at: t(m) + 0.5, out: end - 1.2 });
    });

    c.zoomBlur(); c.tilt();
    k.stat('2.3M km²', { at: t('#pol') + 0.9, out: t('#left') - 0.2, label: 'six countries', y: 0.66, size: 110 });
    k.stat('1M km² free', { at: t('#left') + 0.2, out: t('#end') - 0.3, label: 'about the area of Egypt', y: 0.66, size: 110, color: '#7CFF6B' });
    k.emoji('👥', { lon: 80.5, lat: 17.0, size: 170, at: t('#end') + 0.4, out: end - 1.2 });

    k.grade(); k.ambient(); k.vignette();
    k.hook('What if *six European giants* fit inside India?', { at: 0.1, out: 3.6 });
    k.hook('Which *surprised* you?', { at: t('#end') + 0.2, out: end, y: 0.17 });
    k.progress();
    k.whatIfCaptions({ size: 64, maxChars: 12 });
  },
};

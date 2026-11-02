// What if India stopped the Indus? The Indus system on a dark schematic map: western rivers (Indus, Jhelum, Chenab) in blue, eastern rivers
// (Ravi, Beas, Sutlej) in green. No country borders are drawn. River lines are stylised (data/southasia.js).
import { setParallel, basemap, kit } from './lib/kit.js';
import { cinema, cine } from './lib/cine.js';
import { INDUS, JHELUM, CHENAB, RAVI, BEAS, SUTLEJ, PUNJAB_PLAINS } from './data/southasia.js';

setParallel(32);
const BLUE = '#2f7dff'; const GREEN = '#2fe06a';

export default {
  story(s) {
    const t = (m) => s.time(m);
    const MARKS = ['#treaty', '#west', '#abeyance', '#farms', '#hit', '#reality', '#delay', '#years', '#law', '#end'].map(t);
    const end = s.dur;
    const cam = cinema(s, [
      { lon: 73.5, lat: 31, span: 14, tilt: 0.32 },
      { at: t('#treaty') - 0.3, dur: 2.0, lon: 76.0, lat: 32.0, span: 7, tilt: 0.38 },
      { at: t('#west') - 0.3, dur: 2.2, lon: 72.6, lat: 32.6, span: 8, tilt: 0.38 },
      { at: t('#abeyance') - 0.3, dur: 2.0, lon: 74.9, lat: 33.5, span: 4.6, tilt: 0.42 },
      { at: t('#farms') - 0.3, dur: 2.4, lon: 71.0, lat: 30.6, span: 8, tilt: 0.36 },
      { at: t('#hit') - 0.3, dur: 2.0, lon: 70.5, lat: 29.8, span: 11, tilt: 0.32 },
      { at: t('#reality') - 0.3, dur: 2.2, lon: 74.6, lat: 33.3, span: 5, tilt: 0.42 },
      { at: t('#years') - 0.2, dur: 2.0, lon: 74.0, lat: 33.0, span: 7, tilt: 0.36 },
      { at: t('#end') - 0.2, dur: 2.2, lon: 73.5, lat: 31, span: 14, tilt: 0.32 },
    ], { beats: MARKS });
    const k = kit(s, cam); const c = cine(s, cam);

    basemap(s); c.dim(0.58);
    k.fill('India', { color: '#12395e', alpha: 0.3, border: '#4aa8ff', at: 0.2 });
    // all six rivers draw in over the hook
    [[INDUS, BLUE, 0.4, 7], [JHELUM, BLUE, 0.9, 5], [CHENAB, BLUE, 1.2, 5], [RAVI, GREEN, 1.8, 5], [BEAS, GREEN, 2.1, 5], [SUTLEJ, GREEN, 2.4, 5]]
      .forEach(([pts, col, at, w]) => c.glowLine(pts, { at, dur: 2.2, color: col, width: w, core: col === BLUE ? '#9cc7ff' : '#b8f5c8', coreWidth: 0.6 }));
    c.ground('PAKISTAN', { lon: 69.6, lat: 29.7, deg: 0.55, color: '#e9eef5', at: 0.8, lod: [20, 2] });
    // 1960: India gets the eastern rivers
    c.ground('RAVI', { lon: 75.4, lat: 32.15, deg: 0.17, color: GREEN, at: t('#treaty'), out: t('#west') + 0.5 });
    c.ground('BEAS', { lon: 76.3, lat: 31.55, deg: 0.17, color: GREEN, at: t('#treaty') + 0.5, out: t('#west') + 0.5 });
    c.ground('SUTLEJ', { lon: 75.9, lat: 30.75, deg: 0.17, color: GREEN, at: t('#treaty') + 1.0, out: t('#west') + 0.5 });
    // Pakistan gets the western rivers
    c.ground('INDUS', { lon: 70.6, lat: 33.0, deg: 0.2, color: '#9fd0ff', at: t('#west') + 0.2, out: t('#farms') });
    c.ground('JHELUM', { lon: 72.3, lat: 34.4, deg: 0.16, color: '#9fd0ff', at: t('#west') + 0.8, out: t('#farms') });
    c.ground('CHENAB', { lon: 72.6, lat: 32.3, deg: 0.16, color: '#9fd0ff', at: t('#west') + 1.4, out: t('#farms') });
    // the treaty in abeyance
    c.pulse({ lon: 75.33, lat: 34.02, r: 190, color: '255,70,60', at: t('#abeyance') + 0.9, dur: 1.2 });
    c.ground('IN ABEYANCE', { lon: 74.9, lat: 33.15, deg: 0.28, color: '#ff6b5e', rotate: -8, at: t('#abeyance') + 0.9, out: t('#farms') });
    k.emoji('⏸️', { lon: 74.0, lat: 34.5, size: 150, at: t('#abeyance') + 0.4, out: t('#farms') });
    // the plains that live on the water
    k.region(PUNJAB_PLAINS, { at: t('#farms'), out: t('#reality'), color: '#2fbf8f', alpha: 0.3 });
    c.ground('MOST IRRIGATED', { lon: 70.6, lat: 30.6, deg: 0.3, color: '#bff5dc', at: t('#farms') + 0.3, out: t('#hit') });
    c.ground('FARMLAND', { lon: 70.6, lat: 30.0, deg: 0.3, color: '#bff5dc', at: t('#farms') + 0.7, out: t('#hit') });
    k.emoji('🌾', { lon: 72.2, lat: 31.8, size: 140, at: t('#hit') - 0.1, out: t('#reality') });
    k.emoji('⚡', { lon: 73.65, lat: 33.15, size: 140, at: t('#hit') + 0.7, out: t('#reality') });
    k.emoji('🏙️', { lon: 74.3, lat: 31.55, size: 140, at: t('#hit') + 1.3, out: t('#reality') });
    // limited storage, slow rivers
    c.dam({ lon: 74.8, lat: 33.15, size: 130, at: t('#reality') + 0.4, out: t('#years') });
    c.dam({ lon: 74.75, lat: 34.5, size: 130, at: t('#reality') + 1.0, out: t('#years') });
    k.flow(CHENAB.slice(2, 6), { at: t('#delay') + 0.2, grow: 1.6, color: '#7cc4ff', width: 7, out: t('#years') });
    c.ground('DELAY, NOT STOP', { lon: 74.0, lat: 32.2, deg: 0.22, color: '#ffd84a', at: t('#delay') + 0.4, out: t('#years') });
    k.emoji('🏗️', { lon: 75.6, lat: 33.7, size: 150, at: t('#years') + 0.1, out: t('#end') });
    c.ground('YEARS', { lon: 74.0, lat: 32.4, deg: 0.4, color: '#ffd84a', at: t('#years') + 0.3, out: t('#law') });
    k.emoji('⚖️', { lon: 74.3, lat: 34.9, size: 160, at: t('#law') + 0.1, out: t('#end') });

    c.zoomBlur(); c.tilt();
    c.chip('Pahalgam', { lon: 75.33, lat: 34.02, at: t('#abeyance') + 0.6, out: t('#farms'), size: 36 });
    c.chip('India: 3 eastern', { lon: 75.9, lat: 31.4, at: t('#treaty') + 1.6, out: t('#west') + 0.4, size: 36, dy: -40 });
    c.chip('Pakistan: 3 western', { lon: 71.8, lat: 32.4, at: t('#west') + 1.9, out: t('#abeyance'), size: 36 });
    c.chip('Limited storage', { lon: 74.8, lat: 33.15, at: t('#reality') + 1.2, out: t('#delay') + 1, size: 36, dy: -60 });
    c.chip('International law', { lon: 74.3, lat: 34.9, at: t('#law') + 0.6, out: t('#end'), size: 36, dy: -80 });

    k.grade(); k.ambient(); k.vignette();
    k.credit('Schematic map', { y: 0.955 });
    k.hook('What if India *closed the tap?*', { at: 0.2, out: 4.4 });
    k.twist(t('#reality'));
    k.hook('Weapon *or* lifeline?', { at: t('#end') + 0.2, out: end, y: 0.17 });
    k.progress();
    k.whatIfCaptions({ size: 64, maxChars: 12 });
  },
};

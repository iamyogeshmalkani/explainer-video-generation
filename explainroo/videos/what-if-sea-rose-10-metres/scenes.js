// What if the sea rose 10 metres? A coast band that widens in steps, then Sundarbans, Kolkata, Mumbai and Chennai. Schematic: the blue is not a flood model.
import { setParallel, basemap, kit } from './lib/kit.js';
import { cinema, cine } from './lib/cine.js';
import { CITIES, SUNDARBANS } from './data/southasia.js';

setParallel(18);
const COAST = [[68.5, 23.5], [69.5, 22.8], [70.2, 21.0], [72.1, 20.9], [72.6, 21.7], [72.7, 20.5], [72.8, 19.0], [73.0, 17.5], [73.5, 16.0], [74.0, 14.8], [74.7, 13.0], [75.5, 11.8], [76.2, 9.9], [77.0, 8.2], [78.2, 8.9], [79.1, 9.9], [79.8, 11.0], [80.3, 13.1], [80.1, 15.0], [80.2, 16.5], [81.5, 16.3], [82.3, 16.7], [83.3, 17.7], [84.8, 19.3], [86.8, 20.8], [87.0, 21.6], [88.0, 21.7], [88.8, 21.7]];

export default {
  story(s) {
    const t = (m) => s.time(m);
    const MARKS = ['#sundarbans', '#kolkata', '#mumbai', '#exposed', '#extreme', '#today', '#end'].map(t);
    const end = s.dur;
    const cam = cinema(s, [
      { lon: 79.5, lat: 16.5, span: 30, tilt: 0.28 },
      { at: t('#sundarbans') - 0.3, dur: 2.2, lon: 89.0, lat: 22.2, span: 4.2, tilt: 0.4, ease: 'dive' },
      { at: t('#kolkata') - 0.3, dur: 2.0, lon: 88.4, lat: 22.5, span: 2.4, tilt: 0.42 },
      { at: t('#mumbai') - 0.4, dur: 2.6, lon: 72.9, lat: 19.0, span: 1.7, tilt: 0.42, ease: 'dive' },
      { at: t('#extreme') - 0.3, dur: 2.2, lon: 79.5, lat: 16.5, span: 30, tilt: 0.28 },
      { at: t('#today') - 0.3, dur: 2.2, lon: 85.5, lat: 17.5, span: 14, tilt: 0.34 },
      { at: t('#end') - 0.2, dur: 2.0, lon: 79.5, lat: 16.5, span: 30, tilt: 0.28 },
    ], { beats: MARKS });
    const k = kit(s, cam); const c = cine(s, cam);

    basemap(s); c.dim(0.5);
    k.fill('India', { color: '#1b3a5c', alpha: 0.25, border: '#4aa8ff', at: 0.2 });
    // the sea comes up in steps: 2 m, 5 m, 10 m
    const steps = [[0.8, 0.14, '#6fc3ff'], [2.0, 0.3, '#3d9bff'], [3.2, 0.55, '#1f6fe0']];
    steps.forEach(([at, deg, col], i) => c.band(COAST, { at, dur: 0.01, deg: (tt) => deg * Math.min(1, tt / 0.8) * (i < 2 && s.t > t('#sundarbans') ? 1 : 1), lod: [14, 6], alpha: 0.5, color: col.slice(1).match(/../g).map((h) => parseInt(h, 16)).join(','), core: '200,235,255', out: i < 2 ? undefined : undefined }));
    c.ground('+10 M', { lon: 71.2, lat: 14.8, deg: 1.5, color: '#9fd0ff', at: 3.3, out: t('#sundarbans'), lod: [30, 8] });
    // Sundarbans
    k.region(SUNDARBANS, { at: t('#sundarbans') + 0.5, color: '#2f8bff', alpha: 0.65 });
    c.ground('BARELY ABOVE SEA LEVEL', { lon: 89.2, lat: 21.3, deg: 0.12, color: '#bfe3ff', at: t('#sundarbans') + 1.2, out: t('#kolkata') });
    k.pin({ lon: CITIES.Sundarbans[0], lat: CITIES.Sundarbans[1], at: t('#sundarbans') + 0.8, out: t('#kolkata'), color: '#ff3b30' });
    // Kolkata
    k.disc(CITIES.Kolkata[0], CITIES.Kolkata[1], { at: t('#kolkata') + 0.4, r0: 0.01, r1: 0.22, dur: 2.2, color: '#2f8bff', alpha: 0.6, out: t('#mumbai') });
    k.pin({ lon: CITIES.Kolkata[0], lat: CITIES.Kolkata[1], at: t('#kolkata') + 0.3, out: t('#mumbai'), color: '#ff3b30' });
    c.ground('A FEW METRES ABOVE SEA', { lon: 88.35, lat: 22.05, deg: 0.065, color: '#bfe3ff', at: t('#kolkata') + 1.4, out: t('#mumbai') });
    // Mumbai
    k.disc(72.82, 18.95, { at: t('#mumbai') + 0.6, r0: 0.005, r1: 0.075, dur: 2.0, color: '#2f8bff', alpha: 0.65, out: t('#extreme') });
    k.pin({ lon: CITIES.Mumbai[0], lat: CITIES.Mumbai[1], at: t('#mumbai') + 0.3, out: t('#extreme'), color: '#ff3b30' });
    c.ground('RECLAIMED LAND', { lon: 72.85, lat: 18.82, deg: 0.035, color: '#ffe3a3', at: t('#mumbai') + 1.2, out: t('#extreme') });
    // cities on the whole coast, then cyclones
    Object.entries(CITIES).forEach(([name, [lon, lat]], i) => k.pin({ lon, lat, at: t('#extreme') + 0.4 + 0.25 * i, out: end, color: '#ff3b30' }));
    k.emoji('🌀', { lon: 86.0, lat: 17.0, size: 200, at: t('#today') + 0.2, out: t('#end') });
    k.emoji('🌀', { lon: 69.0, lat: 17.0, size: 150, at: t('#today') + 0.9, out: t('#end') });

    c.zoomBlur(); c.tilt();
    c.chip('Sundarbans', { lon: CITIES.Sundarbans[0], lat: CITIES.Sundarbans[1], at: t('#sundarbans') + 1.0, out: t('#kolkata'), size: 38, dy: -120 });
    c.chip('Kolkata', { lon: CITIES.Kolkata[0], lat: CITIES.Kolkata[1], at: t('#kolkata') + 0.6, out: t('#mumbai'), size: 40, dy: -120 });
    c.chip('Mumbai', { lon: CITIES.Mumbai[0], lat: CITIES.Mumbai[1], at: t('#mumbai') + 0.6, out: t('#extreme'), size: 40, dy: -120 });
    [['Mumbai', CITIES.Mumbai], ['Kolkata', CITIES.Kolkata], ['Chennai', CITIES.Chennai]].forEach(([n, [lon, lat]], i) => c.chip(n, { lon, lat, at: t('#extreme') + 0.6 + 0.3 * i, out: t('#today'), size: 34, dy: -110 }));
    c.chip('Cyclone floods', { lon: 86.0, lat: 17.0, at: t('#today') + 0.8, out: t('#end'), size: 38, dy: -80 });

    k.grade(); k.ambient(); k.vignette();
    k.credit('Schematic map', { y: 0.955 });
    k.hook('What if the sea *rose 10 metres*?', { at: 0.2, out: 3.6 });
    k.twist(t('#extreme'));
    k.hook('Mumbai *or* Kolkata?', { at: t('#end') + 0.2, out: end, y: 0.17 });
    k.progress();
    k.whatIfCaptions({ size: 64, maxChars: 12 });
  },
};

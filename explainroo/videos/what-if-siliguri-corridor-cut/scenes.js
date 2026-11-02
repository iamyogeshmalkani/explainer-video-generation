// What if the Siliguri Corridor was cut? North-east India with the neck in red and the rest of the north-east shaded. The neck line is stylised.
import { setParallel, basemap, kit } from './lib/kit.js';
import { cinema, cine, routePoint } from './lib/cine.js';
import { NECK, NORTHEAST, NECK_ROAD, NECK_RAIL, NECK_PIPE } from './data/southasia.js';

setParallel(26);
const RED = '#ff3b30';

export default {
  story(s) {
    const t = (m) => s.time(m);
    const MARKS = ['#neck', '#sides', '#china', '#lines', '#blocked', '#built', '#routes', '#watched', '#end'].map(t);
    const end = s.dur;
    const cam = cinema(s, [
      { lon: 91.5, lat: 26.2, span: 15, tilt: 0.3 },
      { at: t('#neck') - 0.3, dur: 2.3, lon: 88.5, lat: 26.62, span: 2.3, tilt: 0.42, ease: 'dive' },
      { at: t('#sides') - 0.3, dur: 1.9, lon: 88.7, lat: 26.7, span: 3.9, tilt: 0.4 },
      { at: t('#lines') - 0.3, dur: 2.0, lon: 89.3, lat: 26.5, span: 3.4, tilt: 0.4 },
      { at: t('#blocked') - 0.3, dur: 2.2, lon: 90.2, lat: 25.9, span: 6.2, tilt: 0.34 },
      { at: t('#built') - 0.3, dur: 2.0, lon: 88.8, lat: 26.5, span: 3.0, tilt: 0.42 },
      { at: t('#routes') - 0.3, dur: 2.0, lon: 90.2, lat: 26.2, span: 7, tilt: 0.32 },
      { at: t('#watched') - 0.3, dur: 2.4, lon: 91.5, lat: 26.2, span: 15, tilt: 0.3 },
    ], { beats: MARKS });
    const k = kit(s, cam); const c = cine(s, cam);

    basemap(s); c.dim(0.58);
    k.fill('India', { color: '#2a4568', alpha: 0.55, border: '#4aa8ff', at: 0.2 });                       // the rest of India
    k.fill(NORTHEAST, { color: '#19b6a6', alpha: 0.4, border: '#7ff3e4', at: 0.5, mainland: false });   // the north-east, shaded
    c.band(NECK, { at: 0.8, dur: 0, deg: 0.22, alpha: 0.75, color: '255,59,48', core: '255,180,160' });  // the neck, about 20 km wide
    c.glowLine(NECK, { at: 0.8, dur: 1.0, color: RED, width: 8 });
    c.pulse({ lon: 88.45, lat: 26.6, r: 140, color: '255,59,48', at: 1.2, dur: 1.4 });
    c.ground('NORTH-EAST', { lon: 93.2, lat: 25.9, deg: 0.55, color: '#bff5ee', at: 1.0, lod: [14, 5] });
    c.ground('REST OF INDIA', { lon: 84.0, lat: 24.0, deg: 0.5, color: '#9fc4ee', at: 1.4, lod: [14, 6] });

    c.ground("CHICKEN'S NECK", { lon: 88.45, lat: 26.2, deg: 0.065, color: '#ffb3ac', at: t('#neck') + 1.4, out: t('#lines') });
    // the neighbours on its sides
    c.ground('NEPAL', { lon: 87.75, lat: 26.95, deg: 0.12, color: '#e9eef5', at: t('#sides'), out: t('#blocked') });
    c.ground('BHUTAN', { lon: 89.3, lat: 27.35, deg: 0.12, color: '#e9eef5', at: t('#sides') + 0.6, out: t('#blocked') });
    c.ground('BANGLADESH', { lon: 88.7, lat: 25.7, deg: 0.12, color: '#e9eef5', at: t('#sides') + 1.2, out: t('#blocked') });
    c.ground('CHINA', { lon: 88.9, lat: 28.1, deg: 0.16, color: '#ffd84a', at: t('#china') - 0.1, out: t('#blocked') });
    // everything that passes through
    c.glowLine(NECK_RAIL, { at: t('#lines'), dur: 1.0, color: '#ffb02e', width: 5, out: t('#blocked') + 0.3 });
    c.glowLine(NECK_ROAD, { at: t('#lines') + 0.7, dur: 1.0, color: '#ffffff', width: 5, out: t('#blocked') + 0.3 });
    c.glowLine(NECK_PIPE, { at: t('#lines') + 1.4, dur: 1.0, color: '#ff7a2a', width: 5, out: t('#blocked') + 0.3 });
    c.sprite('🚆', { size: 110, at: t('#lines') + 0.3, out: t('#blocked'), pos: (tt) => routePoint(NECK_RAIL, (tt * 0.28) % 1) });
    c.sprite('🚛', { size: 110, at: t('#lines') + 0.9, out: t('#blocked'), pos: (tt) => routePoint(NECK_ROAD, (tt * 0.3) % 1) });
    k.emoji('⚡', { lon: 88.0, lat: 26.9, size: 120, at: t('#lines') + 2.2, out: t('#blocked') });
    // cut
    k.emoji('❌', { lon: 88.45, lat: 26.6, size: 200, at: t('#blocked') + 0.2, out: t('#built') });
    c.glowLine([[88.2, 26.1], [88.9, 25.0], [90.4, 24.9], [91.9, 24.6], [92.5, 25.8]], { at: t('#blocked') + 0.8, dur: 1.8, color: '#ffb02e', width: 5, out: t('#built') });
    c.ground('MUCH LONGER ROUTE', { lon: 90.6, lat: 24.4, deg: 0.2, color: '#ffd84a', at: t('#blocked') + 1.6, out: t('#built') });
    // India builds up
    k.emoji('🛣️', { lon: 88.0, lat: 26.9, size: 130, at: t('#built') + 0.2, out: t('#routes') });
    k.emoji('🚆', { lon: 89.0, lat: 26.9, size: 130, at: t('#built') + 0.8, out: t('#routes') });
    k.emoji('🪖', { lon: 88.45, lat: 26.2, size: 130, at: t('#built') + 1.4, out: t('#routes') });
    c.glowLine([[88.4, 26.4], [89.6, 25.4], [91.0, 25.5], [92.4, 26.2]], { at: t('#routes') + 0.2, dur: 1.4, color: '#3ddc6a', width: 5, out: t('#end') });
    c.ground('OTHER ROUTES', { lon: 90.6, lat: 25.0, deg: 0.2, color: '#a8f5be', at: t('#routes') + 0.8, out: t('#end') });
    k.emoji('👀', { lon: 88.45, lat: 26.6, size: 220, at: t('#watched') + 0.2, out: t('#end') });

    c.zoomBlur(); c.tilt();
    c.chip('about 20 km wide', { lon: 88.45, lat: 26.6, at: t('#neck') + 0.9, out: t('#sides'), size: 38, dy: -30 });
    c.chip('Siliguri Corridor', { lon: 88.45, lat: 26.6, at: 0.9, out: 3.9, size: 36, dy: -20 });
    c.chip('Roads', { lon: 88.0, lat: 26.9, at: t('#built') + 0.5, out: t('#routes'), size: 34, dy: -70 });
    c.chip('Rail', { lon: 89.0, lat: 26.9, at: t('#built') + 1.1, out: t('#routes'), size: 34, dy: -70 });
    c.chip('Forces', { lon: 88.45, lat: 26.2, at: t('#built') + 1.7, out: t('#routes'), size: 34, dy: -70 });

    k.grade(); k.ambient(); k.vignette();
    k.credit('Schematic map', { y: 0.955 });
    k.hook('What if the *neck* was cut?', { at: 0.2, out: 4.0 });
    k.twist(t('#blocked'));
    k.hook('A second *route*?', { at: t('#end') + 0.2, out: end, y: 0.17 });
    k.progress();
    k.whatIfCaptions({ size: 64, maxChars: 12 });
  },
};

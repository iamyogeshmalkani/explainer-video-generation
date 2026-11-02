// What if the Red Sea route closed for good? Mumbai to Rotterdam two ways: through the Red Sea and Suez (blue) and round the Cape of Good Hope
// (amber), the Houthi threat at Bab el-Mandeb, the extra ten days, India's costs, and the Indian Navy. Stylised routes; schematic map.
import { setParallel, basemap, kit } from './lib/kit.js';
import { cinema, cine, routePoint } from './lib/cine.js';
import { SUEZ_ROUTE, CAPE_ROUTE } from './data/chokepoints.js';

setParallel(20);
const BLUE = '#3da5ff'; const AMBER = '#ffb02e'; const RED = '#ff3b30';

export default {
  story(s) {
    const t = (m) => s.time(m);
    const MARKS = ['#route', '#houthi', '#cape', '#india', '#navy', '#end'].map(t);
    const end = s.dur;
    const f1 = { at: t('#route') - 0.3, dur: t('#houthi') - t('#route') - 0.4 };
    const f3 = { at: t('#cape') - 0.3, dur: t('#india') - t('#cape') - 0.3 };
    const cam = cinema(s, [
      { lon: 56, lat: 18, span: 56, tilt: 0.28 },
      { ...f1, follow: SUEZ_ROUTE.slice(1, 13), span: 20, zoomBy: 0.4, tilt: 0.34 },
      { at: t('#houthi') - 0.3, dur: 2.2, lon: 43.5, lat: 14.5, span: 8, tilt: 0.42 },
      { ...f3, follow: CAPE_ROUTE.slice(1, 9), span: 40, zoomBy: 0.3, tilt: 0.3 },
      { at: t('#india') - 0.3, dur: 2.4, lon: 66, lat: 15, span: 34, tilt: 0.32 },
      { at: t('#navy') - 0.3, dur: 2.0, lon: 63, lat: 16, span: 22, tilt: 0.36 },
      { at: t('#end') - 0.2, dur: 2.0, lon: 56, lat: 18, span: 56, tilt: 0.28 },
    ], { beats: MARKS });
    const k = kit(s, cam); const c = cine(s, cam);

    basemap(s); c.dim(0.55);
    k.fill('India', { color: '#12395e', alpha: 0.3, border: '#4aa8ff', at: 0.2 });
    c.glowLine(SUEZ_ROUTE.slice(0, 13), { ...f1, ease: 'inOut', color: BLUE, width: 6, core: '#bcd9ff' });
    c.glowLine(SUEZ_ROUTE.slice(0, 5), { at: 0.5, dur: 2.5, color: BLUE, width: 6, core: '#bcd9ff' });
    c.sprite('🚢', { size: 110, at: 1.2, out: t('#houthi') + 1.5, pos: (tt) => routePoint(SUEZ_ROUTE.slice(0, 13), (tt * 0.08) % 1) });
    c.ground('RED SEA', { lon: 38.2, lat: 20.5, deg: 0.9, color: '#9fd0ff', at: t('#route') + 0.5, out: t('#houthi') + 2, lod: [60, 8] });
    c.ground('SUEZ CANAL', { lon: 31.0, lat: 28.8, deg: 0.45, color: '#ffd84a', at: t('#route') + 2.8, out: t('#houthi') + 1, lod: [60, 8] });
    // Houthi attacks at Bab el-Mandeb
    c.pulse({ lon: 43.4, lat: 12.6, r: 220, color: '255,59,48', at: t('#houthi') + 1.0, dur: 1.3 });
    k.emoji('❌', { lon: 43.4, lat: 12.7, size: 200, at: t('#houthi') + 1.2, out: t('#cape') });
    c.ground('BAB EL-MANDEB', { lon: 45.0, lat: 11.4, deg: 0.28, color: '#ff8a80', at: t('#houthi') + 0.9, out: t('#cape') });
    c.ground('YEMEN', { lon: 46.2, lat: 15.8, deg: 0.4, color: '#e9eef5', at: t('#houthi') + 0.6, out: t('#cape') });
    // round the Cape of Good Hope
    c.glowLine(CAPE_ROUTE.slice(0, 9), { ...f3, ease: 'inOut', color: AMBER, width: 6, core: '#ffe3a3', out: t('#end') });
    c.sprite('🚢', { size: 110, at: t('#cape'), out: t('#india'), pos: (tt) => routePoint(CAPE_ROUTE.slice(0, 9), Math.min(1, tt / (t('#india') - t('#cape') - 0.4))) });
    c.ground('CAPE OF GOOD HOPE', { lon: 26.0, lat: -31.0, deg: 1.3, color: '#ffe3a3', at: t('#cape') + 2.0, out: t('#india'), lod: [100, 14] });
    // India pays
    [['📦', 74.5, 17.0, 0.3], ['💸', 70.0, 14.0, 0.9], ['⏱️', 66.0, 18.0, 1.5]].forEach(([e, lon, lat, d]) => k.emoji(e, { lon, lat, size: 150, at: t('#india') + d, out: t('#navy') }));
    // the Indian Navy guards the sea lane
    c.pulse({ lon: 64, lat: 15.5, r: 250, color: '61,165,255', at: t('#navy') + 0.8, dur: 1.4 });
    c.pulse({ lon: 64, lat: 15.5, r: 250, color: '61,165,255', at: t('#navy') + 1.8, dur: 1.4 });
    k.emoji('⚓', { lon: 64, lat: 15.5, size: 170, at: t('#navy') + 0.4, out: t('#end') });
    k.emoji('🚢', { lon: 61.5, lat: 14.0, size: 120, at: t('#navy') + 1.2, out: t('#end') });
    k.emoji('🚢', { lon: 66.5, lat: 17.0, size: 120, at: t('#navy') + 1.6, out: t('#end') });

    c.zoomBlur(); c.tilt();
    c.chip('Mumbai', { lon: 72.9, lat: 19.0, at: 1.0, out: t('#cape') + 4, size: 36, dy: -20 });
    c.chip('Rotterdam', { lon: 4.1, lat: 51.9, at: t('#cape') + 3.0, out: t('#india'), size: 34 });
    c.chip('Higher freight', { lon: 74.5, lat: 17.0, at: t('#india') + 0.6, out: t('#navy'), size: 34, dy: -90 });
    c.chip('Delays', { lon: 66.0, lat: 18.0, at: t('#india') + 1.8, out: t('#navy'), size: 34, dy: -90 });
    c.chip('Insurance', { lon: 70.0, lat: 14.0, at: t('#india') + 1.2, out: t('#navy'), size: 34, dy: -90 });
    c.chip('Indian Navy', { lon: 64, lat: 15.5, at: t('#navy') + 0.8, out: t('#end'), size: 38, dy: -100 });
    c.number(0, 10, { at: t('#cape') + 1.2, out: t('#india') - 0.2, delay: 0.3, dur: 2.2, prefix: '+', suffix: ' DAYS', label: 'round the Cape', y: 0.62, size: 130, color: '#ffb02e' });
    k.stat('12%', { at: 0.9, out: t('#route') - 0.2, label: 'of world trade', y: 0.62, size: 120 });

    k.grade(); k.ambient(); k.vignette();
    k.credit('Schematic map', { y: 0.955 });
    k.hook('What if the *Red Sea route* closed?', { at: 0.2, out: 4.8 });
    k.twist(t('#houthi'));
    k.hook('Guard the *sea lanes*?', { at: t('#end') + 0.2, out: end, y: 0.17 });
    k.progress();
    k.whatIfCaptions({ size: 64, maxChars: 12 });
  },
};

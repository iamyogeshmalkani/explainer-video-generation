// What if the Strait of Hormuz closed? A dark map of the Gulf and India's west coast: tankers on a glowing route, the strait at 33 km, India's crude
// imports and ten-day reserve, alternative routes and the pipelines that bypass the strait. Stylised routes (data/chokepoints.js); schematic map.
import { setParallel, basemap, kit } from './lib/kit.js';
import { cinema, cine, routePoint } from './lib/cine.js';
import { HORMUZ, HORMUZ_ROUTE, PIPE_EAST_WEST, PIPE_FUJAIRAH, WEST_AFRICA_ROUTE } from './data/chokepoints.js';

setParallel(26);
const AMBER = '#ffb02e'; const RED = '#ff3b30';

export default {
  story(s) {
    const t = (m) => s.time(m);
    const MARKS = ['#strait', '#oil', '#india', '#price', '#reserve', '#routes', '#pipes', '#end'].map(t);
    const end = s.dur;
    const fi = { at: t('#india') - 0.3, dur: t('#price') - t('#india') - 0.3 };
    const cam = cinema(s, [
      { lon: 58, lat: 25.5, span: 14, tilt: 0.3 },
      { at: t('#strait') - 0.3, dur: 2.2, lon: HORMUZ[0], lat: HORMUZ[1], span: 2.0, tilt: 0.42, ease: 'dive' },
      { at: t('#oil') - 0.3, dur: 1.9, lon: 57.5, lat: 25.5, span: 6, tilt: 0.36 },
      { ...fi, follow: HORMUZ_ROUTE.slice(4), span: 9, zoomBy: 0.4, tilt: 0.34 },
      { at: t('#price') - 0.3, dur: 1.9, lon: HORMUZ[0], lat: HORMUZ[1], span: 3, tilt: 0.4 },
      { at: t('#reserve') - 0.3, dur: 2.0, lon: 72.5, lat: 17, span: 14, tilt: 0.34 },
      { at: t('#routes') - 0.3, dur: 2.4, lon: 32, lat: -6, span: 70, tilt: 0.28 },
      { at: t('#pipes') - 0.3, dur: 2.2, lon: 48, lat: 25, span: 16, tilt: 0.34 },
      { at: t('#end') - 0.2, dur: 2.2, lon: 58, lat: 25.5, span: 14, tilt: 0.3 },
    ], { beats: MARKS });
    const k = kit(s, cam); const c = cine(s, cam);

    basemap(s); c.dim(0.55);
    k.fill('India', { color: '#12395e', alpha: 0.3, border: '#4aa8ff', at: 0.2 });
    c.glowLine(HORMUZ_ROUTE, { at: 0.5, dur: 2.6, color: AMBER, width: 6, core: '#ffe3a3' });
    c.sprite('🚢', { size: 110, at: 1.0, out: t('#price') - 0.2, pos: (tt) => routePoint(HORMUZ_ROUTE, (tt * 0.12) % 1) });
    c.ground('IRAN', { lon: 55.0, lat: 28.2, deg: 0.35, color: '#e9eef5', at: 0.6, lod: [16, 0.5] });
    c.ground('OMAN', { lon: 58.2, lat: 23.0, deg: 0.35, color: '#e9eef5', at: 0.8, lod: [16, 0.5] });
    c.ground('ARABIAN GULF', { lon: 52.0, lat: 26.0, deg: 0.3, color: '#9fd0ff', at: 1.0, out: t('#strait'), lod: [16, 4] });
    // the strait: 33 km
    c.glowLine([[56.55, 26.4], [56.55, 26.7]], { at: t('#strait') + 1.4, dur: 0.6, color: '#ffffff', width: 6 });
    c.ground('33 KM', { lon: 56.95, lat: 26.55, deg: 0.1, color: '#ffffff', at: t('#strait') + 1.8, out: t('#oil') });
    c.pulse({ lon: HORMUZ[0], lat: HORMUZ[1], r: 200, color: '255,176,46', at: t('#strait') + 2.0, dur: 1.2 });
    k.emoji('🛢️', { lon: 57.2, lat: 25.7, size: 150, at: t('#oil') + 0.3, out: t('#india') });
    k.emoji('🔥', { lon: 55.8, lat: 25.7, size: 130, at: t('#oil') + 1.0, out: t('#india') });
    c.ground('A FIFTH OF WORLD OIL', { lon: 58.2, lat: 27.3, deg: 0.22, color: '#ffd37a', at: t('#oil') + 0.5, out: t('#india') });
    // to India
    c.glowLine(HORMUZ_ROUTE.slice(4), { ...fi, ease: 'inOut', color: AMBER, width: 6, core: '#ffe3a3' });
    c.ground('INDIA', { lon: 71.4, lat: 24.3, deg: 0.55, color: '#cfe3ff', at: t('#india') + 0.8, out: t('#reserve') });
    // closed: prices jump
    k.emoji('❌', { lon: HORMUZ[0], lat: HORMUZ[1], size: 220, at: t('#price') + 0.2, out: t('#routes') });
    c.ground('PRICES JUMP', { lon: 57.6, lat: 27.4, deg: 0.14, color: '#ff8a80', at: t('#price') + 0.6, out: t('#reserve') });
    k.emoji('📈', { lon: 57.6, lat: 25.8, size: 150, at: t('#price') + 1.0, out: t('#reserve') });
    // ten days of reserve
    k.emoji('🛢️', { lon: 74.8, lat: 13.0, size: 130, at: t('#reserve') + 0.4, out: t('#routes') });
    k.emoji('🛢️', { lon: 83.3, lat: 17.7, size: 130, at: t('#reserve') + 0.8, out: t('#routes') });
    // other suppliers, longer and dearer
    c.glowLine(WEST_AFRICA_ROUTE, { at: t('#routes') + 0.4, dur: 3.2, color: '#7cc4ff', width: 6, out: t('#pipes') });
    c.ground('LONGER, COSTLIER', { lon: 44, lat: -20, deg: 1.3, color: '#bfe3ff', at: t('#routes') + 1.8, out: t('#pipes'), lod: [100, 14] });
    // pipelines that bypass the strait
    c.glowLine(PIPE_EAST_WEST, { at: t('#pipes') + 0.2, dur: 1.4, color: '#3ddc6a', width: 6, out: t('#end') });
    c.glowLine(PIPE_FUJAIRAH, { at: t('#pipes') + 1.0, dur: 1.0, color: '#3ddc6a', width: 6, out: t('#end') });
    c.ground('EAST-WEST PIPELINE', { lon: 44.0, lat: 26.0, deg: 0.28, color: '#a8f5be', at: t('#pipes') + 0.8, out: t('#end') });

    c.zoomBlur(); c.tilt();
    c.chip('Strait of Hormuz', { lon: HORMUZ[0], lat: HORMUZ[1], at: t('#strait') + 1.0, out: t('#india'), size: 38 });
    c.chip('Jamnagar', { lon: 69.9, lat: 22.4, at: t('#india') + 2.4, out: t('#price'), size: 36 });
    c.chip('Emergency reserves', { lon: 74.8, lat: 13.0, at: t('#reserve') + 0.9, out: t('#routes'), size: 34, dy: -70 });
    c.chip('West Africa', { lon: 3.0, lat: 4.0, at: t('#routes') + 1.0, out: t('#pipes'), size: 36 });
    c.chip('Not enough', { lon: 53.6, lat: 23.8, at: t('#pipes') + 1.8, out: t('#end'), size: 36, dy: -50 });
    c.number(0, 85, { at: t('#india') + 1.0, out: t('#price') - 0.2, delay: 0.3, dur: 2.0, suffix: '%', label: "of India's crude is imported", y: 0.62, size: 120 });
    c.number(0, 10, { at: t('#reserve') + 0.4, out: t('#routes') - 0.2, delay: 0.3, dur: 2.0, suffix: ' DAYS', label: 'of emergency reserve', y: 0.62, size: 120, color: '#ff8a80' });

    k.grade(); k.ambient(); k.vignette();
    k.credit('Schematic map', { y: 0.955 });
    k.hook('What if the *Strait of Hormuz* closed?', { at: 0.2, out: 4.0 });
    k.twist(t('#price'));
    k.hook('Who *suffers* most?', { at: t('#end') + 0.2, out: end, y: 0.17 });
    k.progress();
    k.whatIfCaptions({ size: 64, maxChars: 12 });
  },
};

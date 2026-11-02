// What if the Strait of Malacca was blocked? The sea route from the Gulf to China, the strait at 2.7 km, India's Andaman and Nicobar Islands at its
// western mouth, the longer Sunda and Lombok detours, and China's pipelines from Myanmar and Pakistan. Stylised routes; schematic map.
import { setParallel, basemap, kit } from './lib/kit.js';
import { cinema, cine, routePoint } from './lib/cine.js';
import { MALACCA, MALACCA_ROUTE, SUNDA_ROUTE, LOMBOK_ROUTE, PIPE_MYANMAR, PIPE_GWADAR } from './data/chokepoints.js';

setParallel(8);
const AMBER = '#ffb02e'; const RED = '#ff3b30'; const CYAN = '#19e0c8';

export default {
  story(s) {
    const t = (m) => s.time(m);
    const MARKS = ['#malacca', '#trade', '#dilemma', '#nicobar', '#reality', '#pipes', '#end'].map(t);
    const end = s.dur;
    const toChina = [[106, 3.0], [109, 7], [112, 12], [115, 17], [118, 22.5], [121.5, 26], [122.3, 30.5]];
    const ft = { at: t('#trade') - 0.3, dur: t('#dilemma') - t('#trade') - 0.3 };
    const cam = cinema(s, [
      { lon: 100, lat: 3, span: 12, tilt: 0.3 },
      { at: t('#malacca') - 0.3, dur: 2.2, lon: 103.9, lat: 1.3, span: 1.3, tilt: 0.42, ease: 'dive' },
      { ...ft, follow: toChina, span: 14, zoomBy: 0.35, tilt: 0.34 },
      { at: t('#dilemma') - 0.3, dur: 2.2, lon: 90, lat: 8, span: 34, tilt: 0.3 },
      { at: t('#nicobar') - 0.3, dur: 2.2, lon: 94.2, lat: 8.8, span: 9, tilt: 0.4 },
      { at: t('#reality') - 0.3, dur: 2.4, lon: 106, lat: -1, span: 30, tilt: 0.3 },
      { at: t('#pipes') - 0.3, dur: 2.2, lon: 99, lat: 22, span: 18, tilt: 0.34 },
      { at: t('#pipes') + 2.6, dur: 2.0, lon: 69, lat: 31, span: 20, tilt: 0.34 },
      { at: t('#end') - 0.2, dur: 2.0, lon: 100, lat: 3, span: 12, tilt: 0.3 },
    ], { beats: MARKS });
    const k = kit(s, cam); const c = cine(s, cam);

    basemap(s); c.dim(0.55);
    k.fill('India', { color: '#12395e', alpha: 0.3, border: '#4aa8ff', at: 0.2 });
    k.fill('Andaman and Nicobar', { color: '#ffd84a', alpha: 0.6, border: '#fff0a8', at: 0.4, mainland: false });
    c.glowLine(MALACCA_ROUTE, { at: 0.5, dur: 3.0, color: AMBER, width: 6, core: '#ffe3a3' });
    c.sprite('🚢', { size: 110, at: 1.0, out: t('#reality'), pos: (tt) => routePoint(MALACCA_ROUTE, (tt * 0.06) % 1) });
    c.ground('SUMATRA', { lon: 99.0, lat: 1.0, deg: 0.3, color: '#e9eef5', at: 0.6, lod: [14, 0.8] });
    c.ground('MALAYSIA', { lon: 102.4, lat: 4.6, deg: 0.28, color: '#e9eef5', at: 0.8, lod: [14, 0.8] });
    // the strait: 2.7 km
    c.glowLine([[103.52, 1.16], [103.55, 1.16]], { at: t('#malacca') + 1.4, dur: 0.5, color: '#ffffff', width: 6 });
    c.ground('2.7 KM', { lon: 103.55, lat: 1.07, deg: 0.03, color: '#ffffff', at: t('#malacca') + 1.8, out: t('#trade'), lod: [3, 0.1] });
    k.emoji('🛢️', { lon: 104.4, lat: 1.5, size: 130, at: t('#trade') + 0.3, out: t('#dilemma') });
    k.emoji('📦', { lon: 108.5, lat: 6.5, size: 130, at: t('#trade') + 1.2, out: t('#dilemma') });
    c.ground('ONE CHOKEPOINT', { lon: 98, lat: 7.8, deg: 0.9, color: '#ffd84a', at: t('#dilemma') + 0.4, out: t('#nicobar') });
    c.ground('INDIAN OCEAN', { lon: 84, lat: 3, deg: 1.1, color: '#9fd0ff', at: t('#dilemma') + 0.1, out: t('#nicobar'), lod: [60, 5] });
    // India's islands at the western mouth
    c.glowLine([[93.83, 6.75], [95.35, 5.55]], { at: t('#nicobar') + 0.8, dur: 0.8, color: '#ffffff', width: 6, out: t('#reality') });
    c.ground('ABOUT 150 KM', { lon: 95.2, lat: 7.3, deg: 0.22, color: '#ffffff', at: t('#nicobar') + 1.4, out: t('#reality') });
    c.ground('ANDAMAN AND NICOBAR', { lon: 92.0, lat: 10.2, deg: 0.22, color: '#fff3c0', at: t('#nicobar') + 0.3, out: t('#reality') });
    // blocking it would be an act of war: ships go round
    k.emoji('❌', { lon: MALACCA[0], lat: MALACCA[1], size: 200, at: t('#reality') + 0.3, out: t('#pipes') });
    c.glowLine(SUNDA_ROUTE, { at: t('#reality') + 0.8, dur: 1.8, color: CYAN, width: 5, out: t('#pipes') });
    c.glowLine(LOMBOK_ROUTE, { at: t('#reality') + 1.5, dur: 1.8, color: CYAN, width: 5, out: t('#pipes') });
    c.ground('SUNDA', { lon: 105.8, lat: -4.2, deg: 0.9, color: '#a8f5ea', at: t('#reality') + 1.8, out: t('#pipes') });
    c.ground('LOMBOK', { lon: 115.7, lat: -6.4, deg: 0.9, color: '#a8f5ea', at: t('#reality') + 2.4, out: t('#pipes') });
    // China builds ways round it
    c.glowLine(PIPE_MYANMAR, { at: t('#pipes') + 0.3, dur: 1.6, color: '#3ddc6a', width: 6, out: t('#end') });
    c.ground('MYANMAR PIPELINE', { lon: 96.0, lat: 17.8, deg: 0.55, color: '#a8f5be', at: t('#pipes') + 0.8, out: t('#pipes') + 2.6 });
    c.glowLine(PIPE_GWADAR, { at: t('#pipes') + 2.8, dur: 1.6, color: '#3ddc6a', width: 6, out: t('#end') });
    c.ground('GWADAR', { lon: 66.5, lat: 24.0, deg: 0.55, color: '#a8f5be', at: t('#pipes') + 3.2, out: t('#end') });

    c.zoomBlur(); c.tilt();
    c.chip('Strait of Malacca', { lon: MALACCA[0], lat: MALACCA[1], at: 0.9, out: t('#malacca') + 0.2, size: 36 });
    c.chip('Singapore', { lon: 103.85, lat: 1.3, at: t('#malacca') + 1.2, out: t('#trade'), size: 36, dy: -20 });
    c.chip('Great Nicobar', { lon: 93.8, lat: 7.0, at: t('#nicobar') + 0.6, out: t('#reality'), size: 34, dy: -20 });
    c.chip('Act of war', { lon: MALACCA[0], lat: MALACCA[1], at: t('#reality') + 0.8, out: t('#pipes'), size: 38, dy: -90 });

    k.grade(); k.ambient(); k.vignette();
    k.credit('Schematic map', { y: 0.955 });
    k.hook('What if the *Malacca Strait* was blocked?', { at: 0.2, out: 5.4 });
    k.twist(t('#reality'));
    k.hook('Weakness *or* strength?', { at: t('#end') + 0.2, out: end, y: 0.17 });
    k.progress();
    k.whatIfCaptions({ size: 64, maxChars: 12 });
  },
};

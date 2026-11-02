// What if Taiwan's chips were cut off? Taiwan and its strait (130 km), the 90 percent share and TSMC, what depends on the chips, a stopped
// shipping lane, trillions in cost, and a dive to India's first chip plants in Gujarat. Neutral on any country's intentions; schematic map.
import { setParallel, basemap, kit } from './lib/kit.js';
import { cinema, cine, routePoint } from './lib/cine.js';
import { TAIWAN_STRAIT, TAIWAN_LANE, HSINCHU, SANAND } from './data/chokepoints.js';

setParallel(25);
const AMBER = '#ffb02e'; const TEAL = '#19e0c8';

export default {
  story(s) {
    const t = (m) => s.time(m);
    const MARKS = ['#strait', '#chips', '#phones', '#blockade', '#cost', '#india', '#end'].map(t);
    const end = s.dur;
    const cam = cinema(s, [
      { lon: 118.5, lat: 25, span: 16, tilt: 0.3 },
      { at: t('#strait') - 0.3, dur: 2.0, lon: 120.3, lat: 24.9, span: 3.4, tilt: 0.42 },
      { at: t('#chips') - 0.3, dur: 2.2, lon: 121.0, lat: 24.7, span: 2.2, tilt: 0.44, ease: 'dive' },
      { at: t('#phones') - 0.3, dur: 2.0, lon: 121, lat: 24, span: 22, tilt: 0.3 },
      { at: t('#blockade') - 0.3, dur: 1.9, lon: 120.5, lat: 24.6, span: 7, tilt: 0.4 },
      { at: t('#cost') - 0.3, dur: 2.0, lon: 118, lat: 25, span: 40, tilt: 0.26 },
      { at: t('#india') - 0.3, dur: 2.8, lon: 72.5, lat: 22.6, span: 3.2, tilt: 0.42, ease: 'dive' },
      { at: t('#end') - 0.2, dur: 2.2, lon: 118.5, lat: 25, span: 16, tilt: 0.3, ease: 'dive' },
    ], { beats: MARKS });
    const k = kit(s, cam); const c = cine(s, cam);

    basemap(s); c.dim(0.5);
    c.fill('Taiwan', { color: '#19b6a6', alpha: 0.6, border: '#9ff7ea', at: 0.3, mainland: false });
    c.ground('TAIWAN', { lon: 121.0, lat: 23.6, deg: 0.4, color: '#e9fffb', at: 0.5, lod: [30, 4] });
    c.ground('CHINA', { lon: 117.2, lat: 27.5, deg: 0.5, color: '#e9eef5', at: 0.6, lod: [30, 4] });
    c.glowLine(TAIWAN_LANE, { at: 0.8, dur: 2.4, color: AMBER, width: 6, core: '#ffe3a3', out: t('#blockade') });
    c.sprite('🚢', { size: 100, at: 1.2, out: t('#blockade'), pos: (tt) => routePoint(TAIWAN_LANE, (tt * 0.09) % 1) });
    c.sprite('🚢', { size: 90, at: 2.0, out: t('#blockade'), flip: true, pos: (tt) => routePoint(TAIWAN_LANE, 1 - ((tt * 0.07) % 1)) });
    // the strait, 130 km
    c.glowLine(TAIWAN_STRAIT, { at: t('#strait') + 1.0, dur: 0.6, color: '#ffffff', width: 6, out: t('#chips') });
    c.ground('130 KM', { lon: 120.3, lat: 25.45, deg: 0.1, color: '#ffffff', at: t('#strait') + 1.4, out: t('#chips') });
    // chips: Hsinchu, TSMC
    c.pulse({ lon: HSINCHU[0], lat: HSINCHU[1], r: 200, color: '25,240,255', at: t('#chips') + 1.8, dur: 1.2 });
    k.emoji('🔬', { lon: 121.35, lat: 24.95, size: 140, at: t('#chips') + 1.4, out: t('#phones') });
    // what depends on them
    [['📱', 117.0, 28.0], ['🚗', 126.0, 28.0], ['🖥️', 117.0, 20.0], ['🤖', 126.0, 20.0]].forEach(([e, lon, lat], i) => {
      k.flow([[121.2, 24.3], [lon, lat]], { at: t('#phones') + 0.3 + 0.4 * i, grow: 1.1, color: '#7ff3e4', width: 7, out: t('#blockade') });
      k.emoji(e, { lon, lat, size: 150, at: t('#phones') + 0.8 + 0.4 * i, out: t('#blockade') });
    });
    // a stopped lane
    k.emoji('❌', { lon: 120.0, lat: 24.9, size: 200, at: t('#blockade') + 0.3, out: t('#cost') });
    c.ground('SHIPMENTS STOP', { lon: 120.8, lat: 26.3, deg: 0.26, color: '#ff8a80', at: t('#blockade') + 0.6, out: t('#cost') });
    k.emoji('💸', { lon: 118.0, lat: 25.0, size: 200, at: t('#cost') + 0.4, out: t('#india') });
    k.emoji('📉', { lon: 124.0, lat: 29.0, size: 170, at: t('#cost') + 1.0, out: t('#india') });
    c.ground('TRILLIONS OF DOLLARS', { lon: 119.0, lat: 33.0, deg: 0.9, color: '#ffd84a', at: t('#cost') + 0.8, out: t('#india') });
    // India's first chip plants
    c.pulse({ lon: SANAND[0], lat: SANAND[1], r: 200, color: '255,216,74', at: t('#india') + 2.2, dur: 1.2 });
    c.pulse({ lon: 72.2, lat: 22.25, r: 200, color: '255,216,74', at: t('#india') + 2.8, dur: 1.2 });
    c.ground('OLDER CHIPS + ASSEMBLY', { lon: 72.3, lat: 22.5, deg: 0.065, color: '#ffe89a', at: t('#india') + 2.6, out: t('#end') });

    c.zoomBlur(); c.tilt();
    c.chip('Taiwan Strait', { lon: 120.3, lat: 25.2, at: t('#strait') + 0.6, out: t('#chips'), size: 36, dy: -40 });
    c.chip('TSMC', { lon: HSINCHU[0], lat: HSINCHU[1], at: t('#chips') + 1.0, out: t('#phones'), size: 40, dy: -30 });
    c.chip('Sanand', { lon: SANAND[0], lat: SANAND[1], at: t('#india') + 2.6, out: t('#end'), size: 36, dy: -20 });
    c.chip('Dholera', { lon: 72.2, lat: 22.25, at: t('#india') + 3.0, out: t('#end'), size: 36, dy: -20 });
    c.number(0, 90, { at: t('#chips') + 1.6, out: t('#phones') - 0.2, delay: 0.3, dur: 2.2, suffix: '%', label: 'of the most advanced chips', y: 0.64, size: 130 });

    k.grade(); k.ambient(); k.vignette();
    k.credit('Schematic map', { y: 0.955 });
    k.hook("What if *Taiwan's chips* were cut off?", { at: 0.2, out: 4.2 });
    k.twist(t('#blockade'));
    k.hook('Depend on *one island*?', { at: t('#end') + 0.2, out: end, y: 0.17 });
    k.progress();
    k.whatIfCaptions({ size: 64, maxChars: 12 });
  },
};

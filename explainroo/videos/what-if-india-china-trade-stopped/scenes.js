// What if India and China stopped trading? A sea route between the two, bars for imports and exports, the goods that come in, a sudden stop and
// where else India could buy. Figures are rounded and flagged in script.md. Stylised route; schematic map.
import { setParallel, basemap, kit } from './lib/kit.js';
import { cinema, cine, routePoint } from './lib/cine.js';

setParallel(25);
const ROUTE = [[72.9, 19.0], [76, 10], [80, 6], [88, 6.2], [94, 5.8], [98, 4.2], [100.5, 2.9], [103.9, 1.25], [106, 3.0], [109, 7], [112, 12], [115, 17], [118, 22.5], [121.5, 26], [121.6, 31.2]];
const AMBER = '#ffb02e'; const BLUE = '#3da5ff';

export default {
  story(s) {
    const t = (m) => s.time(m);
    const MARKS = ['#deficit', '#goods', '#pharma', '#hit', '#china', '#shift', '#end'].map(t);
    const end = s.dur;
    const cam = cinema(s, [
      { lon: 97, lat: 22, span: 80, tilt: 0.2 },
      { at: t('#goods') - 0.3, dur: 2.2, lon: 80, lat: 16, span: 26, tilt: 0.32 },
      { at: t('#hit') - 0.3, dur: 2.0, lon: 90, lat: 18, span: 50, tilt: 0.26 },
      { at: t('#china') - 0.3, dur: 2.2, lon: 112, lat: 26, span: 30, tilt: 0.32 },
      { at: t('#shift') - 0.3, dur: 2.4, lon: 100, lat: 20, span: 66, tilt: 0.22 },
      { at: t('#end') - 0.2, dur: 2.0, lon: 97, lat: 22, span: 80, tilt: 0.2 },
    ], { beats: MARKS });
    const k = kit(s, cam); const c = cine(s, cam);

    basemap(s); c.dim(0.55);
    k.fill('India', { color: '#12395e', alpha: 0.4, border: '#7fc0ff', at: 0.2 });
    c.ground('INDIA', { lon: 79.5, lat: 24.5, deg: 1.5, color: '#cfe3ff', at: 0.4, out: t('#goods') });
    c.ground('CHINA', { lon: 108, lat: 36, deg: 2.3, color: '#ffd0cc', at: 0.6, out: t('#goods') });
    c.glowLine(ROUTE, { at: 0.6, dur: 2.8, color: AMBER, width: 7, core: '#ffe3a3', out: t('#hit') + 1.2 });
    c.sprite('🚢', { size: 120, at: 1.2, out: t('#hit'), pos: (tt) => routePoint(ROUTE, (tt * 0.07) % 1) });
    c.sprite('🚢', { size: 100, at: 2.4, out: t('#hit'), flip: true, pos: (tt) => routePoint(ROUTE, 1 - ((tt * 0.05) % 1)) });
    // what comes in
    [['📱', 118.0, 24.5, 0.2], ['☀️', 112.0, 14.0, 0.8], ['⚙️', 100.5, 4.5, 1.4], ['🧪', 85.0, 8.5, 2.0]].forEach(([e, lon, lat, d]) => k.emoji(e, { lon, lat, size: 120, at: t('#goods') + d, out: t('#pharma') }));
    k.emoji('💊', { lon: 77.5, lat: 17.0, size: 170, at: t('#pharma') + 0.2, out: t('#hit') });
    // the sudden stop
    k.emoji('❌', { lon: 98, lat: 4.2, size: 230, at: t('#hit') + 0.2, out: t('#china') });
    k.emoji('🏭', { lon: 77.0, lat: 14.0, size: 150, at: t('#hit') + 0.9, out: t('#china') });
    k.emoji('📈', { lon: 80.5, lat: 14.0, size: 130, at: t('#hit') + 1.5, out: t('#china') });
    c.ground('PRICES UP', { lon: 79.0, lat: 10.5, deg: 0.9, color: '#ff8a80', at: t('#hit') + 1.8, out: t('#china') });
    // China loses a market too, but a small share
    k.emoji('🏭', { lon: 114.0, lat: 23.0, size: 150, at: t('#china') + 0.3, out: t('#shift') });
    c.ground('A SMALL SHARE OF EXPORTS', { lon: 111.0, lat: 30.0, deg: 0.4, color: '#ffd0cc', at: t('#china') + 0.8, out: t('#shift') });
    // other suppliers
    [['VIETNAM', 106.0, 16.0], ['TAIWAN', 121.0, 23.8], ['KOREA', 127.8, 36.4]].forEach(([n, lon, lat], i) => {
      k.flow([[80.0, 19.0], [lon, lat]], { at: t('#shift') + 0.3 + 0.5 * i, grow: 1.4, color: '#7cc4ff', width: 6, out: t('#end') });
      c.ground(n, { lon, lat: lat + 1.4, deg: 0.7, color: '#bfe3ff', at: t('#shift') + 1.2 + 0.5 * i, out: t('#end') });
    });
    k.emoji('🏭', { lon: 78.0, lat: 20.0, size: 150, at: t('#shift') + 2.2, out: t('#end') });

    c.zoomBlur(); c.tilt();
    k.stat('$118B', { at: 0.9, out: t('#deficit') - 0.2, label: 'trade a year', y: 0.62, size: 120 });
    c.versus([
      { label: 'India buys from China', value: 101, unit: 'B', color: AMBER },
      { label: 'India sells to China', value: 17, unit: 'B', color: BLUE },
    ], { at: t('#deficit') + 0.2, out: t('#goods') - 0.2, y: 0.4 });
    c.chip('About 70% of raw ingredients', { lon: 77.5, lat: 17.0, at: t('#pharma') + 0.6, out: t('#hit'), size: 34, dy: -90 });
    c.chip('Make in India', { lon: 78.0, lat: 20.0, at: t('#shift') + 2.6, out: t('#end'), size: 36, dy: -80 });

    k.grade(); k.ambient(); k.vignette();
    k.credit('Schematic map', { y: 0.955 });
    k.hook('What if India and China *stopped trading*?', { at: 0.2, out: 5.0 });
    k.twist(t('#hit'));
    k.hook('Cut the *dependence*?', { at: t('#end') + 0.2, out: end, y: 0.17 });
    k.progress();
    k.whatIfCaptions({ size: 64, maxChars: 12 });
  },
};

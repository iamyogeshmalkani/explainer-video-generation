// What if every neighbour closed its border with India? India's outline, six red border groups closing one by one, then a blue sea route.
// Schematic: the border lines are stylised and show no claims (data/southasia.js).
import { setParallel, basemap, kit } from './lib/kit.js';
import { cinema, cine, routePoint } from './lib/cine.js';
import { BORDERS, SEA_ROUTE, PORTS } from './data/southasia.js';

setParallel(22);
const RED = '#ff3b30'; const BLUE = '#3da5ff';

export default {
  story(s) {
    const t = (m) => s.time(m);
    const MARKS = ['#six', '#pak', '#chi', '#nep', '#bhu', '#ban', '#mya', '#stop', '#landlocked', '#sea', '#coast', '#regional', '#end'].map(t);
    const end = s.dur;
    const coast = { at: t('#coast') - 0.3, dur: t('#regional') - t('#coast') - 0.1 };
    const cam = cinema(s, [
      { lon: 82.5, lat: 22.5, span: 46, tilt: 0.25 },
      { at: t('#stop') - 0.3, dur: 2.2, lon: 82.5, lat: 24.0, span: 40, tilt: 0.28 },
      { at: t('#landlocked') - 0.3, dur: 2.2, lon: 86.0, lat: 27.4, span: 12, tilt: 0.36 },
      { at: t('#sea') - 0.3, dur: 2.4, lon: 78.5, lat: 15.5, span: 24, tilt: 0.32 },
      { ...coast, follow: SEA_ROUTE.slice(1), span: 11, zoomBy: 0.4, tilt: 0.34 },
      { at: t('#regional') - 0.3, dur: 2.2, lon: 82.5, lat: 24.0, span: 40, tilt: 0.28 },
    ], { beats: MARKS });
    const k = kit(s, cam); const c = cine(s, cam);

    basemap(s); c.dim(0.58);
    k.fill('India', { color: '#12395e', alpha: 0.45, border: '#7fc0ff', at: 0.2 });
    c.ground('INDIA', { lon: 79.0, lat: 22.5, deg: 1.9, color: '#cfe3ff', at: 0.4, lod: [60, 10] });
    k.stat('15,000+ km', { at: 0.9, out: 4.4, label: 'of land border', y: 0.5, size: 110 });

    // the six borders close one by one, each at its name
    const order = [['Pakistan', '#pak', 'PAKISTAN', 66.5, 29.2], ['China', '#chi', 'CHINA', 84.0, 34.0], ['Nepal', '#nep', 'NEPAL', 84.2, 28.7], ['Bhutan', '#bhu', 'BHUTAN', 90.3, 27.8], ['Bangladesh', '#ban', 'BANGLADESH', 90.7, 23.3], ['Myanmar', '#mya', 'MYANMAR', 96.6, 24.3]];
    order.forEach(([name, m, label, lon, lat]) => {
      BORDERS[name].forEach((pts) => c.glowLine(pts, { at: t(m) - 0.1, dur: 0.55, color: RED, width: 9 }));
      c.ground(label, { lon, lat, deg: 0.9, color: '#ffb3ac', at: t(m), out: t('#stop') + 1.5, lod: [60, 8] });
    });
    k.emoji('🚛', { lon: 74.6, lat: 31.4, size: 110, at: t('#stop') + 0.2, out: t('#landlocked') });
    k.emoji('🚆', { lon: 88.4, lat: 26.5, size: 110, at: t('#stop') + 0.6, out: t('#landlocked') });
    k.emoji('❌', { lon: 74.6, lat: 31.4, size: 150, at: t('#stop') + 0.7, out: t('#landlocked') });
    k.emoji('❌', { lon: 88.4, lat: 26.5, size: 150, at: t('#stop') + 1.1, out: t('#landlocked') });

    // Nepal and Bhutan: landlocked
    k.fill(['Nepal', 'Bhutan'], { color: '#ffb02e', alpha: 0.4, border: '#ffd37a', at: t('#landlocked'), out: t('#sea'), mainland: false });
    c.ground('LANDLOCKED', { lon: 86.0, lat: 29.6, deg: 0.4, color: '#ffe3a3', at: t('#landlocked') + 0.5, out: t('#sea') });
    k.emoji('🔒', { lon: 84.2, lat: 28.2, size: 140, at: t('#landlocked') + 1.0, out: t('#sea') });
    k.flow([[84.5, 27.9], [84.5, 26.3]], { at: t('#landlocked') + 1.5, grow: 1.2, color: '#ffd37a', width: 8, out: t('#sea') });

    // but the sea is open
    c.glowLine(SEA_ROUTE, { at: t('#sea'), dur: t('#regional') - t('#sea') - 0.3, ease: 'linear', color: BLUE, width: 8, out: t('#end') });
    PORTS.forEach(([name, lon, lat], i) => k.emoji('⚓', { lon, lat, size: 90, at: t('#sea') + 0.6 + 0.4 * i, out: t('#regional') }));
    c.sprite('🚢', { size: 130, at: t('#sea') + 0.4, out: t('#regional'), pos: (tt) => routePoint(SEA_ROUTE, Math.min(1, tt / (t('#regional') - t('#sea') - 0.6))) });
    c.sprite('🚢', { size: 110, at: t('#coast'), out: t('#regional'), pos: (tt) => routePoint(SEA_ROUTE, Math.min(1, 0.2 + tt / 12)) });
    c.ground('7,500 KM COAST', { lon: 74.4, lat: 14.2, deg: 0.8, color: '#9fd0ff', rotate: 70, at: t('#coast') + 0.3, out: t('#regional') });
    // the real damage: border towns
    [[74.87, 31.63], [84.85, 26.98], [88.43, 26.72], [88.87, 23.03], [94.3, 24.25]].forEach(([lon, lat], i) => k.pin({ lon, lat, at: t('#regional') + 0.3 + 0.3 * i, out: t('#end'), color: RED }));

    c.zoomBlur(); c.tilt();
    c.chip('Border towns', { lon: 74.87, lat: 31.63, at: t('#regional') + 0.5, out: t('#end'), size: 36, dy: -80 });
    c.chip('Local trade', { lon: 88.87, lat: 23.03, at: t('#regional') + 1.1, out: t('#end'), size: 36, dy: -80 });
    c.chip('Supply lines', { lon: 94.3, lat: 24.25, at: t('#regional') + 1.7, out: t('#end'), size: 36, dy: -80 });

    k.grade(); k.ambient(); k.vignette();
    k.credit('Schematic map', { y: 0.955 });
    k.hook('What if *every border* closed?', { at: 0.2, out: 4.3 });
    k.twist(t('#sea'));
    k.hook('Which border *hurts*?', { at: t('#end') + 0.2, out: end, y: 0.17 });
    k.progress();
    k.whatIfCaptions({ size: 64, maxChars: 12 });
  },
};

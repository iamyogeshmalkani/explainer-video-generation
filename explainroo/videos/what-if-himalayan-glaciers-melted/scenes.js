// What if the Himalayan glaciers melted in 10 years? A melting glacier at the top of the map and three rivers (Indus, Ganga, Brahmaputra) that
// swell first, then thin. The river lines are stylised (data/southasia.js, data/brahmaputra.js). Schematic: no numbers for the melt share.
import { setParallel, basemap, kit } from './lib/kit.js';
import { cinema, cine } from './lib/cine.js';
import { INDUS, GANGA, HIMALAYA_LINE } from './data/southasia.js';
import { TSANGPO, SIANG, BRAHMAPUTRA } from './data/brahmaputra.js';

setParallel(32);
const sm = (q) => { q = Math.min(1, Math.max(0, q)); return q * q * (3 - 2 * q); };
const BR = [...TSANGPO, ...SIANG.slice(1), ...BRAHMAPUTRA.slice(1)];

export default {
  story(s) {
    const t = (m) => s.time(m);
    const MARKS = ['#three', '#indus', '#ganga', '#brahma', '#people', '#first', '#then', '#indus2', '#ganga2', '#brahma2', '#ten', '#real', '#end'].map(t);
    const end = s.dur;
    const cam = cinema(s, [
      { lon: 82, lat: 31.5, span: 28, tilt: 0.3 },
      { at: t('#first') - 0.3, dur: 2.0, lon: 82, lat: 30.5, span: 26, tilt: 0.32 },
      { at: t('#indus2') - 0.3, dur: 2.2, lon: 75.5, lat: 31.5, span: 12, tilt: 0.38 },
      { at: t('#ganga2') - 0.3, dur: 2.2, lon: 81.0, lat: 27.8, span: 12, tilt: 0.38 },
      { at: t('#brahma2') - 0.3, dur: 2.2, lon: 91.0, lat: 28.0, span: 12, tilt: 0.38 },
      { at: t('#ten') - 0.2, dur: 2.2, lon: 82, lat: 30.5, span: 28, tilt: 0.3 },
    ], { beats: MARKS });
    const k = kit(s, cam); const c = cine(s, cam);

    // the rivers swell until the ice is gone, then thin
    const swell = () => (tt) => 0.12 + 0.7 * sm((tt - (t('#first') - 0.2)) / 2) - 0.78 * sm((tt - (t('#then') - 0.2)) / (t('#real') - t('#then')));
    const AT = 0.2;
    basemap(s); c.dim(0.45);
    k.ridge(HIMALAYA_LINE, { at: 0.5, out: end, width: 10, peak: 24, step: 40 });
    [[INDUS, '#2f7dff', 'INDUS', '#9cc7ff', 70.2, 32.6, '#indus'], [GANGA, '#19e0c8', 'GANGA', '#a8f5ea', 80.2, 27.4, '#ganga'], [BR, '#ffb02e', 'BRAHMAPUTRA', '#ffdc9a', 90.8, 29.6, '#brahma']].forEach(([pts, col, label, lab, lon, lat, m], i) => {
      c.glowLine(pts, { at: t(m), dur: 1.4, color: col, width: 5, out: end });
      c.band(pts, { at: AT, dur: 0, deg: (tt) => Math.max(0.01, swell()(tt + AT)), alpha: (tt) => 0.25 + 0.4 * Math.min(1, Math.max(0, swell()(tt + AT) / 0.5)), color: col.slice(1).match(/../g).map((h) => parseInt(h, 16)).join(','), core: '210,235,255' });
      c.ground(label, { lon, lat, deg: 0.4, color: lab, at: t(m) + 0.2, out: t('#people') });
    });
    // the glacier melts
    c.sprite('🧊', { lon: 82.5, lat: 33.6, size: 220, at: 0.6, out: end, scale: (tt) => 1.2 * (1 - 0.92 * sm((tt - (t('#first') - 0.6)) / (t('#real') - t('#first') + 1))) + 0.05 });
    c.sprite('💧', { lon: 82.5, lat: 32.2, size: 100, at: t('#first'), out: t('#real') + 1, scale: (tt) => 0.7 + 0.3 * Math.sin(tt * 5) });
    c.ground('THIRD POLE', { lon: 82.5, lat: 35.4, deg: 0.7, color: '#d6f0ff', at: 0.7, out: t('#three') });
    k.emoji('👥', { lon: 86.0, lat: 24.5, size: 170, at: t('#people') + 0.2, out: t('#first') });
    c.ground('MILLIONS DOWNSTREAM', { lon: 84.0, lat: 23.0, deg: 0.5, color: '#ffe3a3', at: t('#people') + 0.4, out: t('#first') });
    c.ground('FLOODS FIRST', { lon: 82.0, lat: 28.0, deg: 0.7, color: '#7cc4ff', at: t('#first') + 0.2, out: t('#then') });
    c.ground('THEN DRY SEASON DROPS', { lon: 82.0, lat: 27.5, deg: 0.4, color: '#ffd84a', at: t('#then') + 0.2, out: t('#indus2') });
    c.ground('MELT-FED', { lon: 72.6, lat: 33.4, deg: 0.28, color: '#9cc7ff', at: t('#indus2') + 0.3, out: t('#ganga2') });
    c.ground('MONSOON + GROUNDWATER', { lon: 80.6, lat: 29.0, deg: 0.2, color: '#a8f5ea', at: t('#ganga2') + 0.3, out: t('#brahma2') });
    c.ground('MIXED', { lon: 92.6, lat: 29.0, deg: 0.4, color: '#ffdc9a', at: t('#brahma2') + 0.3, out: t('#ten') });

    c.zoomBlur(); c.tilt();
    c.chip('Indus', { lon: 75.0, lat: 35.1, at: t('#indus2') + 0.5, out: t('#ganga2'), size: 40, dy: -30 });
    c.chip('Ganga', { lon: 79.1, lat: 30.9, at: t('#ganga2') + 0.5, out: t('#brahma2'), size: 40, dy: -30 });
    c.chip('Brahmaputra', { lon: 93.8, lat: 29.45, at: t('#brahma2') + 0.5, out: t('#ten'), size: 40, dy: -30 });

    k.grade(); k.ambient(); k.vignette();
    k.credit('Schematic map', { y: 0.955 });
    k.hook('What if Himalayan ice *vanished in 10 years*?', { at: 0.2, out: 3.2 });
    k.twist(t('#then'));
    k.hook('Which river *worries* you?', { at: t('#end') + 0.2, out: end, y: 0.17 });
    k.progress();
    k.whatIfCaptions({ size: 64, maxChars: 12 });
  },
};

// What if China blocked the Brahmaputra? Part 3: India's response. Arunachal Pradesh highlighted on a dark map, a dam icon on the Siang,
// the proposed reservoir, the villages that could be submerged, data sharing and downstream floods and droughts, and the three pulls
// (security, development, homes). The dam position and the river line are approximate (data/brahmaputra.js).
import { setParallel, basemap, kit } from './lib/kit.js';
import { cinema, cine } from './lib/cine.js';
import { TSANGPO, SIANG, BRAHMAPUTRA, SIANG_DAM } from './data/brahmaputra.js';

setParallel(27);
const GOLD = '#ffd84a'; const TEAL = '#19e0c8'; const BLUE = '#3da5ff';

export default {
  story(s) {
    const t = (m) => s.time(m);
    const MARKS = ['#sump', '#store', '#study', '#adi', '#fear', '#data', '#plan', '#villain', '#pull', '#end'].map(t);
    const end = s.dur;

    const cam = cinema(s, [
      { lon: 94.6, lat: 28.3, span: 5.5, tilt: 0.34 },                                                              // Arunachal Pradesh
      { at: t('#sump') - 0.3, dur: 2.4, lon: SIANG_DAM[0] + 0.1, lat: SIANG_DAM[1] + 0.05, span: 1.8, tilt: 0.42, ease: 'dive' },   // in on the proposed dam
      { at: t('#sump') + 2.8, dur: t('#store') - t('#sump') - 3.6, lon: SIANG_DAM[0] + 0.15, lat: SIANG_DAM[1] - 0.05, span: 1.5, tilt: 0.44 },
      { at: t('#store') - 0.2, dur: 2.2, lon: SIANG_DAM[0] + 0.05, lat: SIANG_DAM[1] + 0.05, span: 2.2, tilt: 0.4 },    // the reservoir
      { at: t('#adi') - 0.2, dur: 2.4, lon: 95.1, lat: 28.4, span: 1.4, tilt: 0.44 },                                // the villages
      { at: t('#data') - 0.3, dur: 2.4, lon: 93.2, lat: 27.0, span: 7, tilt: 0.3 },                                 // data sharing, floods and droughts downstream
      { at: t('#villain') - 0.25, dur: 2.2, lon: 95.0, lat: 28.4, span: 4, tilt: 0.38 },                            // the three pulls
      { at: t('#end') - 0.25, dur: 2.0, lon: 94.4, lat: 28.0, span: 7, tilt: 0.3 },
    ], { beats: MARKS });
    const k = kit(s, cam);
    const c = cine(s, cam);

    basemap(s);
    c.dim(0.58);
    k.fill('India', { color: '#12395e', alpha: 0.35, border: '#4aa8ff', at: 0.2 });
    c.fill('Arunachal Pradesh', { color: GOLD, alpha: 0.38, border: GOLD, lod: [4.5, 1.8], at: 0.4 });          // India's official outline, Arunachal highlighted
    c.glowLine([...TSANGPO.slice(-3), ...SIANG.slice(1), ...BRAHMAPUTRA.slice(1, 4)], { at: 0.5, dur: 1.4, color: TEAL, width: 7 });
    c.ground('ARUNACHAL PRADESH', { lon: 94.2, lat: 28.0, deg: 0.2, color: '#fff3c0', at: 0.6, lod: [4.5, 2.8] });

    // the proposed dam, the reservoir it would make, and what lies under it
    c.dam({ lon: SIANG_DAM[0], lat: SIANG_DAM[1], size: 170, at: 0.9 });
    c.pulse({ lon: SIANG_DAM[0], lat: SIANG_DAM[1], r: 230, color: '255,216,74', at: t('#sump') + 2.2, dur: 1.2 });
    c.ground('11,200 MW', { lon: 95.5, lat: 28.78, deg: 0.1, color: '#ffe89a', at: t('#sump') + 2.4, out: t('#store') + 0.4, lod: [3, 0.2] });
    k.disc(SIANG_DAM[0] - 0.02, SIANG_DAM[1] + 0.04, { at: t('#store') + 0.2, r0: 0.01, r1: 0.14, dur: 2.4, color: '#2e8cff', alpha: 0.6 });
    k.emoji('🛡️', { lon: 95.45, lat: 28.85, size: 150, at: t('#store') + 1.4, out: t('#study') });
    k.emoji('📋', { lon: 95.4, lat: 28.78, size: 140, at: t('#study') + 0.1, out: t('#adi') });
    k.emoji('🪧', { lon: 94.75, lat: 28.42, size: 150, at: t('#adi') + 0.1, out: t('#data') - 0.3 });
    k.emoji('🏘️', { lon: 95.12, lat: 28.4, size: 140, at: t('#fear') + 0.1, out: t('#data') - 0.3 });
    k.emoji('🌾', { lon: 94.96, lat: 28.3, size: 130, at: t('#fear') + 0.6, out: t('#data') - 0.3 });
    k.disc(95.05, 28.37, { at: t('#fear') + 0.9, r0: 0.01, r1: 0.2, dur: 2.0, color: '#2e8cff', alpha: 0.5, out: t('#data') - 0.3 });   // the water rising over them

    // data, and the plan for floods and droughts downstream
    k.emoji('🤝', { lon: 95.0, lat: 29.0, size: 150, at: t('#data') + 0.3, out: t('#villain') });
    k.emoji('🌊', { lon: 92.7, lat: 26.5, size: 150, at: t('#plan') + 0.2, out: t('#villain') });
    k.emoji('🏜️', { lon: 92.0, lat: 25.9, size: 150, at: t('#plan') + 1.2, out: t('#villain') });

    // the pulls: three ways out of one dam
    const D = SIANG_DAM;
    k.flow([[D[0] + 0.1, D[1] + 0.1], [D[0] + 0.9, D[1] + 0.65]], { at: t('#villain') + 0.3, grow: 1.0, color: '#ff6b5e', width: 7, out: t('#end') });
    k.flow([[D[0] - 0.1, D[1] + 0.1], [D[0] - 1.1, D[1] + 0.6]], { at: t('#villain') + 1.3, grow: 1.0, color: '#3ddc6a', width: 7, out: t('#end') });
    k.flow([[D[0] + 0.05, D[1] - 0.1], [D[0] + 0.5, D[1] - 0.95]], { at: t('#pull') + 0.4, grow: 1.0, color: GOLD, width: 7, out: t('#end') });
    k.tag('SECURITY', { lon: D[0] + 1.05, lat: D[1] + 0.8, size: 56, color: '#ff6b5e', at: t('#villain') + 0.9, out: t('#end') });
    k.tag('DEVELOPMENT', { lon: D[0] - 1.1, lat: D[1] + 0.8, size: 56, color: '#3ddc6a', at: t('#villain') + 1.9, out: t('#end') });
    k.tag("PEOPLE'S HOMES", { lon: D[0] + 0.65, lat: D[1] - 1.15, size: 56, color: GOLD, at: t('#pull') + 1.0, out: t('#end') });

    // the closing question
    k.tag('BUILD', { lon: 93.6, lat: 28.9, size: 100, color: '#3ddc6a', at: t('#end') + 0.4 });
    k.tag('PROTECT', { lon: 95.2, lat: 27.4, size: 100, color: BLUE, at: t('#end') + 0.8 });

    c.zoomBlur();
    c.tilt();

    c.chip('Siang Upper Project', { lon: D[0], lat: D[1], at: t('#sump') + 1.6, out: t('#store'), size: 36, dy: -110 });
    c.chip('Study stage', { lon: D[0], lat: D[1], at: t('#study') + 0.2, out: t('#adi'), size: 38, dy: -110 });
    c.chip('Adi communities', { lon: 94.75, lat: 28.42, at: t('#adi') + 0.5, out: t('#fear') + 0.5, size: 36, dy: -70 });
    c.chip('Submerged?', { lon: 95.1, lat: 28.4, at: t('#fear') + 1.6, out: t('#data') - 0.3, size: 38, dy: -70 });
    c.chip('Data sharing', { lon: 95.0, lat: 29.0, at: t('#data') + 0.8, out: t('#plan'), size: 38, dy: -70 });
    c.chip('Floods', { lon: 92.7, lat: 26.5, at: t('#plan') + 0.7, out: t('#villain'), size: 38, dy: -70 });
    c.chip('Droughts', { lon: 92.0, lat: 25.9, at: t('#plan') + 1.7, out: t('#villain'), size: 38, dy: -70 });

    k.grade();
    k.ambient();
    k.vignette();
    k.hook('What if India *built its own dam*?', { at: 0.2, out: 3.0 });
    k.twist(t('#study'));
    k.hook('Build *or* protect?', { at: t('#end') + 0.3, out: end, y: 0.17 });
    k.progress();
    k.whatIfCaptions({ size: 64, maxChars: 12 });
  },
};

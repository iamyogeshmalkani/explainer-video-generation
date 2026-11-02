// What if China blocked the Brahmaputra? Part 1: The river. A dark schematic map, a glowing river in three colours (one per name),
// a flight that follows it from Tibet to the sea, a move to the Great Bend, a bar comparison, and the monsoon water that is added inside India.
// The river line is stylised (data/brahmaputra.js), not surveyed.
import { setParallel, basemap, kit } from './lib/kit.js';
import { cinema, cine } from './lib/cine.js';
import { TSANGPO_UP, TSANGPO, SIANG, BRAHMAPUTRA, BANGLADESH, GREAT_BEND, TRIBUTARIES } from './data/brahmaputra.js';

setParallel(27);
const AMBER = '#ffb02e'; const TEAL = '#19e0c8'; const BLUE = '#3da5ff';

export default {
  story(s) {
    const t = (m) => s.time(m);
    const MARKS = ['#tibet', '#siang', '#brahma', '#bangla', '#bend', '#bigger', '#catch', '#cant', '#timing', '#part2'].map(t);
    const end = s.dur;

    // ---- camera: one flight per name of the river, then the Great Bend, then the monsoon view -------------------------
    const f1 = { at: t('#tibet') - 0.3, dur: t('#siang') - t('#tibet') - 0.1 };
    const f2 = { at: t('#siang') - 0.15, dur: t('#brahma') - t('#siang') + 0.05 };
    const f3 = { at: t('#brahma') - 0.2, dur: t('#bangla') - t('#brahma') - 0.1 };
    const f4 = { at: t('#bangla') - 0.1, dur: t('#bend') - t('#bangla') - 0.2 };
    const cam = cinema(s, [
      { lon: 86, lat: 29.8, span: 9, tilt: 0.3 },                                                                  // Tibet, the upper river
      { ...f1, follow: TSANGPO.slice(1), span: 6, zoomBy: 0.4, tilt: 0.34 },                                       // along the Yarlung Tsangpo to the Great Bend
      { ...f2, follow: SIANG.slice(1), span: 3.6, zoomBy: 0.4, tilt: 0.4 },                                        // down the Siang
      { ...f3, follow: BRAHMAPUTRA.slice(1), span: 5, zoomBy: 0.3, tilt: 0.36 },                                   // across Assam
      { ...f4, follow: BANGLADESH.slice(1), span: 6, zoomBy: 0.3, tilt: 0.32 },                                    // into Bangladesh and the sea
      { at: t('#bend') - 0.2, dur: 2.2, lon: GREAT_BEND[0] + 0.15, lat: GREAT_BEND[1] + 0.1, span: 2.2, tilt: 0.42, ease: 'dive' },   // back up to the Great Bend
      { at: t('#bigger') - 0.1, dur: 2.0, lon: 95.0, lat: 29.3, span: 3.2, tilt: 0.38 },
      { at: t('#catch') - 0.2, dur: 2.4, lon: 93.6, lat: 27.4, span: 7, tilt: 0.36 },                              // out over Assam: where the monsoon water joins
      { at: t('#cant') - 0.25, dur: 1.7, lon: 94.6, lat: 28.3, span: 6, tilt: 0.34 },
      { at: t('#timing') - 0.2, dur: 2.5, lon: 92.6, lat: 26.6, span: 9.5, tilt: 0.3 },                            // the whole river
      { at: t('#part2') - 0.2, dur: 2.2, lon: 91.5, lat: 27.0, span: 15, tilt: 0.25 },
    ], { beats: MARKS });
    const k = kit(s, cam);
    const c = cine(s, cam);

    // ---- the map: dark, India's official outline, the river ----------------------------------------------------------
    basemap(s);
    c.dim(0.58);
    k.fill('India', { color: '#12395e', alpha: 0.4, border: '#4aa8ff', at: 0.2 });

    c.glowLine([...TSANGPO_UP, TSANGPO[0]], { at: 0.4, dur: 1.6, color: AMBER, width: 6 });
    c.ground('TIBET', { lon: 86.2, lat: 30.9, deg: 0.4, color: '#e9eef5', lod: [14, 2], at: 0.5 });
    c.glowLine(TSANGPO, { ...f1, color: AMBER, width: 7 });
    c.ground('YARLUNG TSANGPO', { lon: 90.0, lat: 29.8, deg: 0.27, color: AMBER, at: t('#tibet'), out: t('#brahma') });
    c.glowLine(SIANG, { ...f2, color: TEAL, width: 7 });
    c.ground('SIANG', { lon: 96.1, lat: 28.5, deg: 0.18, color: TEAL, at: t('#siang'), out: t('#bangla') });
    c.glowLine(BRAHMAPUTRA, { ...f3, color: BLUE, width: 8 });
    c.ground('ASSAM', { lon: 92.3, lat: 27.55, deg: 0.36, color: '#e9eef5', at: t('#brahma') });
    c.ground('BRAHMAPUTRA', { lon: 92.6, lat: 27.0, deg: 0.17, color: '#9fd0ff', at: t('#brahma') + 0.3 });
    c.glowLine(BANGLADESH, { ...f4, color: BLUE, width: 8 });
    c.ground('BANGLADESH', { lon: 89.35, lat: 24.4, deg: 0.16, color: '#e9eef5', at: t('#bangla'), out: t('#bend') - 0.2 });

    // the Great Bend: a pulse, the number, and the bars against the Three Gorges Dam
    c.pulse({ lon: GREAT_BEND[0], lat: GREAT_BEND[1], r: 220, color: '255,176,46', at: t('#bend') + 1.7, dur: 1.2 });
    c.ground('60,000 MW', { lon: 95.7, lat: 29.85, deg: 0.13, color: '#ffd37a', at: t('#bend') + 1.9, out: t('#bigger') });
    // the catch: rain and tributaries add the monsoon water inside India
    TRIBUTARIES.forEach((pts, i) => c.glowLine(pts, { at: t('#catch') + 0.5 + 0.35 * i, dur: 1.1, color: '#9fd8ff', width: 4 }));
    c.ground('ADDED INSIDE INDIA', { lon: 93.9, lat: 28.15, deg: 0.2, color: '#cfeaff', at: t('#catch') + 0.6, out: t('#cant') });
    k.emoji('🌧️', { lon: 94.6, lat: 27.1, size: 130, at: t('#catch') + 1.4, out: t('#cant') });

    // a dam cannot switch it off: the dam at the Great Bend, the river still flowing
    c.dam({ lon: GREAT_BEND[0], lat: GREAT_BEND[1] - 0.05, size: 175, at: t('#cant') - 0.2, out: t('#part2') });
    k.flow(BRAHMAPUTRA, { at: t('#cant') + 0.1, grow: 1.5, color: '#7cc4ff', width: 7, out: t('#timing') + 1 });
    c.ground('STILL FLOWS', { lon: 94.0, lat: 28.0, deg: 0.2, color: '#ffffff', at: t('#cant') + 0.3, out: t('#timing') });

    // but it can change the timing
    c.pulse({ lon: 95.4, lat: 27.7, r: 150, color: '61,165,255', at: t('#timing') + 0.2, dur: 1.2 });
    c.pulse({ lon: 92.8, lat: 26.63, r: 150, color: '61,165,255', at: t('#timing') + 1.0, dur: 1.2 });
    c.ground('WHEN', { lon: 93.9, lat: 28.3, deg: 0.45, color: '#ffd84a', at: t('#timing') + 0.5, out: t('#part2') });
    c.ground('HOW MUCH', { lon: 92.9, lat: 25.3, deg: 0.36, color: '#ffd84a', at: t('#timing') + 1.6, out: t('#part2') });

    c.zoomBlur();
    c.tilt();

    c.versus([
      { label: 'Great Bend (planned)', value: 60, unit: ' GW', color: AMBER },
      { label: 'Three Gorges Dam', value: 22.5, unit: ' GW', color: '#7b8cff' },
    ], { at: t('#bigger') - 0.1, out: t('#catch') - 0.15, y: 0.42 });
    k.rain({ at: t('#catch') + 0.2, out: t('#cant') - 0.1, density: 0.8 });
    c.chip('Great Bend', { lon: GREAT_BEND[0], lat: GREAT_BEND[1], at: t('#bend') + 1.3, out: t('#bigger') - 0.15, size: 38 });

    // ---- screen layers ---------------------------------------------------------------------------------------------
    k.grade();
    k.ambient();
    k.vignette();
    k.hook('What if *China blocked* the Brahmaputra?', { at: 0.2, out: 3.6 });
    k.twist(t('#catch'));
    k.hook('Part 2: *Assam*', { at: t('#part2') + 0.2, out: end, y: 0.17 });
    k.progress();
    k.whatIfCaptions({ size: 64, maxChars: 12 });
    s.sfx('whoosh', t('#tibet') - 0.4, { gain: 0.25 });
  },
};

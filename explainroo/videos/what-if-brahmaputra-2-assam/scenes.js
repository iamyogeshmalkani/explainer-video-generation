// What if China blocked the Brahmaputra? Part 2: Assam. Assam in flood blue on a dark map, a river that swells and shrinks with the season
// (the switch at the top), the people who feel a dry spell first, a surge in the monsoon, and the missing early-warning data.
// The river line is stylised (data/brahmaputra.js), not surveyed.
import { setParallel, basemap, kit } from './lib/kit.js';
import { cinema, cine } from './lib/cine.js';
import { BRAHMAPUTRA, BANGLADESH, SIANG, GREAT_BEND } from './data/brahmaputra.js';

setParallel(27);
const BLUE = '#3da5ff';
const lerp = (a, b, p) => a + (b - a) * p;
const sm = (q) => { q = Math.min(1, Math.max(0, q)); return q * q * (3 - 2 * q); };

export default {
  story(s) {
    const t = (m) => s.time(m);
    const MARKS = ['#store', '#dry', '#farms', '#monsoon', '#warning', '#timing', '#part3'].map(t);
    const end = s.dur;

    const cam = cinema(s, [
      { lon: 93.0, lat: 26.8, span: 5.4, tilt: 0.34 },                                                   // Assam, in flood
      { at: t('#store') - 0.2, dur: 2.2, lon: 94.2, lat: 27.5, span: 4.8, tilt: 0.4 },                    // the dam upstream, the river below
      { at: t('#farms') - 0.3, dur: 2.0, lon: 92.4, lat: 26.4, span: 4.2, tilt: 0.4 },                    // farms, fisheries, ports
      { at: t('#monsoon') - 0.3, dur: 2.4, lon: 94.3, lat: 27.3, span: 3.6, tilt: 0.42 },                 // the surge enters Assam
      { at: t('#warning') - 0.3, dur: 2.2, lon: 94.6, lat: 27.9, span: 3.4, tilt: 0.4 },                  // towards China: where the data should come from
      { at: t('#timing') - 0.3, dur: 2.4, lon: 92.8, lat: 26.5, span: 6.2, tilt: 0.3 },                   // the whole of Assam: timing
      { at: t('#part3') - 0.2, dur: 2.2, lon: 93.8, lat: 27.6, span: 11, tilt: 0.25 },
    ], { beats: MARKS });
    const k = kit(s, cam);
    const c = cine(s, cam);

    // the river's width through the seasons: in flood, thin when the water is held back, in flood again, then flipping
    const FLOOD = 0.3; const DRY = 0.05;
    const level = (T) => {
      let v = FLOOD;
      v = lerp(v, DRY, sm((T - t('#dry')) / 0.9));
      v = lerp(v, FLOOD, sm((T - t('#monsoon')) / 1.0));
      for (let i = 0; i < 4; i++) v = lerp(v, i % 2 === 0 ? DRY : FLOOD, sm((T - (t('#timing') + 0.3 + 0.8 * i)) / 0.4));
      return v;
    };
    const AT = 0.2;

    basemap(s);
    c.dim(0.58);
    k.fill('India', { color: '#12395e', alpha: 0.35, border: '#4aa8ff', at: AT });
    k.fill('Assam', { color: '#2b8cff', alpha: 0.3, border: '#9fd8ff', at: AT });          // the flood-blue overlay
    c.glowLine([...SIANG, ...BRAHMAPUTRA.slice(1), ...BANGLADESH.slice(1)], { at: AT, dur: 1.2, color: BLUE, width: 6 });
    c.band(BRAHMAPUTRA, { at: AT, dur: 0, deg: (tt) => level(tt + AT), alpha: (tt) => 0.25 + 0.4 * (level(tt + AT) - DRY) / (FLOOD - DRY), color: '61,165,255', core: '160,220,255' });
    c.ground('ASSAM', { lon: 92.6, lat: 27.55, deg: 0.36, color: '#e9eef5', at: AT, out: t('#timing') });

    // a big dam stores water and lets it go later
    c.dam({ lon: GREAT_BEND[0] - 0.05, lat: GREAT_BEND[1] - 0.95, size: 160, at: t('#store') + 0.3, out: t('#monsoon') - 0.3 });
    k.flow([[95.2, 28.4], [95.3, 28.0], [95.4, 27.7]], { at: t('#store') + 1.4, grow: 1.4, color: '#7cc4ff', width: 7, out: t('#dry') });

    // the dry season: farms, fisheries and river ports feel it first
    k.emoji('🌾', { lon: 94.0, lat: 26.55, size: 150, at: t('#farms'), out: t('#monsoon') - 0.2 });
    k.emoji('🐟', { lon: 92.6, lat: 26.45, size: 150, at: t('#farms') + 0.6, out: t('#monsoon') - 0.2 });
    k.emoji('⚓', { lon: 91.75, lat: 26.05, size: 150, at: t('#farms') + 1.2, out: t('#monsoon') - 0.2 });

    // the monsoon: a surge of released water on top of the rain
    c.band(BRAHMAPUTRA, { at: t('#monsoon') + 0.6, dur: 2.8, deg: 0.55, alpha: 0.55, color: '140,215,255', core: '255,255,255', out: t('#warning') });
    c.glowLine(BRAHMAPUTRA, { at: t('#monsoon') + 0.6, dur: 2.8, color: '#eaf8ff', width: 10, out: t('#warning') });

    // no data from upstream
    k.emoji('📡', { lon: 95.25, lat: 28.55, size: 150, at: t('#warning') + 0.3, out: t('#timing') - 0.2 });
    k.emoji('❓', { lon: 94.1, lat: 27.0, size: 200, at: t('#warning') + 2.4, out: t('#timing') - 0.2 });

    // timing
    k.emoji('⏱️', { lon: 92.9, lat: 27.55, size: 190, at: t('#timing') + 0.2, out: t('#part3') });
    c.ground('TIMING', { lon: 92.8, lat: 25.5, deg: 0.5, color: '#ffd84a', at: t('#timing') + 0.7, out: t('#part3') });

    c.zoomBlur();
    c.tilt();

    k.rain({ at: AT, out: t('#store') + 0.5, density: 0.8 });
    k.rain({ at: t('#monsoon'), out: t('#warning') - 0.2, density: 1 });
    k.tint('#a07a2c', { at: t('#dry') + 0.3, out: t('#monsoon') - 0.2, alpha: 0.28 });          // the dry season: a dull, dusty wash
    c.chip('Sudden release', { lon: 95.4, lat: 27.7, at: t('#monsoon') + 0.4, out: t('#monsoon') + 3.2, size: 38 });
    c.chip('Early warning?', { lon: 94.8, lat: 27.35, at: t('#warning') + 0.7, out: t('#timing') - 0.2, size: 38 });
    c.chip('Data from China', { lon: 95.25, lat: 28.5, at: t('#warning') + 1.5, out: t('#timing') - 0.2, size: 38, dy: -70 });
    c.toggle({ labels: ['DRY SEASON', 'MONSOON'], y: 0.27, size: 46, out: t('#part3'), states: [
      { at: t('#store'), on: 1 }, { at: t('#dry'), on: 0 }, { at: t('#monsoon'), on: 1 },
      { at: t('#timing') + 0.3, on: 0 }, { at: t('#timing') + 1.1, on: 1 }, { at: t('#timing') + 1.9, on: 0 }, { at: t('#timing') + 2.7, on: 1 },
    ] });

    k.grade();
    k.ambient();
    k.vignette();
    k.hook('What if a dam *upstream* hit Assam?', { at: 0.2, out: 3.8 });
    k.twist(t('#monsoon'));
    k.hook("Part 3: *India's response*", { at: t('#part3') + 0.2, out: end, y: 0.17 });
    k.progress();
    k.whatIfCaptions({ size: 64, maxChars: 12 });
  },
};

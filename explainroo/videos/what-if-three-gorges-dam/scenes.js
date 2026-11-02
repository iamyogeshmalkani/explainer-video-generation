// What if the Three Gorges Dam collapsed? A sample of the cinematic camera (lib/cine.js): a dive from the whole of China
// to one dam, a flight along a river, a dive back, a flood that runs to the sea, and a whip back out to the country.
// The river path is stylised (a line through the main cities), not surveyed. Read ../MOTION.md for how each move works.
import { setParallel, basemap, kit } from './lib/kit.js';
import { cinema, cine, routeTimes, loadCloseups } from './lib/cine.js';
import RAW from './closeups.js';

const CLOSEUPS = await loadCloseups(RAW);   // sharp satellite pictures of the dam, the reservoir and the river (scripts/closeup.mjs)

setParallel(32);

const DAM = [111.0037, 30.8231];
// Chongqing to the dam (upstream end first), then the dam to the sea.
const UP = [[106.55, 29.56], [107.4, 29.7], [108.4, 30.8], [109.5, 31.03], [109.88, 31.07], [110.35, 31.04], [110.68, 30.83], DAM];
const DOWN = [DAM, [111.3, 30.7], [111.5, 30.4], [112.2, 30.33], [112.4, 29.73], [113.15, 29.45], [114.3, 30.57], [115.05, 30.2], [116.0, 29.72], [117.05, 30.5], [118.4, 31.35], [118.8, 32.05], [119.45, 32.2], [120.3, 31.95], [120.9, 31.75], [121.5, 31.4], [121.95, 31.5]];
const WUHAN_AT = 6;                       // index of Wuhan in DOWN
const RIVER_TO_WUHAN = [...UP.slice(1), ...DOWN.slice(1, WUHAN_AT + 1)];   // from Chongqing, past the dam, to Wuhan

export default {
  story(s) {
    const t = (m) => s.time(m);
    const MARKS = ['#china', '#dam', '#big', '#wall', '#lake', '#yangtze', '#people', '#breach', '#flood', '#cities', '#shanghai', '#however', '#end'].map(t);

    // ---- flights (never overlapping) -------------------------------------------------------------------------------
    const lakePath = [...UP].reverse().slice(1);                       // from the dam up the reservoir to Chongqing
    const lake = { at: t('#lake') - 0.4, dur: t('#yangtze') - t('#lake') - 0.2 };
    const run = { at: t('#yangtze') - 0.3, dur: t('#breach') - t('#yangtze') - 0.1 };
    const dive2 = { at: t('#breach') - 0.2, dur: 2.0 };
    const flood = { at: t('#flood') + 1.2, dur: t('#shanghai') - t('#flood') - 0.5 };
    const out = { at: t('#however') - 0.4, dur: 2.2 };

    const cam = cinema(s, [
      { lon: 104, lat: 33, span: 50, tilt: 0.3, rotate: 0 },                                              // the whole country
      { at: t('#china') - 0.1, dur: 2.6, lon: DAM[0], lat: DAM[1], span: 0.12, tilt: 0.42, rotate: -22, ease: 'dive' },   // 1. the dive: 400 times closer
      { at: t('#big') - 0.1, dur: t('#wall') - t('#big') - 0.6, lon: 111.001, lat: 30.8195, span: 0.095, tilt: 0.46, rotate: -34, ease: 'inOut' },   // a slow orbit over the dam
      { at: t('#wall') - 0.35, dur: 1.5, lon: 111.0037, lat: 30.8231, span: 0.06, tilt: 0.45, rotate: -48 },
      { ...lake, follow: lakePath, span: 2.2, zoomBy: 0.5, tilt: 0.44, rotate: 'auto' },                              // 2. along the reservoir, the map turning so it runs up the frame
      { ...run, follow: RIVER_TO_WUHAN, span: 3.0, tilt: 0.45, rotate: 'auto' },                         // 3. down the Yangtze
      { ...dive2, lon: DAM[0], lat: DAM[1], span: 0.085, tilt: 0.42, rotate: -20, ease: 'dive' },        // 4. the dive back
      { ...flood, follow: DOWN.slice(1), span: 5, zoomBy: 0.3, tilt: 0.4, rotate: 'auto' },                         // 5. the flood runs to the sea
      { ...out, lon: 106, lat: 33, span: 48, tilt: 0.3, rotate: 0, ease: 'dive' },                        // 6. whip back out to the country
      { at: t('#end') - 3.2, dur: 3.4, lon: 108, lat: 34, span: 56, tilt: 0.28, rotate: 0 },
    ], { beats: MARKS });
    const k = kit(s, cam);
    const c = cine(s, cam);

    // ---- the map and what lies on it -------------------------------------------------------------------------------
    basemap(s);
    c.closeup(CLOSEUPS.river);
    c.closeup(CLOSEUPS.reach);
    c.closeup(CLOSEUPS.dam);
    c.fill('China', { color: '#d7282f', alpha: 0.62, lod: [10, 1.5], at: 0.2 });          // the tint thins out as the camera dives in
    c.ground('CHINA', { lon: 104, lat: 36.5, deg: 5, rotate: 0, lod: [22, 4], at: 0.4 });

    const dam = { lon: DAM[0], lat: DAM[1] };
    c.ground('22,500 MEGAWATTS', { lon: 111.0, lat: 30.7925, deg: 0.0036, rotate: 22, lod: [0.15, 0.4], at: t('#big'), out: t('#lake') - 0.3 });
    c.ground('2.3 KM WALL', { lon: 111.0, lat: 30.801, deg: 0.0027, rotate: 46, lod: [0.1, 0.3], at: t('#wall') + 0.2, out: t('#lake') - 0.2 });

    // the reservoir: a lettered label that the camera slides along
    const lakeTimes = routeTimes([DAM, ...lakePath], { ...lake, pace: s.pace });
    c.ground('RESERVOIR: 600 KM', { lon: 109.75, lat: 31.17, deg: 0.1, rotate: -78, lod: [3, 0.5], at: lakeTimes[4] - 0.3, out: lakeTimes[6] });

    // the river: cyan line that draws itself while the camera runs along it (same path, same timing)
    c.glowLine([...UP, ...DOWN.slice(1, WUHAN_AT + 1)], { at: t('#yangtze') - 0.3, dur: run.dur, ease: 'inOut', color: '#19f0ff', width: 7 });   // route starts at the camera's start
    const runTimes = routeTimes([UP[0], ...RIVER_TO_WUHAN], { ...run, pace: s.pace });
    c.ground('400 MILLION', { lon: 113.8, lat: 30.1, deg: 0.15, rotate: 41, lod: [4, 1], at: runTimes[runTimes.length - 2] - 0.4, out: t('#breach') + 0.4 });

    // the break
    c.pulse({ ...dam, r: 240, at: t('#breach') + 1.4, dur: 1.1 });
    c.blast({ ...dam, r: 360, at: t('#flood') + 0.05, dur: 2.6 });
    c.breach({ ...dam, km: 0.5, at: t('#flood') + 0.25, grow: 1.4 });

    // the flood: a red zone and an orange front that run down the valley with the camera
    c.band(DOWN, { at: flood.at, dur: flood.dur, deg: 0.5, alpha: 0.5 });
    c.glowLine(DOWN, { at: flood.at, dur: flood.dur, ease: 'inOut', color: '#ff7a2a', width: 8 });

    c.zoomBlur();
    c.tilt();

    // ---- screen-fixed callouts (after tilt) ------------------------------------------------------------------------
    c.chip('Three Gorges Dam', { ...dam, size: 40, at: t('#china') + 2.0, out: t('#however') - 0.2 });
    const floodTimes = routeTimes([DAM, ...DOWN.slice(1)], { ...flood, pace: s.pace });
    c.chip('Yichang', { lon: 111.3, lat: 30.7, at: floodTimes[1] - 0.2, out: floodTimes[1] + 0.8, dy: -10 });
    c.chip('Wuhan', { lon: 114.3, lat: 30.57, at: floodTimes[6] - 0.2, out: floodTimes[6] + 0.9 });
    c.chip('Nanjing', { lon: 118.8, lat: 32.05, at: floodTimes[11] - 0.2, out: floodTimes[11] + 0.9 });
    c.chip('Shanghai', { lon: 121.5, lat: 31.4, at: floodTimes[15] - 0.1, out: t('#however') });
    c.swirl({ at: t('#flood') + 0.8, dur: 1.5 });
    c.cut(t('#yangtze') - 0.45);

    // ---- the usual screen layers -----------------------------------------------------------------------------------
    k.grade();
    k.ambient();
    k.vignette();
    k.hook('What if the *Three Gorges Dam* collapsed?', { at: 0.2 });
    k.twist(t('#however'));
    k.progress();
    k.whatIfCaptions({ size: 64, maxChars: 12 });
    s.sfx('whoosh', t('#china') - 0.2, { gain: 0.3 });
  },
};

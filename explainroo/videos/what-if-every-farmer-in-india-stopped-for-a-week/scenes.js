// What if every farmer in India stopped for a week? Parked tractors, half the workforce, godowns that last, fresh food that doesn't, empty mandis, the 2018 protest, spoiling fields (official outline).
import { setParallel, fly, basemap, kit } from './lib/kit.js';
import { frames } from './lib/frames.js';

setParallel(22);

export default {
  story(s) {
    const t = (m) => s.time(m);
    const MARKS = ['#half', '#fresh', '#godown', '#milk', '#mandi', '#strike', '#bigger', '#fields', '#end'].map(t);
    const cam = fly(s, [{ lon: 82.5, lat: 21.5, span: 50 }], { beats: MARKS });
    const k = kit(s, cam);
    const f = frames(s, cam);

    // map beat 1: half of India works on farms, feeding 1.4 billion
    basemap(s);
    const h0 = t('#half'), h1 = t('#fresh') - 0.05;
    k.fill('India', { color: '#2f9e44', alpha: 0.82, border: '#ffffff', at: h0 - 0.1, out: h1, sound: false });
    [[75.3, 30.9], [77.0, 29.0], [80.9, 26.8], [78.0, 23.5], [75.5, 19.5], [78.4, 17.5], [87.5, 23.5], [76.2, 14.8]].forEach(([lon, lat], i) => k.emoji('🌾', { lon, lat, size: 100, at: h0 + 0.4 + i * 0.25, out: h1 }));

    // map beat 2: the 2018 protest across several states, then the whole country
    const s0 = t('#strike'), s1 = t('#bigger') - 0.05, b0 = t('#bigger'), b1 = t('#fields') - 0.05;
    k.fill('India', { color: '#3a5a8a', alpha: 0.5, border: '#ffffff', at: s0 - 0.1, out: b1, sound: false });
    ['Punjab', 'Haryana', 'Madhya Pradesh', 'Rajasthan', 'Maharashtra', 'Uttar Pradesh'].forEach((st, i) => k.fill(st, { color: '#e8590c', alpha: 0.9, border: '#ffffff', at: s0 + 0.5 + i * 0.35, out: b0 + 0.2, sound: i === 0 }));
    k.emoji('🥛', { lon: 72.83, lat: 19.2, size: 110, at: s0 + 3.4, out: s1, cross: true, crossAt: s0 + 4.2 });
    k.emoji('🥦', { lon: 77.2, lat: 28.7, size: 110, at: s0 + 3.8, out: s1, cross: true, crossAt: s0 + 4.6 });
    k.fill('India', { color: '#e03131', alpha: 0.88, border: '#ffffff', at: b0 + 0.2, out: b1, sound: true });
    k.emoji('🥛', { lon: 72.83, lat: 19.2, size: 110, at: b0 + 0.8, out: b1, cross: true, crossAt: b0 + 1.2 });
    k.emoji('🥦', { lon: 77.2, lat: 28.7, size: 110, at: b0 + 0.9, out: b1, cross: true, crossAt: b0 + 1.3 });
    k.emoji('🍎', { lon: 88.36, lat: 22.57, size: 110, at: b0 + 1.0, out: b1, cross: true, crossAt: b0 + 1.4 });
    k.emoji('🥦', { lon: 80.27, lat: 13.08, size: 110, at: b0 + 1.1, out: b1, cross: true, crossAt: b0 + 1.5 });

    k.grade(); k.ambient(); k.credit('@YourChannel'); k.vignette();

    // opening: a farmer, a parked tractor, fields that wait
    f.backdrop('sky', { at: -1, out: h0 - 0.05, sound: false });
    f.emoji('🚜', { x: 0.27, y: 0.55, size: 280, at: 0.2, out: h0 - 0.05, bob: 4 });
    f.emoji('🌾', { x: 0.77, y: 0.55, size: 280, at: 0.5, out: h0 - 0.05, bob: 6 });
    f.person({ x: 0.5, y: 0.93, height: 0.28, mood: 'neutral', hold: 'sign', at: 0.1, from: -0.2, out: h0 - 0.05, outfit: { shirt: '#f08c00', tie: null } });
    f.headline('WHAT IF FARMERS\nSTOPPED A WEEK?', { at: 0, y: 0.095, out: h0 - 0.05, size: 54 });

    f.headline('NEARLY HALF\nOF INDIA FARMS', { at: h0 + 0.2, out: h1, size: 54 });
    f.countUp(0, 1.4, { at: h0 + 1.8, dur: 2.2, out: h1, y: 0.76, size: 130, decimals: 1, suffix: ' BILLION', color: '#ffd23f', sub: 'PEOPLE THEY FEED' });

    // godowns: grain stocks last a while
    const fr = t('#fresh'), go = t('#godown'), mi = t('#milk');
    f.backdrop('shop', { at: fr - 0.1, out: mi - 0.05 });
    f.emoji('🍚', { x: 0.3, y: 0.38, size: 240, at: fr + 0.3, out: mi - 0.05, bob: 6 });
    f.emoji('🌾', { x: 0.7, y: 0.38, size: 240, at: fr + 0.9, out: mi - 0.05, bob: 6 });
    f.emoji('📦', { x: 0.5, y: 0.62, size: 200, at: go + 0.4, out: mi - 0.05 });
    f.banner('GODOWNS ARE FULL', { at: go + 1.0, out: mi - 0.05, x: 0.5, y: 0.76, size: 48, color: '#2f9e44' });
    f.headline('GRAIN LASTS', { at: fr + 0.1, out: mi - 0.05 });

    // fresh things don't wait: milk, vegetables, fruit
    const ma = t('#mandi');
    f.backdrop('sky', { at: mi - 0.1, out: ma - 0.05 });
    f.emojiRow(['🥛', '🥦', '🍎'], { y: 0.34, size: 200, gap: 0.3, stagger: 0.6, at: mi + 0.3, out: ma - 0.05, bob: 6 });
    f.clock({ x: 0.5, y: 0.66, r: 110, at: mi + 1.6, out: ma - 0.05, hoursPerSec: 3, start: 9 });
    f.banner("THEY DON'T WAIT", { at: mi + 2.4, out: ma - 0.05, x: 0.5, y: 0.82, size: 50 });
    f.headline('THE FRESH FOOD\nGOES FIRST', { at: mi + 0.1, out: ma - 0.05, size: 54 });

    // day two: empty mandis, prices jump
    const st = t('#strike');
    f.backdrop('shop', { at: ma - 0.1, out: st - 0.05 });
    f.big('DAY 2', { at: ma + 0.2, out: st - 0.05, y: 0.25, size: 190, color: '#ffffff' });
    f.emoji('📦', { x: 0.3, y: 0.46, size: 160, at: ma + 0.8, out: st - 0.05, cross: true, crossAt: ma + 1.4 });
    f.emoji('📦', { x: 0.7, y: 0.46, size: 160, at: ma + 1.0, out: st - 0.05, cross: true, crossAt: ma + 1.6 });
    f.banner('EMPTY MANDI', { at: ma + 1.6, out: st - 0.05, x: 0.5, y: 0.6, size: 56 });
    f.arrowUp({ x: 0.5, y: 0.76, size: 170, at: ma + 2.3, out: st - 0.05 });
    f.headline('PRICES JUMP', { at: ma + 2.3, out: st - 0.05, y: 0.075, colors: ['#ff6b6b'] });

    // 2018: a ten-day protest in several states (map)
    f.headline('JUNE 2018', { at: s0 + 0.2, out: s1 });
    f.big('10 DAYS', { at: s0 + 1.6, out: s1, y: 0.74, size: 110, sub: 'SEVERAL STATES', color: '#ff922b' });
    f.headline('NATIONWIDE.\nFAR BIGGER.', { at: b0 + 0.2, out: b1, size: 54 });

    // fields: unwatered, unharvested, spoiling
    const fi = t('#fields'), en = t('#end');
    f.backdrop('sky', { at: fi - 0.1, out: en - 0.05 });
    f.emoji('🌾', { x: 0.25, y: 0.42, size: 230, at: fi + 0.2, out: fi + 2.0, bob: 6 });
    f.emoji('🥀', { x: 0.25, y: 0.42, size: 230, at: fi + 2.0, out: en - 0.05, bob: 6 });
    f.emoji('💧', { x: 0.62, y: 0.4, size: 190, at: fi + 0.6, out: en - 0.05, cross: true, crossAt: fi + 1.4 });
    f.emoji('🚜', { x: 0.82, y: 0.4, size: 190, at: fi + 1.2, out: en - 0.05, cross: true, crossAt: fi + 2.0 });
    f.banner('SPOILING', { at: fi + 2.6, out: en - 0.05, x: 0.5, y: 0.64, size: 68 });
    f.headline('THE FIELDS WAIT', { at: fi + 0.1, out: en - 0.05 });

    // closing: before sunrise
    f.backdrop('sky', { at: en - 0.1 });
    f.emoji('🌅', { x: 0.5, y: 0.32, size: 340, at: en + 0.2, bob: 6 });
    f.person({ x: 0.5, y: 0.93, height: 0.28, mood: 'happy', at: en + 0.1, from: -0.2, outfit: { shirt: '#f08c00', tie: null } });
    f.headline('BEFORE\nSUNRISE', { at: en + 0.05, y: 0.095 });

    k.progress();
    k.whatIfCaptions({ size: 64, maxChars: 12, lit: ['farmer', 'farmers', 'farming', 'godowns', 'mandis', 'milk', 'vegetables', 'week', 'strike'] });
    ['#half', '#fresh', '#milk', '#mandi', '#strike', '#bigger', '#fields'].forEach((m) => s.sfx('whoosh', t(m) - 0.3, { gain: 0.2 }));
  },
};

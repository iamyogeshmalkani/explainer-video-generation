// What if every train in India stopped for one day? A station, a train, a clock, and two map beats (the network, then the stall).
import { setParallel, fly, basemap, kit } from './lib/kit.js';
import { frames } from './lib/frames.js';

setParallel(22);

const CITIES = { delhi: [77.2, 28.6], mumbai: [72.83, 18.97], kolkata: [88.36, 22.57], chennai: [80.27, 13.08], bengaluru: [77.59, 12.97] };

export default {
  story(s) {
    const t = (m) => s.time(m);
    const MARKS = ['#people', '#aus', '#stop', '#stations', '#exams', '#freight', '#coal', '#hours', '#end'].map(t);
    const cam = fly(s, [{ lon: 82.5, lat: 21.5, span: 50 }], { beats: MARKS });
    const k = kit(s, cam);
    const f = frames(s, cam);

    // Map beat 1: the network, blue, with lines between the big cities. Map beat 2: it all stalls, red.
    basemap(s);
    k.fill('India', { color: '#2b6cb0', alpha: 0.85, border: '#ffffff', at: t('#people') - 0.1, out: t('#aus') - 0.05, sound: false });
    [[CITIES.delhi, CITIES.mumbai], [CITIES.delhi, CITIES.kolkata], [CITIES.mumbai, CITIES.chennai], [CITIES.kolkata, CITIES.chennai], [CITIES.delhi, CITIES.bengaluru]]
      .forEach(([a, b], i) => k.flow([a, b], { at: t('#people') + 0.4 + i * 0.35, out: t('#aus') - 0.05, color: '#ffe066', width: 7 }));
    Object.values(CITIES).forEach(([lon, lat], i) => k.pin({ lon, lat, at: t('#people') + 0.2 + i * 0.2, out: t('#aus') - 0.05, color: '#ffd23f' }));
    k.fill('India', { color: '#d7282f', alpha: 0.8, border: '#ffffff', at: t('#hours') - 0.1, out: t('#end') - 0.05, sound: false });
    f.bubbles(f.scatter('India', 20, 4), { text: 'STOP', at: t('#hours') + 0.3, gap: 0.12, out: t('#end') - 0.05, size: 22 });

    k.grade(); k.ambient(); k.credit('@YourChannel'); k.vignette();

    const station = (a, o) => { f.backdrop('station', { at: a, out: o, sound: a > 0 }); f.train({ x: 0.02, y: 0.93, size: 0.9, coaches: 3, at: a, out: o, sound: false }); };

    // opening: an empty station, a clock that races, a person with a ticket
    station(-1, t('#people') - 0.05);
    f.clock({ x: 0.8, y: 0.3, r: 110, at: 0.2, out: t('#people') - 0.05, hoursPerSec: 6, start: 8 });
    f.person({ x: 0.5, y: 0.77, height: 0.27, hold: 'ticket', mood: 'shock', at: 0.1, from: -0.2, out: t('#people') - 0.05 });
    f.headline('WHAT IF\nTRAINS STOPPED?', { at: 0, y: 0.095, out: t('#people') - 0.05 });

    // 20 million a day
    f.big('20 MILLION', { at: t('#people') + 0.4, out: t('#aus') - 0.05, y: 0.28, size: 170, sub: 'PASSENGERS EVERY DAY' });

    // the same as Australia
    f.backdrop('sky', { at: t('#aus') - 0.1, out: t('#stop') - 0.05 });
    f.emoji('🚆', { x: 0.22, y: 0.45, size: 250, at: t('#aus') + 0.1, out: t('#stop') - 0.05, bob: 6 });
    f.big('≈', { at: t('#aus') + 0.6, out: t('#stop') - 0.05, x: 0.5, y: 0.45, size: 300, color: '#ffffff' });
    f.emoji('🇦🇺', { x: 0.78, y: 0.45, size: 250, at: t('#aus') + 1.2, out: t('#stop') - 0.05, bob: 6 });
    f.emojiRow(['🧍', '🧍‍♀️', '🧍‍♂️', '🧍', '🧍‍♀️'], { y: 0.7, size: 130, gap: 0.17, stagger: 0.25, at: t('#aus') + 1.5, out: t('#stop') - 0.05 });
    f.headline('NEARLY ALL OF AUSTRALIA', { at: t('#aus') + 0.1, out: t('#stop') - 0.05, size: 54 });

    // workers cannot get to work
    station(t('#stop') - 0.1, t('#stations') - 0.05);
    f.banner('ALL TRAINS CANCELLED', { at: t('#stop') + 0.3, out: t('#stations') - 0.05, x: 0.5, y: 0.36, size: 54 });
    f.emoji('🏢', { x: 0.82, y: 0.2, size: 170, at: t('#stop') + 1.0, out: t('#stations') - 0.05, cross: true, crossAt: t('#stop') + 1.8 });
    f.person({ x: 0.45, y: 0.77, height: 0.27, mood: 'worried', at: t('#stop') + 0.2, from: -0.2, out: t('#stations') - 0.05, outfit: { shirt: '#9ec5ee' } });
    f.headline('CAN\'T REACH WORK', { at: t('#stop') + 0.15, y: 0.095, out: t('#stations') - 0.05 });

    // stranded travellers
    station(t('#stations') - 0.1, t('#exams') - 0.05);
    f.queue({ y: 0.7, items: ['🧍', '🧳', '🧍‍♀️', '🧍‍♂️'], n: 7, at: t('#stations') + 0.2, gap: 0.22, x0: 0.14, size: 150, out: t('#exams') - 0.05 });
    f.headline('STRANDED', { at: t('#stations') + 0.1, y: 0.095, out: t('#exams') - 0.05 });

    // exams
    f.backdrop('sky', { at: t('#exams') - 0.1, out: t('#freight') - 0.05 });
    f.emoji('📝', { x: 0.5, y: 0.42, size: 300, at: t('#exams') + 0.1, out: t('#freight') - 0.05, cross: true, crossAt: t('#exams') + 0.9, bob: 6 });
    f.headline('MISSED EXAMS', { at: t('#exams') + 0.05, out: t('#freight') - 0.05 });

    // freight: coal, grain, fertiliser, fuel
    f.backdrop('sky', { at: t('#freight') - 0.1, out: t('#coal') - 0.05 });
    f.train({ x: -0.3, y: 0.62, size: 1.0, coaches: 3, at: t('#freight') + 0.1, to: { x: 0.12 }, dur: 1.4, moveAt: t('#freight') + 0.2, out: t('#coal') - 0.05 });
    f.emojiRow(['🪨', '🌾', '🧪', '⛽'], { y: 0.3, size: 170, gap: 0.22, stagger: 0.5, at: t('#freight') + 1.0, out: t('#coal') - 0.05, bob: 6 });
    f.headline('FREIGHT KEEPS US GOING', { at: t('#freight') + 0.1, out: t('#coal') - 0.05, size: 54 });

    // power plants and coal wagons
    f.backdrop('sky', { at: t('#coal') - 0.1, out: t('#hours') - 0.05 });
    f.emoji('🏭', { x: 0.3, y: 0.42, size: 280, at: t('#coal') + 0.1, out: t('#hours') - 0.05 });
    f.emoji('🪨', { x: 0.12, y: 0.65, size: 150, at: t('#coal') + 0.5, to: { x: 0.28 }, dur: 1.4, moveAt: t('#coal') + 0.7, out: t('#hours') - 0.05 });
    f.emoji('💡', { x: 0.74, y: 0.42, size: 280, at: t('#coal') + 1.0, out: t('#hours') - 0.05, cross: true, crossAt: t('#coal') + 2.0, bob: 6 });
    f.headline('POWER NEEDS COAL', { at: t('#coal') + 0.1, out: t('#hours') - 0.05 });
    f.clock({ x: 0.82, y: 0.15, r: 70, at: t('#hours') + 0.2, out: t('#end') - 0.05, hoursPerSec: 6, start: 6 });

    // closing
    station(t('#end') - 0.1);
    f.person({ x: 0.5, y: 0.77, height: 0.27, hold: 'ticket', mood: 'worried', at: t('#end') + 0.1, from: 1.2 });
    f.headline('THE COUNTRY\nRUNS ON TRACKS', { at: t('#end') + 0.05, y: 0.095 });

    k.progress();
    k.whatIfCaptions({ size: 64, maxChars: 12, lit: ['million', 'australia', 'coal', 'exams', 'tracks', 'hours'] });
    [t('#people'), t('#aus'), t('#stop'), t('#freight'), t('#hours')].forEach((m) => s.sfx('whoosh', m - 0.3, { gain: 0.2 }));
  },
};

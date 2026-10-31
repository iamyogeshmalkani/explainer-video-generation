// What if India had two time zones? A clock that splits, the sun reaching Assam first, garden time, Russia 11 zones vs China 1, timetable trouble (official outline).
import { setParallel, fly, basemap, kit } from './lib/kit.js';
import { frames } from './lib/frames.js';

setParallel(22);

const NE = ['Assam', 'Arunachal Pradesh', 'Nagaland', 'Manipur', 'Mizoram', 'Tripura', 'Meghalaya'];

export default {
  story(s) {
    const t = (m) => s.time(m);
    const MARKS = ['#one', '#assam', '#two', '#russia', '#costs', '#danger', '#end'].map(t);
    const cam = fly(s, [{ lon: 82.5, lat: 21.5, span: 50 }], { beats: MARKS });
    const k = kit(s, cam);
    const f = frames(s, cam);

    // map beat 1: nearly 3,000 km wide; the sun reaches the northeast almost two hours before Gujarat
    basemap(s);
    const a0 = t('#one'), a1 = t('#assam') - 0.05;
    k.fill('India', { color: '#1c7ed6', alpha: 0.8, border: '#ffffff', at: a0 - 0.1, out: a1, sound: false });
    k.flow([[68.6, 21.5], [97.2, 21.5]], { at: a0 + 0.3, out: a1, color: '#ffe066', width: 9 });
    k.emoji('🌙', { lon: 70.2, lat: 23.2, size: 130, at: a0 + 0.8, out: a0 + 5.4 });
    k.emoji('☀️', { lon: 94.6, lat: 27.4, size: 130, at: a0 + 0.8, out: a1 });
    k.emoji('☀️', { lon: 70.2, lat: 23.2, size: 130, at: a0 + 5.5, out: a1 });
    k.label('GUJARAT', { lon: 71.4, lat: 22.2, at: a0 + 1.0, out: a1, dy: 90, size: 34 });
    k.label('NORTHEAST', { lon: 94.4, lat: 26.2, at: a0 + 1.0, out: a1, dy: 110, size: 34 });

    // map beat 2: two zones (the northeast on its own clock)
    const b0 = t('#two'), b1 = t('#russia') - 0.05;
    k.fill('India', { color: '#1c7ed6', alpha: 0.8, border: '#ffffff', at: b0 - 0.1, out: b1, sound: false });
    k.fill(NE, { color: '#f08c00', alpha: 0.92, border: '#ffffff', at: b0 + 0.6, out: b1, sound: true });
    k.emoji('💡', { lon: 79.5, lat: 23, size: 150, at: b0 + 2.4, out: b1 });
    k.emoji('⏰', { lon: 93.5, lat: 25.6, size: 100, at: b0 + 1.0, out: b1 });
    k.emoji('⏰', { lon: 76, lat: 20, size: 100, at: b0 + 1.3, out: b1 });

    k.grade(); k.ambient(); k.credit('@YourChannel'); k.vignette();

    // opening: one big clock that splits into two
    f.backdrop('sky', { at: -1, out: a0 - 0.05, sound: false });
    f.clock({ x: 0.5, y: 0.4, r: 200, at: 0, out: a0 - 0.05, hoursPerSec: 0.8, start: 9 });
    f.person({ x: 0.5, y: 0.93, height: 0.26, mood: 'neutral', at: 0.1, from: -0.2, out: a0 - 0.05 });
    f.headline('WHAT IF INDIA HAD\nTWO TIME ZONES?', { at: 0, y: 0.095, out: a0 - 0.05, size: 54 });

    f.headline('ONE CLOCK.\nONE HUGE COUNTRY.', { at: a0 + 0.2, out: a1, size: 50 });
    f.big('3,000 KM', { at: a0 + 0.8, out: a0 + 5.4, y: 0.7, size: 120, sub: 'EAST TO WEST' });
    f.big('~2 HOURS', { at: a0 + 5.6, out: a1, y: 0.7, size: 120, sub: 'SUN COMES EARLIER IN THE EAST' });

    // Assam: bright before five, offices still shut, tea gardens run their own clock
    const as = t('#assam');
    f.backdrop('sky', { at: as - 0.1, out: b0 - 0.05 });
    f.emoji('🌅', { x: 0.5, y: 0.3, size: 330, at: as + 0.2, out: b0 - 0.05, bob: 6 });
    f.big('5 AM', { at: as + 1.0, out: as + 3.4, y: 0.58, size: 190, sub: 'ALREADY BRIGHT' });
    f.emoji('🏢', { x: 0.3, y: 0.58, size: 230, at: as + 3.4, out: b0 - 0.05 });
    f.banner('CLOSED', { at: as + 4.0, out: b0 - 0.05, x: 0.3, y: 0.78, size: 54 });
    f.emoji('🍵', { x: 0.72, y: 0.58, size: 230, at: as + 5.2, out: b0 - 0.05, bob: 6 });
    f.banner('GARDEN TIME +1 HR', { at: as + 5.9, out: b0 - 0.05, x: 0.6, y: 0.78, size: 38, color: '#2f9e44' });
    f.headline('ASSAM MORNINGS', { at: as + 0.1, out: b0 - 0.05 });

    // map beat 2 labels
    f.headline('TWO ZONES?', { at: b0 + 0.2, out: b1 });
    f.banner('MORE DAYLIGHT', { at: b0 + 3.0, out: b1, x: 0.5, y: 0.72, size: 50, color: '#2f9e44' });

    // Russia 11 zones, China 1
    const ru = t('#russia');
    f.backdrop('sky', { at: ru - 0.1, out: t('#costs') - 0.05 });
    f.bars({ rows: [{ label: 'RUSSIA', value: 11, color: '#e03131', emoji: '🇷🇺' }, { label: 'INDIA', value: 1, color: '#1c7ed6', emoji: '🇮🇳' }, { label: 'CHINA', value: 1, color: '#f08c00', emoji: '🇨🇳' }], at: ru + 0.2, out: t('#costs') - 0.05, y: 0.74, h: 0.46, stagger: 0.8 });
    f.headline('TIME ZONES', { at: ru + 0.1, out: t('#costs') - 0.05 });

    // costs: timetables, flights, banks, exams
    const co = t('#costs'), da = t('#danger'), en = t('#end');
    f.backdrop('station', { at: co - 0.1, out: da - 0.05 });
    f.clock({ x: 0.27, y: 0.3, r: 110, at: co + 0.3, out: da - 0.05, hoursPerSec: 0.01, start: 9 });
    f.clock({ x: 0.73, y: 0.3, r: 110, at: co + 0.6, out: da - 0.05, hoursPerSec: 0.01, start: 10 });
    f.banner('≠', { at: co + 1.2, out: da - 0.05, x: 0.5, y: 0.3, size: 110, color: '#d7282f', rot: 0 });
    f.train({ x: 0.2, y: 0.84, at: co + 0.4, out: da - 0.05, to: { x: 0.55 }, dur: 2.6, moveAt: co + 0.6 });
    f.emojiRow(['✈️', '🏦', '📝'], { y: 0.56, size: 150, gap: 0.28, stagger: 0.55, at: co + 3.2, out: da - 0.05, bob: 6 });
    f.headline('TWO CLOCKS.\nONE TIMETABLE.', { at: co + 0.1, out: da - 0.05, size: 54 });

    // single-line track danger
    f.backdrop('station', { at: da - 0.1, out: en - 0.05 });
    f.emoji('⚠️', { x: 0.5, y: 0.34, size: 280, at: da + 0.3, out: en - 0.05, bob: 8 });
    f.emoji('🚆', { x: 0.12, y: 0.62, size: 190, at: da + 0.5, out: en - 0.05, to: { x: 0.36 }, dur: 2.4, moveAt: da + 0.7 });
    f.emoji('🚆', { x: 0.88, y: 0.62, size: 190, flip: true, at: da + 0.9, out: en - 0.05, to: { x: 0.64 }, dur: 2.4, moveAt: da + 1.1 });
    f.banner('DANGER', { at: da + 1.8, out: en - 0.05, x: 0.5, y: 0.78, size: 64 });
    f.headline('CONFUSED CLOCK', { at: da + 0.1, out: en - 0.05 });

    // closing: one clock, one minute
    f.backdrop('sky', { at: en - 0.1 });
    f.clock({ x: 0.5, y: 0.4, r: 200, at: en, hoursPerSec: 0.5, start: 9 });
    f.person({ x: 0.5, y: 0.93, height: 0.26, mood: 'happy', at: en + 0.1, from: -0.2 });
    f.headline('ONE CLOCK.\nONE MINUTE.', { at: en + 0.05, y: 0.095 });

    k.progress();
    k.whatIfCaptions({ size: 64, maxChars: 12, lit: ['time', 'zones', 'clock', 'assam', 'gujarat', 'russia', 'china', 'eleven'] });
    ['#one', '#assam', '#two', '#russia', '#costs', '#danger'].forEach((m) => s.sfx('whoosh', t(m) - 0.3, { gain: 0.2 }));
  },
};

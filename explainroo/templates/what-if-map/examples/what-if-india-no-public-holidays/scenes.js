// What if India cancelled every public holiday for a year? A calendar crossed out, 3 national holidays and 15 to 25 days off, five extra weeks, festivals on the map, Diwali sales, migrants going home.
import { setParallel, fly, basemap, kit } from './lib/kit.js';
import { frames } from './lib/frames.js';

setParallel(22);

export default {
  story(s) {
    const t = (m) => s.time(m);
    const MARKS = ['#p1', '#p2', '#p3', '#p4', '#p5', '#end'].map(t);
    const [p1, p2, p3, p4, p5, end] = MARKS;
    const cam = fly(s, [{ lon: 82.5, lat: 21.5, span: 50 }], { beats: MARKS });
    const k = kit(s, cam);
    const f = frames(s, cam);
    const sky = (a, b) => f.backdrop('sky', { at: a - 0.1, out: b - 0.05 });

    // map beat: festivals do not wait for permission (official outline)
    basemap(s);
    k.fill('India', { color: '#e8590c', alpha: 0.82, border: '#ffffff', at: p3 - 0.1, out: p4 - 0.05, sound: false });
    [['🪔', 77.2, 28.6], ['🌙', 78.5, 17.4], ['🎨', 77.7, 27.5], ['🎄', 74.1, 15.4], ['🌾', 78.1, 10.8]].forEach(([c, lon, lat], i) =>
      k.emoji(c, { lon, lat, size: 110, at: p3 + 0.8 + i * 0.7, out: p4 - 0.05 }));
    f.banner('NOT TURNING UP', { at: p3 + 5.0, out: p4 - 0.05, x: 0.5, y: 0.76, size: 60 });
    f.headline("FESTIVALS DON'T WAIT", { at: p3 + 0.2, out: p4 - 0.05, y: 0.075, size: 46 });

    k.grade(); k.ambient(); k.credit('@YourChannel'); k.vignette();

    // opening: a calendar with its red days crossed out
    f.backdrop('sky', { at: -1, out: p1 - 0.05, sound: false });
    f.emoji('📅', { x: 0.5, y: 0.4, size: 290, at: 0.2, out: p1 - 0.05, cross: true, crossAt: 1.6 });
    f.headline('WHAT IF NO\nPUBLIC HOLIDAYS?', { at: 0, y: 0.095, out: p1 - 0.05 });

    // 3 national holidays, 15 to 25 days off
    sky(p1, p2);
    f.big('3', { at: p1 + 0.3, out: p1 + 4.2, y: 0.3, size: 240, color: '#ffffff', sub: 'NATIONAL HOLIDAYS' });
    f.big('15-25', { at: p1 + 4.4, out: p2 - 0.05, y: 0.3, size: 200, color: '#ffd23f', sub: 'DAYS OFF A YEAR' });
    f.emoji('🏖️', { x: 0.5, y: 0.64, size: 220, at: p1 + 4.8, out: p2 - 0.05, bob: 6 });
    f.headline('HOLIDAYS TODAY', { at: p1 + 0.1, out: p2 - 0.05 });

    // 3 to 5 extra weeks
    sky(p2, p3);
    f.big('+3 TO 5', { at: p2 + 0.3, out: p3 - 0.05, y: 0.32, size: 190, color: '#51cf66', sub: 'WEEKS OF WORK' });
    f.emoji('💼', { x: 0.5, y: 0.64, size: 200, at: p2 + 1.8, out: p3 - 0.05, bob: 6 });
    f.headline('MORE WORK DAYS', { at: p2 + 0.1, out: p3 - 0.05 });

    // Diwali: some shops gain
    f.backdrop('shop', { at: p4 - 0.1, out: p5 - 0.05 });
    f.emoji('🪔', { x: 0.5, y: 0.3, size: 250, at: p4 + 0.4, out: p5 - 0.05, bob: 6 });
    f.banner('BIGGEST SELLING SEASON', { at: p4 + 2.2, out: p5 - 0.05, x: 0.5, y: 0.6, size: 40, color: '#2f9e44' });
    f.headline('SOME SHOPS GAIN', { at: p4 + 0.1, out: p5 - 0.05 });

    // migrants going home
    f.backdrop('station', { at: p5 - 0.1, out: end - 0.05 });
    f.person({ x: 0.3, y: 0.92, height: 0.26, hold: 'ticket', mood: 'worried', at: p5 + 0.3, from: -0.2, out: end - 0.05 });
    f.emoji('🏠', { x: 0.72, y: 0.4, size: 220, at: p5 + 1.2, out: end - 0.05, bob: 6 });
    f.banner('JOB OR FAMILY?', { at: p5 + 3.2, out: end - 0.05, x: 0.5, y: 0.62, size: 60 });
    f.headline('GOING HOME', { at: p5 + 0.1, out: end - 0.05 });

    // closing
    f.backdrop('sky', { at: end - 0.1 });
    f.emojiRow(['🪔', '🎄', '🌙'], { y: 0.42, size: 190, gap: 0.3, stagger: 0.6, at: end + 0.5, bob: 6 });
    f.headline('ONE DAY THE WHOLE\nCOUNTRY RESTS', { at: end + 0.05, y: 0.095, size: 50 });
    f.person({ x: 0.5, y: 0.93, height: 0.26, hold: 'sign', mood: 'happy', at: end + 0.1, from: -0.2 });

    k.progress();
    k.whatIfCaptions({ size: 64, maxChars: 12, lit: ['three', 'holidays', 'diwali', 'eid', 'holi', 'christmas', 'pongal', 'weeks'] });
    [p1, p2, p3, p4, p5].forEach((m) => s.sfx('whoosh', m - 0.3, { gain: 0.2 }));
  },
};

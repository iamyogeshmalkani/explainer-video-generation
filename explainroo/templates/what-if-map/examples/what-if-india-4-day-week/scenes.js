// What if India worked a 4-day week? A calendar with Friday crossed out, the UK and Iceland trials, the 9 in 10 the law would not reach, longer weekends, more shifts.
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

    // map beat: 9 in 10 workers are informal, so a four-day law would not reach them (official outline)
    basemap(s);
    k.fill('India', { color: '#e8590c', alpha: 0.82, border: '#ffffff', at: p3 - 0.1, out: p4 - 0.05, sound: false });
    f.swarm('India', { n: 900, at: p3 + 0.4, dur: 1.8, out: p4 - 0.05, icon: 'coin', size: 7, color: '#ffd23f', seed: 6 });
    f.swarm('India', { n: 100, at: p3 + 2.8, dur: 1.2, out: p4 - 0.05, icon: 'coin', size: 8, color: '#ffffff', seed: 13 });
    k.emoji('🌾', { lon: 79.0, lat: 21.0, size: 110, at: p3 + 4.6, out: p4 - 0.05 });
    k.emoji('🛒', { lon: 77.2, lat: 28.6, size: 110, at: p3 + 5.4, out: p4 - 0.05 });

    k.grade(); k.ambient(); k.credit('@YourChannel'); k.vignette();

    // opening: a calendar with Friday crossed out
    f.backdrop('sky', { at: -1, out: p1 - 0.05, sound: false });
    ['MON', 'TUE', 'WED', 'THU', 'FRI'].forEach((d, i) => f.banner(d, { at: 0.2 + i * 0.12, out: p1 - 0.05, x: 0.5, y: 0.26 + i * 0.09, size: 42, color: i === 4 ? '#d7282f' : '#1c7ed6', rot: 0, sound: i === 0 }));
    f.cross({ x: 0.5, y: 0.62, size: 120, at: 1.3, out: p1 - 0.05 });
    f.person({ x: 0.8, y: 0.93, height: 0.26, mood: 'happy', at: 0.2, from: 1.2, out: p1 - 0.05 });
    f.headline('WHAT IF INDIA\nWORKED 4 DAYS?', { at: 0, y: 0.095, out: p1 - 0.05 });

    // six days a week today
    sky(p1, p2);
    f.big('6 DAYS', { at: p1 + 0.3, out: p2 - 0.05, y: 0.3, size: 200, color: '#ff6b6b', sub: 'A WEEK' });
    f.emoji('😩', { x: 0.5, y: 0.64, size: 220, at: p1 + 2.4, out: p2 - 0.05, bob: 6 });
    f.headline('LONG WEEKS', { at: p1 + 0.1, out: p2 - 0.05 });

    // the UK and Iceland trials
    sky(p2, p3);
    f.banner('UK', { at: p2 + 0.4, out: p3 - 0.05, x: 0.3, y: 0.3, size: 70, color: '#1c7ed6' });
    f.banner('ICELAND', { at: p2 + 1.2, out: p3 - 0.05, x: 0.7, y: 0.3, size: 56, color: '#1c7ed6' });
    f.emojiRow(['✅', '📈'], { y: 0.52, size: 190, gap: 0.3, stagger: 0.8, at: p2 + 3.0, out: p3 - 0.05, bob: 6 });
    f.emoji('😌', { x: 0.5, y: 0.72, size: 190, at: p2 + 5.2, out: p3 - 0.05, bob: 6 });
    f.headline('THE TRIALS', { at: p2 + 0.1, out: p3 - 0.05 });

    f.headline('9 IN 10 ARE INFORMAL', { at: p3 + 0.2, out: p4 - 0.05, y: 0.075, size: 46 });
    f.banner('NOT REACHED', { at: p3 + 7.0, out: p4 - 0.05, x: 0.5, y: 0.74, size: 70 });

    // office workers
    sky(p4, p5);
    f.emojiRow(['🏖️', '🛣️', '🧳'], { y: 0.38, size: 180, gap: 0.3, stagger: 0.9, at: p4 + 0.6, out: p5 - 0.05, bob: 6 });
    f.headline('LONGER WEEKENDS', { at: p4 + 0.1, out: p5 - 0.05 });

    // shifts and hires
    f.backdrop('street', { at: p5 - 0.1, out: end - 0.05 });
    f.emojiRow(['🏭', '🏪', '🏥'], { y: 0.34, size: 150, gap: 0.26, stagger: 0.7, at: p5 + 0.5, out: end - 0.05, bob: 5 });
    f.big('+ SHIFTS', { at: p5 + 3.0, out: end - 0.05, y: 0.58, size: 150, color: '#ffd23f' });
    f.person({ x: 0.5, y: 0.93, height: 0.22, mood: 'happy', at: p5 + 1.0, from: -0.2, out: end - 0.05, outfit: { vest: true, shirt: '#ff922b', tie: null } });
    f.headline('MORE HIRES', { at: p5 + 0.1, out: end - 0.05 });

    // closing
    f.backdrop('sky', { at: end - 0.1 });
    f.big('4 DAYS', { at: end + 0.4, y: 0.4, size: 220, color: '#ffffff', sub: 'SAME OUTPUT?' });
    f.emoji('😌', { x: 0.5, y: 0.68, size: 220, at: end + 1.6, bob: 6 });
    f.headline('MORE REST,\nSAME PAY', { at: end + 0.05, y: 0.095 });

    k.progress();
    k.whatIfCaptions({ size: 64, maxChars: 12, lit: ['four', 'six', 'iceland', 'burnout', 'informal', 'shifts', 'hires'] });
    [p1, p2, p3, p4, p5].forEach((m) => s.sfx('whoosh', m - 0.3, { gain: 0.2 }));
  },
};

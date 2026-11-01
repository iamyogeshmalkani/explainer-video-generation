// What if voting in India was compulsory? 66% turnout, Australia above 90%, the people parties would have to reach, migrants and fines, and NOTA.
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

    // map beat: the voters parties would have to reach (official outline)
    basemap(s);
    k.fill('India', { color: '#5f3dc4', alpha: 0.8, border: '#ffffff', at: p3 - 0.1, out: p4 - 0.05, sound: false });
    k.emoji('🏙️', { lon: 77.2, lat: 28.6, size: 120, at: p3 + 1.6, out: p4 - 0.05 });
    k.emoji('🎓', { lon: 77.6, lat: 13.0, size: 120, at: p3 + 3.6, out: p4 - 0.05 });
    k.emoji('🧳', { lon: 85.1, lat: 25.6, size: 120, at: p3 + 5.6, out: p4 - 0.05 });
    f.swarm('India', { n: 700, at: p3 + 0.3, dur: 1.4, out: p4 - 0.05, icon: 'coin', size: 7, color: '#ffffff', seed: 3 });

    k.grade(); k.ambient(); k.credit('@YourChannel'); k.vignette();

    // opening: a ballot box that is now the law
    f.backdrop('sky', { at: -1, out: p1 - 0.05, sound: false });
    f.emoji('🗳️', { x: 0.5, y: 0.38, size: 270, at: 0.2, out: p1 - 0.05, bob: 6 });
    f.banner('COMPULSORY', { at: 1.2, out: p1 - 0.05, x: 0.5, y: 0.62, size: 70 });
    f.headline('WHAT IF VOTING\nWAS THE LAW?', { at: 0, y: 0.095, out: p1 - 0.05 });

    // 66% turned out, 30 crore stayed home
    sky(p1, p2);
    f.big('66%', { at: p1 + 0.3, out: p1 + 4.4, y: 0.3, size: 220, color: '#ffffff', sub: 'TURNED OUT IN 2024' });
    f.big('30 CRORE', { at: p1 + 4.6, out: p2 - 0.05, y: 0.3, size: 170, color: '#ffd23f', sub: 'STAYED HOME' });
    f.emoji('🏠', { x: 0.5, y: 0.64, size: 220, at: p1 + 5.0, out: p2 - 0.05, bob: 6 });
    f.headline('THE 2024 ELECTION', { at: p1 + 0.1, out: p2 - 0.05 });

    // Australia
    sky(p2, p3);
    f.bars({ rows: [{ label: 'INDIA', value: 66, color: '#f2a516', text: '66%' }, { label: 'AUSTRALIA', value: 90, color: '#2f9e44', text: '90%+', emoji: '🦘' }], at: p2 + 0.4, out: p3 - 0.05, y: 0.78, h: 0.4, w: 0.7, stagger: 0.8 });
    f.headline('COMPULSORY ELSEWHERE', { at: p2 + 0.1, out: p3 - 0.05, size: 50 });

    f.headline('THE ONES WHO STAY HOME', { at: p3 + 0.2, out: p4 - 0.05, y: 0.075, size: 46 });

    // migrants and fines
    f.backdrop('street', { at: p4 - 0.1, out: p5 - 0.05 });
    f.emoji('🧳', { x: 0.25, y: 0.4, size: 220, at: p4 + 0.5, out: p5 - 0.05, bob: 6 });
    f.emoji('🗳️', { x: 0.75, y: 0.4, size: 220, at: p4 + 1.2, out: p5 - 0.05, bob: 6 });
    f.banner('FAR FROM HOME', { at: p4 + 2.4, out: p5 - 0.05, x: 0.5, y: 0.6, size: 60 });
    f.emoji('💸', { x: 0.5, y: 0.76, size: 150, at: p4 + 4.6, out: p5 - 0.05, bob: 6 });
    f.headline('MIGRANTS AND FINES', { at: p4 + 0.1, out: p5 - 0.05 });

    // NOTA
    sky(p5, end);
    f.emoji('🤷', { x: 0.5, y: 0.36, size: 250, at: p5 + 0.5, out: end - 0.05, bob: 6 });
    f.banner('NOTA', { at: p5 + 3.8, out: end - 0.05, x: 0.5, y: 0.62, size: 90, color: '#1c7ed6' });
    f.headline('IS STAYING HOME\nA CHOICE?', { at: p5 + 0.1, out: end - 0.05, y: 0.095, size: 54 });

    // closing
    f.backdrop('sky', { at: end - 0.1 });
    f.emoji('🗳️', { x: 0.3, y: 0.42, size: 230, at: end + 0.3, bob: 6 });
    f.emoji('⚖️', { x: 0.7, y: 0.42, size: 230, at: end + 1.2, bob: 6 });
    f.headline('A RIGHT\nOR A DUTY?', { at: end + 0.05, y: 0.095 });
    f.person({ x: 0.5, y: 0.93, height: 0.26, hold: 'sign', mood: 'worried', at: end + 0.1, from: -0.2 });

    k.progress();
    k.whatIfCaptions({ size: 64, maxChars: 12, lit: ['66', 'crore', 'australia', '90', 'migrants', 'nota', 'vote'] });
    [p1, p2, p3, p4, p5].forEach((m) => s.sfx('whoosh', m - 0.3, { gain: 0.2 }));
  },
};

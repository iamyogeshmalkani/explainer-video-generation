// What if every school in India taught in one language? 22 vs 121 languages, a child at the board, mother-tongue research, one shared language, the 1965 protests.
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
    const kid = { shirt: '#ffd23f', tie: null, pants: '#364fc7' };

    // map beat: one shared language lets a student move anywhere (official outline)
    basemap(s);
    k.fill('India', { color: '#1c7ed6', alpha: 0.8, border: '#ffffff', at: p4 - 0.1, out: p5 - 0.05, sound: false });
    k.flow([[78.1, 10.8], [78.0, 17.0], [77.5, 23.0], [77.2, 28.5]], { at: p4 + 0.5, out: p5 - 0.05, color: '#ffe066', width: 10 });
    k.emoji('🎒', { lon: 78.1, lat: 10.8, size: 120, at: p4 + 0.6, out: p5 - 0.05 });
    k.emoji('📘', { lon: 77.2, lat: 28.6, size: 120, at: p4 + 2.4, out: p5 - 0.05 });

    k.grade(); k.ambient(); k.credit('@YourChannel'); k.vignette();

    // opening: a school and one language
    f.backdrop('sky', { at: -1, out: p1 - 0.05, sound: false });
    f.emoji('🏫', { x: 0.5, y: 0.38, size: 280, at: 0.2, out: p1 - 0.05, bob: 6 });
    f.emoji('📚', { x: 0.5, y: 0.62, size: 170, at: 1.2, out: p1 - 0.05, bob: 6 });
    f.headline('ONE LANGUAGE\nIN EVERY SCHOOL?', { at: 0, y: 0.095, out: p1 - 0.05 });

    // 22 official, 121 spoken
    sky(p1, p2);
    f.big('22', { at: p1 + 0.3, out: p1 + 4.2, y: 0.28, size: 240, color: '#ffffff', sub: 'OFFICIAL LANGUAGES' });
    f.big('121', { at: p1 + 4.5, out: p2 - 0.05, y: 0.28, size: 240, color: '#ffd23f', sub: 'SPOKEN BY 10,000+' });
    f.emoji('🗣️', { x: 0.5, y: 0.64, size: 200, at: p1 + 5.0, out: p2 - 0.05, bob: 6 });
    f.headline('INDIA TALKS A LOT', { at: p1 + 0.1, out: p2 - 0.05 });

    // a child who does not know the language
    sky(p2, p3);
    ['SANTALI', 'TULU', 'BHOJPURI'].forEach((n, i) => f.banner(n, { at: p2 + 0.6 + i * 0.9, out: p3 - 0.05, x: 0.5, y: 0.22 + i * 0.12, size: 52, color: ['#7048e8', '#0c8599', '#e8590c'][i], rot: i % 2 ? 3 : -3, sound: i === 0 }));
    f.person({ x: 0.3, y: 0.92, height: 0.26, mood: 'shock', at: p2 + 4.0, from: -0.2, out: p3 - 0.05, outfit: kid });
    f.speech('???', { x: 0.68, y: 0.7, size: 100, tail: 'left', at: p2 + 5.4, out: p3 - 0.05 });
    f.headline('A CLASS IN\nA NEW LANGUAGE', { at: p2 + 0.1, out: p3 - 0.05, y: 0.095, size: 54 });

    // research says home language first
    sky(p3, p4);
    f.banner('HOME LANGUAGE', { at: p3 + 0.8, out: p3 + 6.6, x: 0.5, y: 0.3, size: 66, color: '#2f9e44' });
    f.emoji('📈', { x: 0.5, y: 0.58, size: 240, at: p3 + 2.8, out: p3 + 6.6, bob: 6 });
    f.big('CLASS 5', { at: p3 + 6.8, out: p4 - 0.05, y: 0.34, size: 200, color: '#ffd23f', sub: 'MOTHER TONGUE' });
    f.headline('LEARN BEST AT HOME', { at: p3 + 0.1, out: p4 - 0.05, size: 52 });

    f.headline('STUDY ANYWHERE', { at: p4 + 0.2, out: p5 - 0.05, y: 0.075 });
    f.banner('BOOKS MADE ONCE', { at: p4 + 5.6, out: p5 - 0.05, x: 0.5, y: 0.78, size: 52, color: '#2f9e44' });

    // 1965
    sky(p5, end);
    f.big('1965', { at: p5 + 0.4, out: p5 + 5.6, y: 0.3, size: 220, color: '#ff6b6b', sub: 'ANTI-HINDI PROTESTS' });
    f.emoji('📰', { x: 0.5, y: 0.64, size: 220, at: p5 + 2.4, out: p5 + 5.6, bob: 6 });
    f.banner('LANGUAGE IS IDENTITY', { at: p5 + 5.8, out: end - 0.05, x: 0.5, y: 0.45, size: 52, color: '#6741d9' });
    f.headline('LANGUAGE AND POLITICS', { at: p5 + 0.1, out: end - 0.05, size: 48 });

    // closing
    f.backdrop('sky', { at: end - 0.1 });
    f.emoji('🌉', { x: 0.3, y: 0.42, size: 230, at: end + 0.3, bob: 6 });
    f.emoji('👥', { x: 0.7, y: 0.42, size: 230, at: end + 1.3, bob: 6 });
    f.headline('CONNECT, OR\nLEAVE BEHIND?', { at: end + 0.05, y: 0.095 });
    f.person({ x: 0.5, y: 0.93, height: 0.26, hold: 'sign', mood: 'worried', at: end + 0.1, from: -0.2, outfit: kid });

    k.progress();
    k.whatIfCaptions({ size: 64, maxChars: 12, lit: ['language', 'languages', '22', '121', 'unesco', 'mother', 'tongue', '1965'] });
    [p1, p2, p3, p4, p5].forEach((m) => s.sfx('whoosh', m - 0.3, { gain: 0.2 }));
  },
};

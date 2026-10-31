// What if India never gave the world zero? A big 0 and 1,000, Brahmagupta on the map 1,400 years ago, gap and dot placeholders, zero as a number, Roman numerals, binary on a phone (official outline).
import { setParallel, fly, basemap, kit } from './lib/kit.js';
import { frames } from './lib/frames.js';

setParallel(22);

export default {
  story(s) {
    const t = (m) => s.time(m);
    const MARKS = ['#circle', '#brahma', '#gap', '#calc', '#roman', '#modern', '#later', '#end'].map(t);
    const cam = fly(s, [{ lon: 82.5, lat: 21.5, span: 50 }], { beats: MARKS });
    const k = kit(s, cam);
    const f = frames(s, cam);

    // map beat: Brahmagupta, about 1,400 years ago (official outline)
    basemap(s);
    const b0 = t('#brahma'), b1 = t('#gap') - 0.05;
    k.fill('India', { color: '#e8a31a', alpha: 0.82, border: '#ffffff', at: b0 - 0.1, out: b1, sound: false });
    k.pin({ lon: 75.78, lat: 23.18, at: b0 + 1.4, out: b1 });
    k.emoji('📜', { lon: 75.78, lat: 24.6, size: 120, at: b0 + 1.7, out: b1 });
    k.label('BRAHMAGUPTA', { lon: 75.78, lat: 23.18, at: b0 + 1.8, out: b1, size: 38, dy: 130, plate: true });

    k.grade(); k.ambient(); k.credit('@YourChannel'); k.vignette();

    // opening: a big zero, then 1,000 loses its zeros
    f.backdrop('sky', { at: -1, out: t('#circle') - 0.05, sound: false });
    f.big('0', { at: 0.1, out: 1.5, y: 0.45, size: 520, color: '#ffffff' });
    f.big('1,000', { at: 1.4, out: t('#circle') - 0.05, y: 0.45, size: 230, color: '#ffffff' });
    f.cross({ x: 0.62, y: 0.45, size: 230, at: 2.0, out: t('#circle') - 0.05, sound: false });
    f.headline('WHAT IF INDIA NEVER\nGAVE US ZERO?', { at: 0, y: 0.095, out: t('#circle') - 0.05, size: 54 });

    // zero is just a circle; try writing 1,000 without it
    const ci = t('#circle');
    f.backdrop('sky', { at: ci - 0.1, out: b0 - 0.05 });
    f.big('0', { at: ci + 0.1, out: b0 - 0.05, y: 0.4, size: 480, color: '#ffffff', sub: 'JUST A CIRCLE' });
    f.big('1,000', { at: ci + 2.2, out: b0 - 0.05, y: 0.68, size: 150, color: '#ffd23f' });
    f.cross({ x: 0.7, y: 0.68, size: 140, at: ci + 3.0, out: b0 - 0.05, sound: false });

    // map beat labels
    f.yearRewind(2026, 628, { at: b0 + 0.2, dur: 2.0, out: b1, y: 0.2, size: 150 });
    f.headline('1,400 YEARS AGO', { at: b0 + 0.1, out: b1 });
    f.banner('ZERO AS A REAL NUMBER', { at: b0 + 3.4, out: b1, x: 0.5, y: 0.74, size: 40, color: '#e8a31a' });

    // other cultures: a gap or a dot, only a placeholder
    const ga = t('#gap'), ca = t('#calc'), ro = t('#roman');
    f.backdrop('sky', { at: ga - 0.1, out: ca - 0.05 });
    f.big('1 _ 5', { at: ga + 0.3, out: ca - 0.05, y: 0.34, size: 170, color: '#ffffff', sub: 'A GAP' });
    f.big('1 · 5', { at: ga + 1.6, out: ca - 0.05, y: 0.62, size: 170, color: '#ffffff', sub: 'A DOT' });
    f.banner('JUST A PLACEHOLDER', { at: ga + 2.5, out: ca - 0.05, x: 0.5, y: 0.8, size: 44, color: '#d7282f' });
    f.headline('OTHER CULTURES', { at: ga + 0.1, out: ca - 0.05 });

    // India made zero something you can calculate with
    f.backdrop('sky', { at: ca - 0.1, out: ro - 0.05 });
    f.big('5 + 0 = 5', { at: ca + 0.3, out: ro - 0.05, y: 0.3, size: 130, color: '#ffffff' });
    f.big('5 − 5 = 0', { at: ca + 1.1, out: ro - 0.05, y: 0.46, size: 130, color: '#ffffff' });
    f.big('5 × 0 = 0', { at: ca + 1.9, out: ro - 0.05, y: 0.62, size: 130, color: '#ffffff' });
    f.emoji('✅', { x: 0.5, y: 0.8, size: 200, at: ca + 2.6, out: ro - 0.05, bob: 6 });
    f.headline('A REAL NUMBER', { at: ca + 0.1, out: ro - 0.05 });

    // Roman numerals: try multiplying XLVII by CXXIII
    const mo = t('#modern');
    f.backdrop('sky', { at: ro - 0.1, out: mo - 0.05 });
    f.banner('XLVII × CXXIII', { at: ro + 0.4, out: mo - 0.05, x: 0.5, y: 0.34, size: 70, color: '#6a4c93', rot: -3 });
    f.emoji('🤯', { x: 0.5, y: 0.56, size: 250, at: ro + 1.6, out: ro + 4.2, bob: 6 });
    f.big('47 × 123 = 5,781', { at: ro + 4.4, out: mo - 0.05, y: 0.56, size: 86, color: '#2f9e44' });
    f.person({ x: 0.5, y: 0.93, height: 0.22, mood: 'shock', at: ro + 0.2, from: -0.2, out: mo - 0.05 });
    f.headline('ROMAN NUMERALS?', { at: ro + 0.1, out: mo - 0.05 });

    // computers, phones, UPI: ones and zeros
    const la = t('#later');
    f.backdrop('sky', { at: mo - 0.1, out: la - 0.05 });
    f.emojiRow(['➗', '💻', '📱'], { y: 0.3, size: 150, gap: 0.27, stagger: 0.6, at: mo + 0.3, out: la - 0.05, bob: 6 });
    f.phone({ x: 0.3, y: 0.62, h: 0.34, at: mo + 2.6, out: la - 0.05, screens: [{ at: 0, kind: 'pay' }, { at: mo + 5.4, kind: 'ok' }] });
    f.big('1011\n0010', { at: mo + 3.2, out: la - 0.05, x: 0.72, y: 0.58, size: 110, color: '#7fe3ff', sub: 'ONES AND ZEROS' });
    f.headline('ZERO RUNS\nEVERYTHING', { at: mo + 0.1, out: la - 0.05 });

    // someone else might have found it, maybe much later
    const en = t('#end');
    f.backdrop('sky', { at: la - 0.1, out: en - 0.05 });
    f.emoji('⏳', { x: 0.5, y: 0.36, size: 320, at: la + 0.2, out: en - 0.05, bob: 8 });
    f.big('?', { at: la + 1.6, out: en - 0.05, y: 0.66, size: 280, color: '#ffffff' });
    f.headline('SOMEONE ELSE?\nMAYBE MUCH LATER', { at: la + 0.1, out: en - 0.05, size: 54 });

    // closing: nothing was everything
    f.backdrop('sky', { at: en - 0.1 });
    f.big('0', { at: en + 0.1, y: 0.45, size: 520, color: '#ffffff' });
    f.person({ x: 0.5, y: 0.93, height: 0.22, mood: 'happy', at: en + 0.3, from: -0.2 });
    f.headline('NOTHING WAS\nEVERYTHING', { at: en + 0.05, y: 0.095 });

    k.progress();
    k.whatIfCaptions({ size: 64, maxChars: 12, lit: ['zero', 'circle', 'brahmagupta', 'roman', 'numerals', 'upi', 'ones', 'zeros'] });
    ['#circle', '#brahma', '#gap', '#calc', '#roman', '#modern', '#later'].forEach((m) => s.sfx('whoosh', t(m) - 0.3, { gain: 0.2 }));
  },
};

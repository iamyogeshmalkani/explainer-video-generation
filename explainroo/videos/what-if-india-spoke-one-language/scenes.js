// What if all of India spoke one language? Greetings in many scripts, a rupee note, a farmer and a doctor who understand each other, a grandmother's songs, states claiming their language (official outline).
import { setParallel, fly, basemap, kit } from './lib/kit.js';
import { frames } from './lib/frames.js';

setParallel(22);

const HELLO = ['नमस्ते', 'வணக்கம்', 'হ্যালো', 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ', 'నమస్కారం', 'નમસ્તે', 'ನಮಸ್ಕಾರ', 'നമസ്കാരം', 'नमस्कार'];

export default {
  story(s) {
    const t = (m) => s.time(m);
    const MARKS = ['#many', '#note', '#simple', '#more', '#whose', '#relearn', '#end'].map(t);
    const cam = fly(s, [{ lon: 82.5, lat: 21.5, span: 50 }], { beats: MARKS });
    const k = kit(s, cam);
    const f = frames(s, cam);

    // map beats (official outline): twenty-two languages, then states claiming theirs
    basemap(s);
    const m0 = t('#many'), m1 = t('#note') - 0.05;
    k.fill('India', { color: '#1c7ed6', alpha: 0.8, border: '#ffffff', at: m0 - 0.1, out: m1, sound: false });
    f.bubbles(f.scatter('India', 12, 4), { text: HELLO, color: '#1c7ed6', at: m0 + 0.5, gap: 0.3, out: m1, size: 24 });

    const w0 = t('#whose'), w1 = t('#relearn') - 0.05;
    k.fill('India', { color: '#3a5a8a', alpha: 0.55, border: '#ffffff', at: w0 - 0.1, out: w1, sound: false });
    [['Uttar Pradesh', '#e8590c', 'हिंदी', 80.9, 26.8], ['Tamil Nadu', '#c2255c', 'தமிழ்', 78.4, 11.0], ['West Bengal', '#2f9e44', 'বাংলা', 87.8, 23.6],
      ['Maharashtra', '#7048e8', 'मराठी', 75.6, 19.6], ['Punjab', '#f08c00', 'ਪੰਜਾਬੀ', 75.4, 31.0], ['Karnataka', '#0c8599', 'ಕನ್ನಡ', 76.2, 14.8], ['Gujarat', '#e03131', 'ગુજરાતી', 71.6, 22.4]].forEach(([st, color, word, lon, lat], i) => {
      k.fill(st, { color, alpha: 0.9, border: '#ffffff', at: w0 + 0.3 + i * 0.4, out: w1, sound: i === 0 });
      f.bubbles([[lon, lat]], { text: word, color, at: w0 + 0.6 + i * 0.4, out: w1, size: 24 });
    });

    k.grade(); k.ambient(); k.credit('@YourChannel'); k.vignette();

    // opening: a person surrounded by hellos in different scripts
    const hello = (at, out) => [['नमस्ते', 0.27, 0.3, 'left', -4], ['வணக்கம்', 0.74, 0.37, 'right', 3], ['হ্যালো', 0.3, 0.47, 'left', 3], ['ਸਤ ਸ੍ਰੀ ਅਕਾਲ', 0.72, 0.54, 'right', -3]]
      .forEach(([w, x, y, tail, rot], i) => f.speech(w, { x, y, tail, rot, size: 50, at: at + i * 0.35, out }));
    f.backdrop('street', { at: -1, out: m0 - 0.05, sound: false });
    f.person({ x: 0.5, y: 0.93, height: 0.3, mood: 'shock', at: 0.1, from: -0.2, out: m0 - 0.05 });
    hello(0.3, m0 - 0.05);
    f.headline('WHAT IF INDIA SPOKE\nJUST ONE LANGUAGE?', { at: 0, y: 0.095, out: m0 - 0.05, size: 54 });

    f.headline('22 OFFICIAL\nLANGUAGES', { at: m0 + 0.2, out: m1 });
    f.banner('AND HUNDREDS MORE', { at: m0 + 3.4, out: m1, x: 0.5, y: 0.74, size: 54, color: '#1c7ed6' });

    // a rupee note carries fifteen languages
    f.backdrop('shop', { at: t('#note') - 0.1, out: t('#simple') - 0.05 });
    f.emoji('💵', { x: 0.5, y: 0.34, size: 330, at: t('#note') + 0.1, out: t('#simple') - 0.05, bob: 6 });
    f.big('15', { at: t('#note') + 1.2, out: t('#simple') - 0.05, y: 0.62, size: 260, sub: 'LANGUAGES ON ONE NOTE' });
    f.headline('EVEN THE RUPEE\nSPEAKS MANY', { at: t('#note') + 0.1, out: t('#simple') - 0.05, size: 54 });

    // one language: a farmer and a doctor just talk; exams, courts, apps work the same
    const sm = t('#simple'), mo = t('#more');
    f.backdrop('sky', { at: sm - 0.1, out: mo - 0.05 });
    f.person({ x: 0.24, y: 0.9, height: 0.27, mood: 'happy', at: sm + 0.1, from: -0.2, out: mo - 0.05, outfit: { shirt: '#2f9e44', tie: null } });
    f.person({ x: 0.76, y: 0.9, height: 0.27, mood: 'happy', at: sm + 0.2, from: 1.2, out: mo - 0.05, flip: true, outfit: { shirt: '#ffffff', tie: null } });
    f.emoji('🌾', { x: 0.24, y: 0.46, size: 170, at: sm + 0.5, out: mo - 0.05, bob: 6 });
    f.emoji('🩺', { x: 0.76, y: 0.46, size: 170, at: sm + 0.9, out: mo - 0.05, bob: 6 });
    f.speech('HELLO!', { x: 0.3, y: 0.3, size: 56, tail: 'left', at: sm + 1.3, out: sm + 3.6 });
    f.speech('HELLO!', { x: 0.7, y: 0.3, size: 56, tail: 'right', at: sm + 2.1, out: sm + 3.6 });
    f.emojiRow(['📝', '⚖️', '📱'], { y: 0.3, size: 170, gap: 0.27, stagger: 0.7, at: sm + 3.9, out: mo - 0.05, bob: 6 });
    f.banner('ONE FOR ALL', { at: sm + 5.9, out: mo - 0.05, x: 0.5, y: 0.58, size: 62, color: '#2f9e44' });
    f.headline('ONE LANGUAGE.\nEASY LIFE.', { at: sm + 0.1, out: mo - 0.05 });

    // more than words: songs, jokes, proverbs, stories fade, one grandmother at a time
    const wh = t('#whose');
    f.backdrop('sky', { at: mo - 0.1, out: wh - 0.05 });
    ['🎵', '😂', '📜', '📖'].forEach((c, i) => f.emoji(c, { x: 0.2 + i * 0.2, y: 0.33, size: 150, at: mo + 0.4 + i * 0.7, out: mo + 5.2 + i * 0.55, bob: 6 }));
    f.emoji('👵', { x: 0.5, y: 0.66, size: 300, at: mo + 3.2, out: wh - 0.05, bob: 4 });
    f.headline('MORE THAN WORDS', { at: mo + 0.1, out: mo + 5.8 });
    f.banner('FADING...', { at: mo + 5.9, out: wh - 0.05, x: 0.5, y: 0.2, size: 70, color: '#6a4c93' });

    // whose language? every state claims its own (map)
    f.headline('WHOSE LANGUAGE?', { at: w0 + 0.1, out: w1 });
    f.big('?', { at: w0 + 3.0, out: w1, y: 0.86, size: 200, color: '#ffffff' });

    // relearn everything, almost overnight
    const rl = t('#relearn'), en = t('#end');
    f.backdrop('sky', { at: rl - 0.1, out: en - 0.05 });
    f.clock({ x: 0.5, y: 0.34, r: 150, at: rl + 0.3, out: en - 0.05, hoursPerSec: 3, start: 10 });
    f.emoji('📚', { x: 0.2, y: 0.56, size: 190, at: rl + 0.8, out: en - 0.05, bob: 6 });
    f.emoji('✏️', { x: 0.8, y: 0.56, size: 190, at: rl + 1.2, out: en - 0.05, bob: 6 });
    f.banner('RELEARN EVERYTHING', { at: rl + 2.4, out: en - 0.05, x: 0.5, y: 0.7, size: 46, color: '#d7282f' });
    f.person({ x: 0.5, y: 0.97, height: 0.2, mood: 'worried', at: rl + 0.2, from: -0.2, out: en - 0.05 });
    f.headline('ALMOST\nOVERNIGHT', { at: rl + 0.1, out: en - 0.05 });

    // closing: many voices
    f.backdrop('street', { at: en - 0.1 });
    f.person({ x: 0.5, y: 0.93, height: 0.3, mood: 'happy', at: en + 0.1, from: -0.2 });
    hello(en + 0.3);
    f.headline('MANY VOICES.\nONE INDIA.', { at: en + 0.05, y: 0.095 });

    k.progress();
    k.whatIfCaptions({ size: 64, maxChars: 12, lit: ['language', 'languages', 'twenty-two', 'fifteen', 'rupee', 'kerala', 'assam', 'voices'] });
    ['#many', '#note', '#simple', '#more', '#whose', '#relearn'].forEach((m) => s.sfx('whoosh', t(m) - 0.3, { gain: 0.2 }));
  },
};

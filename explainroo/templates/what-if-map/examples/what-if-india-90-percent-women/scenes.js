// What if 9 in 10 Indians were women? A crowd of ten with one man, 14 crore vs 126 crore, jobs, the Lok Sabha, and home life.
import { setParallel, fly, basemap, kit } from './lib/kit.js';
import { frames } from './lib/frames.js';

setParallel(22);

export default {
  story(s) {
    const t = (m) => s.time(m);
    const MARKS = ['#today', '#jobs', '#politics', '#homes', '#end'].map(t);
    const cam = fly(s, [{ lon: 82.5, lat: 21.5, span: 50 }], { beats: MARKS });
    const k = kit(s, cam);
    const f = frames(s, cam);

    // map beat: India filled pink, a swarm of dots, 9 pink for every 1 blue (official outline)
    basemap(s);
    const m0 = t('#today'), m1 = t('#jobs') - 0.05;
    k.fill('India', { color: '#c2255c', alpha: 0.82, border: '#ffffff', at: m0 + 0.2, out: m1, sound: false });
    f.swarm('India', { n: 900, at: m0 + 0.5, dur: 1.8, out: m1, icon: 'coin', size: 7, color: '#ffd6e7', seed: 4 });
    f.swarm('India', { n: 100, at: m0 + 2.6, dur: 1.2, out: m1, icon: 'coin', size: 8, color: '#4dabf7', seed: 11 });

    k.grade(); k.ambient(); k.credit('@YourChannel'); k.vignette();

    // opening: ten people, nine women and one man
    f.backdrop('sky', { at: -1, out: m0 - 0.05, sound: false });
    const shirts = ['#e64980', '#be4bdb', '#ff922b', '#f06595', '#9775fa', '#ff6b6b', '#e64980', '#f783ac', '#cc5de8'];
    for (let i = 0; i < 10; i++) {
      const row = Math.floor(i / 5), col = i % 5, man = i === 9;
      f.person({ x: 0.14 + col * 0.18, y: 0.55 + row * 0.2, height: 0.16, mood: man ? 'worried' : 'happy', at: 0.2 + i * 0.12, out: m0 - 0.05,
        outfit: man ? { shirt: '#4dabf7', pants: '#24407a' } : { shirt: shirts[i], tie: null, long: true, pants: '#364fc7' } });
    }
    f.headline('WHAT IF INDIA\nHAD 90% WOMEN?', { at: 0, y: 0.095, out: m0 - 0.05 });
    f.big('9 IN 10', { at: 1.6, out: m0 - 0.05, y: 0.27, size: 170, color: '#ff8fb8' });

    // the numbers: 14 crore men, 126 crore women
    f.headline('FLIP IT TO 90%', { at: m0 + 0.3, out: m1, y: 0.075 });
    f.backdrop('sky', { at: m0 + 4.4, out: m1 });
    f.bars({ rows: [{ label: 'MEN', value: 14, color: '#4dabf7', text: '14 CR', emoji: '👨' }, { label: 'WOMEN', value: 126, color: '#e64980', text: '126 CR', emoji: '👩' }], at: m0 + 4.6, out: m1, y: 0.8, h: 0.5, w: 0.62, stagger: 0.7 });
    f.headline('14 vs 126 CRORE', { at: m0 + 4.5, out: m1 });

    // every job needs new hands
    f.backdrop('street', { at: t('#jobs') - 0.1, out: t('#politics') - 0.05 });
    f.emojiRow(['🚛', '🪖', '🏗️', '🛺'], { y: 0.34, size: 150, gap: 0.22, stagger: 0.7, at: t('#jobs') + 0.7, out: t('#politics') - 0.05, bob: 5 });
    f.person({ x: 0.28, y: 0.9, height: 0.25, mood: 'happy', at: t('#jobs') + 0.2, from: -0.2, out: t('#politics') - 0.05, outfit: { shirt: '#ff922b', tie: null, long: true, pants: '#364fc7', vest: true } });
    f.person({ x: 0.72, y: 0.9, height: 0.25, mood: 'happy', at: t('#jobs') + 0.5, from: 1.2, out: t('#politics') - 0.05, outfit: { shirt: '#e64980', tie: null, long: true, pants: '#24407a' } });
    f.emojiRow(['🌾', '🏪', '🏭'], { y: 0.58, size: 120, gap: 0.2, stagger: 0.6, at: t('#jobs') + 6.0, out: t('#politics') - 0.05, bob: 5 });
    f.headline('EVERY JOB,\nNEW HANDS', { at: t('#jobs') + 0.1, out: t('#politics') - 0.05, y: 0.095 });

    // politics: 1 in 7 today, then what the ballot would promise
    f.backdrop('sky', { at: t('#politics') - 0.1, out: t('#homes') - 0.05 });
    f.emoji('🏛️', { x: 0.5, y: 0.27, size: 230, at: t('#politics') + 0.4, out: t('#homes') - 0.05, bob: 5 });
    f.big('1 IN 7', { at: t('#politics') + 2.4, out: t('#politics') + 6.4, y: 0.52, size: 200, color: '#ffd23f', sub: 'MPs ARE WOMEN TODAY' });
    f.emoji('🗳️', { x: 0.5, y: 0.52, size: 220, at: t('#politics') + 6.6, out: t('#homes') - 0.05, bob: 6 });
    f.emojiRow(['🛡️', '🏥', '🍼'], { y: 0.7, size: 160, gap: 0.28, stagger: 0.8, at: t('#politics') + 8.0, out: t('#homes') - 0.05, bob: 6 });
    f.headline('LOK SABHA', { at: t('#politics') + 0.1, out: t('#homes') - 0.05 });

    // homes
    f.backdrop('sky', { at: t('#homes') - 0.1, out: t('#end') - 0.05 });
    f.emojiRow(['💍', '🏠', '🏙️'], { y: 0.4, size: 190, gap: 0.3, stagger: 0.7, at: t('#homes') + 0.6, out: t('#end') - 0.05, bob: 6 });
    f.person({ x: 0.3, y: 0.9, height: 0.22, mood: 'worried', at: t('#homes') + 1.6, from: -0.2, out: t('#end') - 0.05, outfit: { shirt: '#4dabf7', pants: '#24407a' } });
    f.person({ x: 0.7, y: 0.9, height: 0.22, mood: 'happy', at: t('#homes') + 1.9, from: 1.2, out: t('#end') - 0.05, outfit: { shirt: '#e64980', tie: null, long: true, pants: '#364fc7' } });
    f.banner('REWRITE IT ALL', { at: t('#homes') + 4.0, out: t('#end') - 0.05, x: 0.5, y: 0.62, size: 66, color: '#c2255c' });
    f.headline('HOMES CHANGE TOO', { at: t('#homes') + 0.1, out: t('#end') - 0.05 });

    // closing
    f.backdrop('sky', { at: t('#end') - 0.1 });
    f.silhouette('India', { x: 0.5, y: 0.5, w: 0.55, color: '#e64980', at: t('#end') + 0.1 });
    f.big('90%', { at: t('#end') + 0.5, y: 0.52, size: 220, color: '#ffffff' });
    f.headline('A VERY DIFFERENT\nCOUNTRY', { at: t('#end') + 0.05, y: 0.095 });
    f.person({ x: 0.82, y: 0.9, height: 0.25, hold: 'sign', mood: 'shock', at: t('#end') + 0.1, from: 1.3, outfit: { shirt: '#e64980', tie: null, long: true } });

    k.progress();
    k.whatIfCaptions({ size: 64, maxChars: 12, lit: ['women', 'men', 'crore', 'ninety', 'lok', 'sabha', 'politics', 'homes'] });
    [t('#today'), t('#jobs'), t('#politics'), t('#homes')].forEach((m) => s.sfx('whoosh', m - 0.3, { gain: 0.2 }));
  },
};

// What if chai vanished from India? A kulhad that shatters, stalls with their shutters down, tea estates, a quiet tapri, a century ago (official outline).
import { setParallel, fly, basemap, kit } from './lib/kit.js';
import { frames } from './lib/frames.js';

setParallel(22);

export default {
  story(s) {
    const t = (m) => s.time(m);
    const MARKS = ['#drink', '#stalls', '#farms', '#mornings', '#tapri', '#century', '#end'].map(t);
    const cam = fly(s, [{ lon: 82.5, lat: 21.5, span: 50 }], { beats: MARKS });
    const k = kit(s, cam);
    const f = frames(s, cam);

    // map beat 1: India pours chai
    basemap(s);
    const d0 = t('#drink'), d1 = t('#stalls') - 0.05;
    k.fill('India', { color: '#d9822b', alpha: 0.82, border: '#ffffff', at: d0 - 0.1, out: d1, sound: false });
    f.swarm('India', { n: 600, at: d0 + 0.2, dur: 2.0, out: d1, icon: 'coin', size: 7, color: '#fff3d6', seed: 4 });
    [[72.83, 18.97], [77.2, 28.6], [88.36, 22.57], [80.27, 13.08], [77.59, 12.97], [78.48, 17.38]].forEach(([lon, lat], i) => k.emoji('☕', { lon, lat, size: 110, at: d0 + 0.5 + i * 0.35, out: d1 }));

    // map beat 2: the tea estates (Assam, Darjeeling, Nilgiris)
    const f0 = t('#farms'), f1 = t('#mornings') - 0.05;
    k.fill('India', { color: '#3a5a8a', alpha: 0.5, border: '#ffffff', at: f0 - 0.1, out: f1, sound: false });
    k.fill('Assam', { color: '#2f9e44', alpha: 0.92, border: '#ffffff', at: f0 + 0.3, out: f1 });
    k.fill('West Bengal', { color: '#74b816', alpha: 0.85, border: '#ffffff', at: f0 + 1.2, out: f1, sound: false });
    k.fill('Tamil Nadu', { color: '#2f9e44', alpha: 0.85, border: '#ffffff', at: f0 + 2.1, out: f1, sound: false });
    [['ASSAM', 92.9, 26.2, 0.4], ['DARJEELING', 88.26, 27.04, 1.3], ['NILGIRIS', 76.7, 11.4, 2.2]].forEach(([name, lon, lat, dt], i) => {
      k.pin({ lon, lat, at: f0 + dt, out: f1 });
      k.emoji('🍃', { lon: lon + (i === 2 ? -1.6 : 0), lat: lat + (i === 2 ? 0 : 0.2), size: 100, at: f0 + dt + 0.3, out: f1 });
      k.label(name, { lon, lat, at: f0 + dt + 0.3, out: f1, size: 34, dy: i === 1 ? -120 : 110, plate: true });
    });

    k.grade(); k.ambient(); k.credit('@YourChannel'); k.vignette();

    // opening: a steaming cup that shatters
    f.backdrop('street', { at: -1, out: d0 - 0.05, sound: false });
    f.emoji('☕', { x: 0.5, y: 0.4, size: 360, at: 0.1, out: d0 - 0.05, bob: 6, cross: true, crossAt: 1.3 });
    f.person({ x: 0.5, y: 0.93, height: 0.28, mood: 'shock', at: 0.1, from: -0.2, out: d0 - 0.05, outfit: { shirt: '#f08c00', tie: null } });
    f.headline('WHAT IF CHAI\nVANISHED?', { at: 0, y: 0.095, out: d0 - 0.05 });

    f.headline('INDIA RUNS ON CHAI', { at: d0 + 0.2, out: d1, size: 54 });
    f.banner('MILLIONS OF CUPS A DAY', { at: d0 + 2.6, out: d1, x: 0.5, y: 0.76, size: 40, color: '#d9822b' });

    // stalls: chai sellers at offices, bus stands, stations lose their only income
    const st = t('#stalls');
    f.backdrop('shop', { at: st - 0.1, out: f0 - 0.05 });
    f.person({ x: 0.5, y: 0.9, height: 0.27, mood: 'worried', at: st + 0.1, from: 1.2, out: f0 - 0.05, outfit: { shirt: '#f08c00', tie: null, vest: '#8d1b2f' } });
    f.emojiRow(['🏢', '🚌', '🚉'], { y: 0.28, size: 160, gap: 0.28, stagger: 0.9, at: st + 0.8, out: f0 - 0.05, bob: 6 });
    f.emoji('☕', { x: 0.5, y: 0.52, size: 180, at: st + 3.4, out: f0 - 0.05, cross: true, crossAt: st + 4.2 });
    f.banner('SHUTTER DOWN', { at: st + 4.4, out: f0 - 0.05, x: 0.5, y: 0.64, size: 54 });
    f.big('₹0', { at: st + 5.6, out: f0 - 0.05, x: 0.8, y: 0.46, size: 170, color: '#ff6b6b', sub: 'INCOME' });
    f.headline('CHAI STALLS', { at: st + 0.1, out: f0 - 0.05 });

    // farms: more than a million workers
    f.headline('TEA ESTATES', { at: f0 + 0.2, out: f1 });
    f.countUp(0, 1000000, { at: f0 + 2.8, dur: 2.4, out: f1, y: 0.74, size: 130, suffix: '+', sub: 'WORKERS ON THE ESTATES' });

    // mornings: welcome guests, close deals, friends; then the tapri goes quiet
    const mo = t('#mornings'), ta = t('#tapri'), ce = t('#century');
    f.backdrop('street', { at: mo - 0.1, out: ta - 0.05 });
    f.emoji('☕', { x: 0.5, y: 0.3, size: 280, at: mo + 0.3, out: ta - 0.05, bob: 6 });
    f.emojiRow(['🏠', '🤝', '👫'], { y: 0.56, size: 150, gap: 0.28, stagger: 0.9, at: mo + 1.2, out: ta - 0.05, bob: 6 });
    f.banner('GUESTS · DEALS · FRIENDS', { at: mo + 3.6, out: ta - 0.05, x: 0.5, y: 0.74, size: 36, color: '#d9822b' });
    f.person({ x: 0.2, y: 0.93, height: 0.2, mood: 'happy', at: mo + 0.4, from: -0.2, out: ta - 0.05, outfit: { shirt: '#ffd23f', tie: null } });
    f.person({ x: 0.8, y: 0.93, height: 0.2, mood: 'happy', at: mo + 0.7, from: 1.2, out: ta - 0.05, flip: true, outfit: { shirt: '#ff6b6b', tie: null } });
    f.headline('THE CHAI HABIT', { at: mo + 0.1, out: ta - 0.05 });
    f.backdrop('station', { at: ta - 0.1, out: ce - 0.05 });
    f.emoji('☕', { x: 0.5, y: 0.34, size: 260, at: ta + 0.2, out: ce - 0.05, cross: true, crossAt: ta + 1.0 });
    f.emojiRow(['🏢', '🚆'], { y: 0.58, size: 150, gap: 0.3, stagger: 0.6, at: ta + 1.8, out: ce - 0.05 });
    f.banner('TOO QUIET', { at: ta + 3.0, out: ce - 0.05, x: 0.5, y: 0.74, size: 64 });
    f.person({ x: 0.5, y: 0.93, height: 0.2, mood: 'worried', at: ta + 0.2, from: -0.2, out: ce - 0.05 });
    f.headline('THE TAPRI\nGOES QUIET', { at: ta + 0.1, out: ce - 0.05 });

    // a century ago, most Indians didn't drink tea every day
    const en = t('#end');
    f.backdrop('sky', { at: ce - 0.1, out: en - 0.05 });
    f.yearRewind(2026, 1926, { at: ce + 0.2, dur: 2.2, out: en - 0.05, y: 0.2, size: 170 });
    f.emoji('☕', { x: 0.5, y: 0.48, size: 260, at: ce + 0.4, out: ce + 2.8, cross: true, crossAt: ce + 2.4 });
    f.emoji('☕', { x: 0.5, y: 0.5, size: 260, at: ce + 3.4, out: en - 0.05, bob: 6 });
    f.banner('A FEW GENERATIONS', { at: ce + 3.6, out: en - 0.05, x: 0.5, y: 0.72, size: 50, color: '#d9822b' });
    f.headline('100 YEARS AGO', { at: ce + 0.1, out: en - 0.05 });

    // closing
    f.backdrop('shop', { at: en - 0.1 });
    f.emoji('☕', { x: 0.5, y: 0.4, size: 340, at: en + 0.2, bob: 6, cross: true, crossAt: en + 2.0 });
    f.person({ x: 0.5, y: 0.93, height: 0.28, mood: 'worried', at: en + 0.1, from: -0.2, outfit: { shirt: '#f08c00', tie: null } });
    f.headline('JUST A CUP\nOF TEA?', { at: en + 0.05, y: 0.095 });

    k.progress();
    k.whatIfCaptions({ size: 64, maxChars: 12, lit: ['chai', 'tea', 'tapri', 'assam', 'darjeeling', 'nilgiris', 'million', 'cup'] });
    ['#drink', '#stalls', '#farms', '#mornings', '#tapri', '#century'].forEach((m) => s.sfx('whoosh', t(m) - 0.3, { gain: 0.2 }));
  },
};

// What if Delhi's air was clean tomorrow? A smoggy skyline that clears, a masked person, and one map beat on north India.
import { setParallel, fly, basemap, kit } from './lib/kit.js';
import { frames } from './lib/frames.js';

setParallel(22);

const MASK = { mask: true, shirt: '#9ec5ee' };

export default {
  story(s) {
    const t = (m) => s.time(m);
    const MARKS = ['#bad', '#clean', '#hospitals', '#kids', '#schools', '#flights', '#sky', '#end'].map(t);
    const cam = fly(s, [{ lon: 77.1, lat: 28.55, span: 3.4 }], { beats: MARKS });
    const k = kit(s, cam);
    const f = frames(s, cam);

    // Map beat: Delhi and the plains around it, under a brown haze (official outlines).
    basemap(s);
    k.fill(['Punjab', 'Haryana', 'Uttar Pradesh', 'Rajasthan', 'Uttarakhand', 'Himachal Pradesh'], { color: '#c9a45b', alpha: 0.55, border: '#ffffff', at: t('#bad') - 0.1, out: t('#bad') + 3.3, sound: false });
    k.fill('Delhi', { color: '#d7282f', alpha: 0.95, border: '#ffffff', at: t('#bad') + 0.2, out: t('#bad') + 3.3 });
    k.label('DELHI', { lon: 77.1, lat: 28.6, dash: true, dy: -230, size: 54, plate: true, at: t('#bad') + 0.4, out: t('#bad') + 3.3 });
    k.tint('#9c8764', { at: t('#bad') - 0.1, out: t('#bad') + 3.3, alpha: 0.3, fade: 0.8 });

    k.grade(); k.ambient(); k.credit('@YourChannel'); k.vignette();

    const end1 = t('#bad') - 0.05, mapEnd = t('#bad') + 3.3;

    // opening: grey smog that clears to blue sky, a masked person
    f.backdrop('smog', { at: -1, out: end1, sound: false, clearAt: 1.1, clearDur: 1.4 });
    f.person({ x: 0.7, y: 0.9, height: 0.28, mood: 'worried', at: 0.1, from: 1.2, out: end1, outfit: MASK });
    f.headline('WHAT IF DELHI\'S AIR\nWAS CLEAN?', { at: 0, y: 0.095, out: end1 });

    // the AQI over Delhi (on the map beat)
    f.countUp(50, 450, { at: t('#bad') + 0.6, dur: 2.0, out: mapEnd, y: 0.3, size: 220, color: '#ff6b6b', sub: 'AQI: SEVERE' });

    // breathing it is compared to smoking
    f.backdrop('smog', { at: mapEnd, out: t('#clean') - 0.05, clearAt: 999 });
    f.emojiRow(['🚬', '🚬', '🚬', '🚬'], { y: 0.42, size: 190, gap: 0.2, stagger: 0.3, at: mapEnd + 0.4, out: t('#clean') - 0.05, bob: 6 });
    f.person({ x: 0.5, y: 0.9, height: 0.28, mood: 'worried', at: mapEnd + 0.2, from: -0.2, out: t('#clean') - 0.05, outfit: MASK });
    f.headline('LIKE SMOKING', { at: mapEnd + 0.15, out: t('#clean') - 0.05 });

    // clean air: the sky clears, the number drops
    f.backdrop('smog', { at: t('#clean') - 0.1, out: t('#hospitals') - 0.05, clearAt: t('#clean') + 0.2, clearDur: 1.6 });
    f.countUp(450, 30, { at: t('#clean') + 0.3, dur: 1.6, out: t('#hospitals') - 0.05, y: 0.3, size: 220, color: '#7cff6b', sub: 'AQI: GOOD' });
    f.person({ x: 0.5, y: 0.9, height: 0.28, mood: 'happy', at: t('#clean') + 0.2, from: 1.2, out: t('#hospitals') - 0.05 });

    // hospitals: lungs and fewer cases
    f.backdrop('sky', { at: t('#hospitals') - 0.1, out: t('#kids') - 0.05 });
    f.emoji('🫁', { x: 0.28, y: 0.42, size: 260, at: t('#hospitals') + 0.1, out: t('#kids') - 0.05, bob: 6 });
    f.emoji('✅', { x: 0.62, y: 0.3, size: 130, at: t('#hospitals') + 1.0, out: t('#kids') - 0.05 });
    f.emoji('🏥', { x: 0.74, y: 0.5, size: 260, at: t('#hospitals') + 0.5, out: t('#kids') - 0.05, bob: 6 });
    f.banner('FEWER CASES', { at: t('#hospitals') + 1.6, out: t('#kids') - 0.05, x: 0.5, y: 0.72, size: 66, color: '#2f9e44' });
    f.headline('EASIER BREATHING', { at: t('#hospitals') + 0.1, out: t('#kids') - 0.05 });

    // children play outside
    f.backdrop('smog', { at: t('#kids') - 0.1, out: t('#schools') - 0.05, clearAt: -9 });
    f.person({ x: 0.3, y: 0.88, height: 0.24, mood: 'happy', at: t('#kids') + 0.1, from: -0.2, out: t('#schools') - 0.05, outfit: { shirt: '#ffd23f', tie: null }, walk: true });
    f.person({ x: 0.72, y: 0.9, height: 0.2, mood: 'happy', at: t('#kids') + 0.3, from: 1.2, out: t('#schools') - 0.05, outfit: { shirt: '#ff6b6b', tie: null, long: true, pants: '#6a4c93' }, walk: true });
    f.emoji('⚽', { x: 0.5, y: 0.5, size: 130, at: t('#kids') + 0.5, to: { x: 0.5, y: 0.8 }, dur: 0.55, moveAt: t('#kids') + 0.6, out: t('#schools') - 0.05 });
    f.headline('PLAY OUTSIDE', { at: t('#kids') + 0.1, out: t('#schools') - 0.05 });

    // schools stay open in November
    f.backdrop('sky', { at: t('#schools') - 0.1, out: t('#flights') - 0.05 });
    f.emoji('🏫', { x: 0.3, y: 0.45, size: 270, at: t('#schools') + 0.1, out: t('#flights') - 0.05, bob: 6 });
    f.emoji('🎒', { x: 0.72, y: 0.45, size: 250, at: t('#schools') + 0.5, out: t('#flights') - 0.05, bob: 6 });
    f.banner('OPEN IN NOVEMBER', { at: t('#schools') + 1.0, out: t('#flights') - 0.05, x: 0.5, y: 0.68, size: 56, color: '#2f9e44' });
    f.headline('SCHOOLS STAY OPEN', { at: t('#schools') + 0.1, out: t('#flights') - 0.05 });

    // flights and trains on time
    f.backdrop('sky', { at: t('#flights') - 0.1, out: t('#sky') - 0.05 });
    f.emoji('✈️', { x: 0.12, y: 0.4, size: 240, at: t('#flights') + 0.1, to: { x: 0.85, y: 0.3 }, dur: 2.0, moveAt: t('#flights') + 0.3, out: t('#sky') - 0.05 });
    f.emoji('🚆', { x: 0.88, y: 0.62, size: 220, at: t('#flights') + 0.6, to: { x: 0.2 }, dur: 1.8, moveAt: t('#flights') + 0.8, out: t('#sky') - 0.05, flip: true });
    f.banner('ON TIME', { at: t('#flights') + 1.6, out: t('#sky') - 0.05, x: 0.5, y: 0.52, size: 90, color: '#2f9e44' });
    f.headline('NO SMOG DELAYS', { at: t('#flights') + 0.1, out: t('#sky') - 0.05 });

    // the sky and the Red Fort come back
    f.backdrop('smog', { at: t('#sky') - 0.1, out: t('#end') - 0.05, clearAt: t('#sky') + 0.1, clearDur: 2.2 });
    f.emoji('✨', { x: 0.2, y: 0.12, size: 120, at: t('#sky') + 1.8, out: t('#end') - 0.05, bob: 8 });
    f.emoji('⭐', { x: 0.45, y: 0.2, size: 100, at: t('#sky') + 2.1, out: t('#end') - 0.05, bob: 8 });
    f.emoji('✨', { x: 0.78, y: 0.14, size: 120, at: t('#sky') + 2.4, out: t('#end') - 0.05, bob: 8 });
    f.person({ x: 0.5, y: 0.92, height: 0.27, mood: 'happy', at: t('#sky') + 0.2, from: -0.2, out: t('#end') - 0.05 });
    f.headline('THE RED FORT\nIN VIEW', { at: t('#sky') + 2.3, y: 0.1, out: t('#end') - 0.05 });

    // closing
    f.backdrop('smog', { at: t('#end') - 0.1, clearAt: -9 });
    f.headline('CLEAN AIR\nSHOULD BE NORMAL', { at: t('#end') + 0.05, y: 0.095 });
    f.person({ x: 0.68, y: 0.9, height: 0.28, hold: 'sign', mood: 'happy', at: t('#end') + 0.1, from: 1.2 });

    k.progress();
    k.whatIfCaptions({ size: 64, maxChars: 12, lit: ['clean', 'smoking', 'asthma', 'november', 'smog', 'stars'] });
    [t('#bad'), t('#clean'), t('#hospitals'), t('#schools'), t('#flights'), t('#sky')].forEach((m) => s.sfx('whoosh', m - 0.3, { gain: 0.2 }));
  },
};

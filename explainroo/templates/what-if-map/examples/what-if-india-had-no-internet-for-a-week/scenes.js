// What if India had no internet for seven days? Phones with no signal, crossed-out apps, and one map beat where the network goes dark.
import { setParallel, fly, basemap, kit } from './lib/kit.js';
import { frames } from './lib/frames.js';

setParallel(22);

const CITIES = { delhi: [77.2, 28.6], mumbai: [72.83, 18.97], kolkata: [88.36, 22.57], chennai: [80.27, 13.08], bengaluru: [77.59, 12.97], hyderabad: [78.48, 17.38] };

export default {
  story(s) {
    const t = (m) => s.time(m);
    const MARKS = ['#basics', '#work', '#school', '#shops', '#hospitals', '#end'].map(t);
    const cam = fly(s, [{ lon: 82.5, lat: 21.5, span: 50 }], { beats: MARKS });
    const k = kit(s, cam);
    const f = frames(s, cam);

    // map beat: the network lights India up, then goes dark (official outline)
    basemap(s);
    const m0 = t('#hospitals'), m1 = t('#end') - 0.05, off = m0 + 2.2;
    k.fill('India', { color: '#1c7ed6', alpha: 0.8, border: '#ffffff', at: m0 - 0.1, out: off, sound: false });
    k.fill('India', { color: '#3a3d46', alpha: 0.92, border: '#ffffff', at: off, out: m1, sound: false });
    f.swarm('India', { n: 700, at: m0 + 0.1, dur: 1.4, out: off, icon: 'coin', size: 7, color: '#7fe3ff', seed: 6 });
    f.bubbles(f.scatter('India', 16, 12), { text: 'NO SIGNAL', at: off + 0.2, gap: 0.1, out: m1, size: 13 });
    k.emoji('🏥', { lon: CITIES.delhi[0], lat: CITIES.delhi[1], size: 120, at: m0 + 0.5, out: m1 });
    k.emoji('🏦', { lon: CITIES.mumbai[0], lat: CITIES.mumbai[1], size: 120, at: m0 + 0.9, out: m1 });
    k.emoji('✈️', { lon: CITIES.bengaluru[0], lat: CITIES.bengaluru[1], size: 120, at: m0 + 1.3, out: m1 });
    k.emoji('🏥', { lon: CITIES.kolkata[0], lat: CITIES.kolkata[1], size: 100, at: m0 + 1.5, out: m1 });

    k.grade(); k.ambient(); k.credit('@YourChannel'); k.vignette();

    // opening: a phone that loses signal
    f.backdrop('sky', { at: -1, out: t('#basics') - 0.05, sound: false });
    f.phone({ x: 0.3, y: 0.5, h: 0.46, at: 0, out: t('#basics') - 0.05, screens: [{ at: 0, kind: 'chat' }, { at: 1.4, kind: 'nosignal' }] });
    f.person({ x: 0.74, y: 0.84, height: 0.28, mood: 'shock', at: 0.1, from: 1.2, out: t('#basics') - 0.05 });
    f.headline('WHAT IF NO INTERNET\nFOR 7 DAYS?', { at: 0, y: 0.095, out: t('#basics') - 0.05 });

    // no chat, no payments, no maps; no cabs, no food
    f.backdrop('sky', { at: t('#basics') - 0.1, out: t('#work') - 0.05 });
    f.emojiRow(['💬', '💸', '🗺️'], { y: 0.34, size: 190, gap: 0.3, stagger: 0.8, at: t('#basics') + 0.2, out: t('#work') - 0.05, bob: 6 });
    [0.2, 0.5, 0.8].forEach((x, i) => f.cross({ x, y: 0.34, size: 190, at: t('#basics') + 0.9 + i * 0.8, out: t('#work') - 0.05, sound: i === 0 }));
    f.emoji('🚕', { x: 0.32, y: 0.64, size: 210, at: t('#basics') + 3.2, out: t('#work') - 0.05, cross: true, crossAt: t('#basics') + 3.9 });
    f.emoji('🍕', { x: 0.68, y: 0.64, size: 210, at: t('#basics') + 4.1, out: t('#work') - 0.05, cross: true, crossAt: t('#basics') + 4.8 });
    f.headline('THE BASICS GO FIRST', { at: t('#basics') + 0.1, out: t('#work') - 0.05 });

    // work: cloud tools, email, video calls
    f.backdrop('sky', { at: t('#work') - 0.1, out: t('#school') - 0.05 });
    f.emoji('☁️', { x: 0.2, y: 0.38, size: 220, at: t('#work') + 0.9, out: t('#school') - 0.05, cross: true, crossAt: t('#work') + 2.3, bob: 6 });
    f.emoji('📧', { x: 0.5, y: 0.38, size: 220, at: t('#work') + 3.3, out: t('#school') - 0.05, cross: true, crossAt: t('#work') + 4.3, bob: 6 });
    f.emoji('📹', { x: 0.8, y: 0.38, size: 220, at: t('#work') + 4.3, out: t('#school') - 0.05, cross: true, crossAt: t('#work') + 5.3, bob: 6 });
    f.person({ x: 0.5, y: 0.9, height: 0.27, mood: 'worried', at: t('#work') + 0.2, from: -0.2, out: t('#school') - 0.05, outfit: { shirt: '#9ec5ee' } });
    f.headline('OFFICES STOP', { at: t('#work') + 0.1, out: t('#school') - 0.05 });

    // schools
    f.backdrop('sky', { at: t('#school') - 0.1, out: t('#shops') - 0.05 });
    f.emoji('🏫', { x: 0.3, y: 0.42, size: 260, at: t('#school') + 0.1, out: t('#shops') - 0.05, bob: 6 });
    f.emoji('💻', { x: 0.72, y: 0.42, size: 240, at: t('#school') + 0.6, out: t('#shops') - 0.05, cross: true, crossAt: t('#school') + 1.4 });
    f.banner('CLASSES CANCELLED', { at: t('#school') + 1.5, out: t('#shops') - 0.05, x: 0.5, y: 0.68, size: 52 });
    f.headline('ONLINE CLASSES CLOSE', { at: t('#school') + 0.1, out: t('#shops') - 0.05 });

    // small businesses lose a week of sales
    f.backdrop('shop', { at: t('#shops') - 0.1, out: t('#hospitals') - 0.05 });
    f.phone({ x: 0.28, y: 0.48, h: 0.36, at: t('#shops') + 0.2, out: t('#hospitals') - 0.05, screens: [{ at: 0, kind: 'chat' }, { at: t('#shops') + 1.4, kind: 'nosignal' }], tilt: -5 });
    f.big('₹0', { at: t('#shops') + 1.2, out: t('#hospitals') - 0.05, x: 0.7, y: 0.36, size: 230, color: '#ff6b6b', sub: 'FOR 7 DAYS' });
    f.emoji('📦', { x: 0.7, y: 0.64, size: 190, at: t('#shops') + 2.4, out: t('#hospitals') - 0.05, cross: true, crossAt: t('#shops') + 3.4 });
    f.headline('A WEEK OF SALES LOST', { at: t('#shops') + 0.1, out: t('#hospitals') - 0.05, size: 54 });

    // hospitals, banks, airlines (map beat)
    f.headline('EVERYTHING SLOWS', { at: m0 + 2.3, out: m1 });
    f.big('7 DAYS', { at: m0 + 0.2, out: off, y: 0.2, size: 190, color: '#ffffff' });

    // closing
    f.backdrop('sky', { at: t('#end') - 0.1 });
    f.phone({ x: 0.3, y: 0.5, h: 0.46, at: t('#end'), screens: [{ at: 0, kind: 'nosignal' }] });
    f.person({ x: 0.74, y: 0.84, height: 0.28, hold: 'phone', mood: 'worried', at: t('#end') + 0.1, from: 1.2 });
    f.headline('NO SIGNAL.\n7 DAYS.', { at: t('#end') + 0.05, y: 0.095 });

    k.progress();
    k.whatIfCaptions({ size: 64, maxChars: 12, lit: ['whatsapp', 'upi', 'internet', 'hospitals', 'week', 'seven'] });
    [t('#basics'), t('#work'), t('#school'), t('#shops'), t('#hospitals')].forEach((m) => s.sfx('whoosh', m - 0.3, { gain: 0.2 }));
  },
};

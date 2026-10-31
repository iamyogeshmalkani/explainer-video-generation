// What if cricket never came to India? A stadium that empties, hockey, football and kabaddi, and one map beat for the British arrival.
import { setParallel, fly, basemap, kit } from './lib/kit.js';
import { frames } from './lib/frames.js';

setParallel(22);

export default {
  story(s) {
    const t = (m) => s.time(m);
    const MARKS = ['#british', '#other', '#hockey', '#ipl', '#heroes', '#end'].map(t);
    const cam = fly(s, [{ lon: 82.5, lat: 21.5, span: 50 }], { beats: MARKS });
    const k = kit(s, cam);
    const f = frames(s, cam);

    // map beat: cricket arrives by sea with the British, and takes over India (official outline)
    basemap(s);
    const m0 = t('#british'), m1 = t('#other') - 0.05;
    k.fill('India', { color: '#1c7ed6', alpha: 0.8, border: '#ffffff', at: m0 - 0.1, out: m1, sound: false });
    k.flow([[50, 12], [58, 14], [66, 17], [72.5, 18.8]], { at: m0 + 0.2, out: m1, color: '#ffe066', width: 10 });
    k.emoji('🚢', { lon: 58, lat: 14.6, size: 120, at: m0 + 0.5, out: m1 });
    [[72.83, 18.97], [77.2, 28.6], [88.36, 22.57], [80.27, 13.08], [77.59, 12.97]].forEach(([lon, lat], i) => k.emoji('🏏', { lon, lat, size: 100, at: m0 + 1.6 + i * 0.35, out: m1 }));

    k.grade(); k.ambient(); k.credit('@YourChannel'); k.vignette();

    // opening: a full stadium that empties, a person with a bat
    f.backdrop('stadium', { at: -1, out: m0 - 0.05, sound: false, emptyAt: 0.8, emptyDur: 1.3 });
    f.person({ x: 0.5, y: 0.93, height: 0.3, hold: 'bat', mood: 'shock', at: 0.1, from: -0.2, out: m0 - 0.05 });
    f.headline('WHAT IF CRICKET\nNEVER CAME?', { at: 0, y: 0.095, out: m0 - 0.05 });

    f.headline('FROM BRITAIN', { at: m0 + 0.3, out: m1, y: 0.075 });
    f.big('#1', { at: m0 + 3.3, out: m1, y: 0.3, size: 230, color: '#ffd23f', sub: 'SPORT IN INDIA' });

    // another sport takes its place
    f.backdrop('sky', { at: t('#other') - 0.1, out: t('#hockey') - 0.05 });
    f.emoji('🏏', { x: 0.5, y: 0.4, size: 300, at: t('#other') + 0.1, out: t('#hockey') - 0.05, cross: true, crossAt: t('#other') + 1.0 });
    f.big('?', { at: t('#other') + 1.5, out: t('#hockey') - 0.05, y: 0.7, size: 260, color: '#ffffff' });
    f.headline('SOMETHING ELSE', { at: t('#other') + 0.1, out: t('#hockey') - 0.05 });

    // hockey, football, kabaddi
    f.backdrop('sky', { at: t('#hockey') - 0.1, out: t('#ipl') - 0.05 });
    f.emoji('🏑', { x: 0.2, y: 0.4, size: 230, at: t('#hockey') + 0.3, out: t('#ipl') - 0.05, bob: 6 });
    f.emoji('🥇', { x: 0.2, y: 0.62, size: 150, at: t('#hockey') + 1.4, out: t('#ipl') - 0.05, bob: 6 });
    f.emoji('⚽', { x: 0.5, y: 0.4, size: 230, at: t('#hockey') + 2.6, out: t('#ipl') - 0.05, bob: 6 });
    f.emoji('🤼', { x: 0.8, y: 0.4, size: 230, at: t('#hockey') + 3.6, out: t('#ipl') - 0.05, bob: 6 });
    f.headline('HOCKEY? FOOTBALL? KABADDI?', { at: t('#hockey') + 0.1, out: t('#ipl') - 0.05, size: 50 });

    // no IPL, the money goes elsewhere
    f.backdrop('stadium', { at: t('#ipl') - 0.1, out: t('#heroes') - 0.05, emptyAt: t('#ipl') + 1.2, emptyDur: 1.6 });
    f.emoji('🏆', { x: 0.5, y: 0.3, size: 280, at: t('#ipl') + 0.2, out: t('#heroes') - 0.05, cross: true, crossAt: t('#ipl') + 1.0 });
    f.banner('NO IPL', { at: t('#ipl') + 1.4, out: t('#heroes') - 0.05, x: 0.5, y: 0.52, size: 90 });
    ['💰', '📺', '📣'].forEach((c, i) => f.emoji(c, { x: 0.2, y: 0.66 + i * 0.07, size: 130, at: t('#ipl') + 3.4 + i * 0.4, to: { x: 0.8 }, dur: 1.6, moveAt: t('#ipl') + 3.7 + i * 0.4, out: t('#heroes') - 0.05 }));
    f.emoji('🏑', { x: 0.88, y: 0.8, size: 110, at: t('#ipl') + 3.4, out: t('#heroes') - 0.05 });
    f.headline('THE MONEY MOVES ON', { at: t('#ipl') + 3.2, out: t('#heroes') - 0.05 });

    // other heroes
    f.backdrop('street', { at: t('#heroes') - 0.1, out: t('#end') - 0.05 });
    ['TENDULKAR', 'DHONI', 'KOHLI'].forEach((name, i) => {
      f.banner(name, { at: t('#heroes') + 3.2 + i * 0.8, out: t('#end') - 0.05, x: 0.5, y: 0.22 + i * 0.13, size: 64, color: '#1c7ed6', rot: i % 2 ? 3 : -3, sound: i === 0 });
      f.cross({ x: 0.5, y: 0.22 + i * 0.13, size: 120, at: t('#heroes') + 4.0 + i * 0.8, out: t('#end') - 0.05, sound: false });
    });
    f.emoji('❓', { x: 0.5, y: 0.62, size: 200, at: t('#heroes') + 0.3, out: t('#end') - 0.05, bob: 8 });
    f.person({ x: 0.25, y: 0.9, height: 0.22, mood: 'happy', at: t('#heroes') + 0.1, from: -0.2, out: t('#end') - 0.05, outfit: { shirt: '#ffd23f', tie: null } });
    f.person({ x: 0.75, y: 0.9, height: 0.2, mood: 'happy', at: t('#heroes') + 0.4, from: 1.2, out: t('#end') - 0.05, outfit: { shirt: '#ff6b6b', tie: null, long: true, pants: '#6a4c93' } });
    f.headline('NEW HEROES?', { at: t('#heroes') + 0.1, y: 0.075, out: t('#end') - 0.05 });

    // closing
    f.backdrop('stadium', { at: t('#end') - 0.1 });
    f.person({ x: 0.5, y: 0.93, height: 0.3, hold: 'bat', mood: 'happy', at: t('#end') + 0.1, from: -0.2 });
    f.headline('MORE THAN\nA SPORT', { at: t('#end') + 0.05, y: 0.095 });

    k.progress();
    k.whatIfCaptions({ size: 64, maxChars: 12, lit: ['cricket', 'ipl', 'hockey', 'kabaddi', 'tendulkar', 'dhoni', 'kohli', 'british'] });
    [t('#british'), t('#other'), t('#hockey'), t('#ipl'), t('#heroes')].forEach((m) => s.sfx('whoosh', m - 0.3, { gain: 0.2 }));
  },
};

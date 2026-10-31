// What if every vehicle in India went electric tomorrow? A petrol pump that closes, a power problem, chargers, jobs, and a map of oil flows that shrink.
import { setParallel, fly, basemap, kit } from './lib/kit.js';
import { frames } from './lib/frames.js';

setParallel(22);

export default {
  story(s) {
    const t = (m) => s.time(m);
    const MARKS = ['#perfect', '#problem', '#chargers', '#pumps', '#everything', '#end'].map(t);
    const cam = fly(s, [{ lon: 66, lat: 23, span: 56 }], { beats: MARKS });
    const k = kit(s, cam);
    const f = frames(s, cam);

    // map beat: the oil that comes in by sea gets thin (official outline)
    basemap(s);
    const m0 = t('#perfect') + 3.0, m1 = t('#problem') - 0.05;
    k.fill('India', { color: '#2f9e44', alpha: 0.8, border: '#ffffff', at: m0 - 0.1, out: m1, sound: false });
    k.flow([[50.6, 26.6], [55, 25.2], [62, 22], [70.8, 19.2]], { at: m0 + 0.2, out: m1, color: '#ffe066', width: 4 });
    k.flow([[40, 20.5], [46, 14.5], [56, 13.5], [66, 14.5], [73.5, 14]], { at: m0 + 0.6, out: m1, color: '#ffe066', width: 4 });
    k.emoji('🛢️', { lon: 51.5, lat: 27.5, size: 100, at: m0 + 0.2, out: m1 });
    k.label('LESS IMPORTED OIL', { lon: 62, lat: 31, dash: false, size: 44, plate: true, at: m0 + 0.9, out: m1 });

    k.grade(); k.ambient(); k.credit('@YourChannel'); k.vignette();

    // opening: the pump goes dark, a person with a charger plug
    f.backdrop('pump', { at: -1, out: t('#perfect') - 0.05, sound: false });
    f.pump({ x: 0.2, y: 0.76, h: 0.38, at: 0, out: t('#perfect') - 0.05, dryAt: 1.6 });
    f.queue({ y: 0.79, items: ['🚗', '🚕', '🛵', '🚌', '🚙'], n: 5, at: 0.3, gap: 0.35, x0: 0.4, size: 118, out: t('#perfect') - 0.05 });
    f.emoji('⚡', { x: 0.47, y: 0.66, size: 140, at: 1.4, out: t('#perfect') - 0.05, bob: 8 });
    f.person({ x: 0.74, y: 0.88, height: 0.27, hold: 'sign', mood: 'shock', at: 0.1, from: 1.2, out: t('#perfect') - 0.05 });
    f.headline('WHAT IF ALL VEHICLES\nWENT ELECTRIC?', { at: 0, y: 0.12, out: t('#perfect') - 0.05 });

    // sounds perfect: cleaner air
    f.backdrop('sky', { at: t('#perfect') - 0.1, out: m0 - 0.05 });
    f.emojiRow(['🚗', '🛵', '🚌'], { y: 0.62, size: 190, gap: 0.27, stagger: 0.35, at: t('#perfect') + 0.2, out: m0 - 0.05, bob: 4 });
    f.emoji('⚡', { x: 0.5, y: 0.78, size: 130, at: t('#perfect') + 1.0, out: m0 - 0.05, bob: 8 });
    f.emoji('🌳', { x: 0.2, y: 0.3, size: 200, at: t('#perfect') + 1.8, out: m0 - 0.05, bob: 6 });
    f.emoji('☀️', { x: 0.75, y: 0.3, size: 200, at: t('#perfect') + 2.2, out: m0 - 0.05, bob: 6 });
    f.headline('SOUNDS PERFECT', { at: t('#perfect') + 0.1, out: m0 - 0.05 });
    f.arrowUp({ x: 0.5, y: 0.2, size: 200, down: true, at: m0 + 0.4, out: m1, color: '#2f9e44' });

    // the problem: the power
    f.backdrop('sky', { at: t('#problem') - 0.1, out: t('#chargers') - 0.05 });
    f.emoji('🔌', { x: 0.25, y: 0.4, size: 260, at: t('#problem') + 0.5, out: t('#chargers') - 0.05, bob: 6 });
    f.arrowUp({ x: 0.72, y: 0.4, size: 260, at: t('#problem') + 2.4, out: t('#chargers') - 0.05 });
    f.emoji('🏭', { x: 0.28, y: 0.7, size: 250, at: t('#problem') + 5.0, out: t('#chargers') - 0.05, bob: 6 });
    f.big('70%+', { at: t('#problem') + 5.6, out: t('#chargers') - 0.05, x: 0.7, y: 0.68, size: 190, color: '#ffd23f', sub: 'OF POWER IS COAL' });
    f.headline('A BIG PROBLEM', { at: t('#problem') + 0.1, out: t('#chargers') - 0.05 });

    // not enough chargers
    f.backdrop('street', { at: t('#chargers') - 0.1, out: t('#pumps') - 0.05 });
    f.emoji('🔌', { x: 0.2, y: 0.56, size: 260, at: t('#chargers') + 0.1, out: t('#pumps') - 0.05, bob: 6 });
    f.queue({ y: 0.78, items: ['🚗', '🚕', '🛵', '🚙'], n: 6, at: t('#chargers') + 0.4, gap: 0.25, x0: 0.36, size: 125, out: t('#pumps') - 0.05 });
    f.banner('NOT ENOUGH CHARGERS', { at: t('#chargers') + 1.0, out: t('#pumps') - 0.05, x: 0.5, y: 0.32, size: 50 });

    // pumps close, mechanics lose work
    f.backdrop('pump', { at: t('#pumps') - 0.1, out: t('#everything') - 0.05 });
    f.pump({ x: 0.2, y: 0.76, h: 0.38, at: t('#pumps') - 0.1, out: t('#everything') - 0.05, dryAt: t('#pumps') + 0.6 });
    f.banner('CLOSED', { at: t('#pumps') + 1.0, out: t('#everything') - 0.05, x: 0.5, y: 0.45, size: 90 });
    f.person({ x: 0.74, y: 0.88, height: 0.27, mood: 'worried', at: t('#pumps') + 2.0, from: 1.2, out: t('#everything') - 0.05, outfit: { shirt: '#ff9933', tie: null, pants: '#3b4252', vest: '#ff9933' } });
    f.emoji('🔧', { x: 0.5, y: 0.65, size: 170, at: t('#pumps') + 2.6, out: t('#everything') - 0.05, cross: true, crossAt: t('#pumps') + 4.2, bob: 6 });
    f.headline('NO PETROL, NO WORK', { y: 0.12, at: t('#pumps') + 0.1, out: t('#everything') - 0.05 });

    // everything at once
    f.backdrop('sky', { at: t('#everything') - 0.1, out: t('#end') - 0.05 });
    f.emojiRow(['⚡', '🔋', '💼'], { y: 0.42, size: 230, gap: 0.3, stagger: 0.8, at: t('#everything') + 0.2, out: t('#end') - 0.05, bob: 6 });
    f.banner('ALL AT ONCE', { at: t('#everything') + 3.2, out: t('#end') - 0.05, x: 0.5, y: 0.7, size: 90 });
    f.headline('EVERYTHING CHANGES', { at: t('#everything') + 0.1, out: t('#end') - 0.05 });

    // closing
    f.backdrop('pump', { at: t('#end') - 0.1 });
    f.pump({ x: 0.2, y: 0.76, h: 0.38, at: t('#end') - 0.1, dryAt: t('#end') + 0.4 });
    f.emoji('🔌', { x: 0.47, y: 0.62, size: 170, at: t('#end') + 0.5, bob: 8 });
    f.person({ x: 0.74, y: 0.88, height: 0.27, hold: 'sign', mood: 'worried', at: t('#end') + 0.1, from: 1.2 });
    f.headline('WHERE DOES THE\nPOWER COME FROM?', { y: 0.12, at: t('#end') + 0.05 });

    k.progress();
    k.whatIfCaptions({ size: 64, maxChars: 12, lit: ['electric', 'electricity', 'coal', 'chargers', 'jobs', 'perfect'] });
    [t('#perfect'), t('#problem'), t('#chargers'), t('#pumps'), t('#everything')].forEach((m) => s.sfx('whoosh', m - 0.3, { gain: 0.2 }));
  },
};

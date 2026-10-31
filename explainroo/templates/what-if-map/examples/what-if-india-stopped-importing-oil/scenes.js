// What if India stopped importing oil? Cartoon cut-aways (petrol pump, street, sky) around one map beat that shows the 85%.
import { setParallel, fly, basemap, kit } from './lib/kit.js';
import { frames } from './lib/frames.js';

setParallel(22);

export default {
  story(s) {
    const t = (m) => s.time(m);
    const MARKS = ['#share', '#vehicles', '#dry', '#trucks', '#factories', '#flights', '#power', '#prices', '#end'].map(t);

    // 1. Camera: the Arabian Sea and India, for the one map beat.
    const cam = fly(s, [{ lon: 66, lat: 23, span: 56 }], { beats: MARKS });
    const k = kit(s, cam);
    const f = frames(s, cam);

    // 2. Map beat: oil arrives by sea from the Gulf and beyond. India is the official outline.
    basemap(s);
    k.fill('India', { color: '#f6b43a', alpha: 0.9, border: '#ffffff', at: t('#share') - 0.1, out: t('#vehicles'), sound: false });
    k.flow([[50.6, 26.6], [55, 25.2], [62, 22], [70.8, 19.2]], { at: t('#share') + 0.3, out: t('#vehicles'), color: '#ffe066' });
    k.flow([[40, 20.5], [46, 14.5], [56, 13.5], [66, 14.5], [73.5, 14]], { at: t('#share') + 0.8, out: t('#vehicles'), color: '#ffe066' });
    k.emoji('🛢️', { lon: 51.5, lat: 27.5, size: 110, at: t('#share') + 0.2, out: t('#vehicles') });
    k.label('PERSIAN GULF', { lon: 57, lat: 29.2, dash: false, size: 40, plate: true, at: t('#share') + 0.3, out: t('#vehicles') });
    k.emoji('🚢', { lon: 61, lat: 22.8, size: 110, at: t('#share') + 0.9, out: t('#vehicles') });
    k.emoji('🚢', { lon: 56, lat: 14.5, size: 110, at: t('#share') + 1.3, out: t('#vehicles') });

    k.grade(); k.ambient(); k.credit('@YourChannel'); k.vignette();

    // 3. Cut-aways.
    const pumpScene = (a, o, dryAt) => {
      f.backdrop('pump', { at: a, out: o, sound: a > 0 });
      f.pump({ x: 0.2, y: 0.76, h: 0.38, at: a, out: o, dryAt });
    };
    // opening
    pumpScene(-1, t('#share') - 0.05, 99);
    f.queue({ y: 0.79, items: ['🚗', '🚕', '🚌', '🛵', '🚙'], n: 5, at: 0.4, gap: 0.45, x0: 0.4, size: 118, out: t('#share') - 0.05 });
    f.headline('WHAT IF\nNO IMPORTED OIL?', { at: 0, y: 0.12, out: t('#share') - 0.05 });
    f.person({ x: 0.72, y: 0.86, height: 0.27, hold: 'can', mood: 'shock', at: 0.1, from: 1.2, out: t('#share') - 0.05 });

    // 85%
    f.big('85%', { at: t('#share') + 0.3, out: t('#vehicles') - 0.05, y: 0.3, size: 250, sub: 'OF CRUDE OIL IS IMPORTED' });

    // everything on wheels
    f.backdrop('street', { at: t('#vehicles') - 0.1, out: t('#dry') - 0.05 });
    f.emojiRow(['🚌', '🚚', '🏍️', '🚗'], { y: 0.56, size: 190, gap: 0.235, stagger: 0.3, at: t('#vehicles') + 0.1, out: t('#dry') - 0.05, bob: 6 });
    f.emoji('⛽', { x: 0.5, y: 0.3, size: 170, at: t('#vehicles') + 1.7, out: t('#dry') - 0.05, bob: 8 });
    f.headline('IT ALL RUNS ON OIL', { at: t('#vehicles') + 0.1, out: t('#dry') - 0.05 });

    // pumps run dry
    pumpScene(t('#dry') - 0.1, t('#trucks') - 0.05, t('#dry') + 1.4);
    f.queue({ y: 0.79, items: ['🚗', '🚕', '🚌', '🛵', '🚙'], n: 5, at: t('#dry') + 0.2, gap: 0.3, x0: 0.4, size: 118, out: t('#trucks') - 0.05 });
    f.headline('DRY IN WEEKS', { y: 0.12, at: t('#dry') + 0.15, out: t('#trucks') - 0.05 });
    f.clock({ x: 0.82, y: 0.22, r: 95, at: t('#dry') + 0.4, out: t('#trucks') - 0.05, hoursPerSec: 30, start: 9 });
    f.person({ x: 0.74, y: 0.9, height: 0.25, hold: 'can', mood: 'worried', at: t('#dry') + 0.3, from: 1.2, out: t('#trucks') - 0.05 });

    // trucks slow down and stop
    f.backdrop('street', { at: t('#trucks') - 0.1, out: t('#factories') - 0.05 });
    f.emojiRow(['🥦', '🥛', '🌾'], { y: 0.3, size: 150, gap: 0.25, stagger: 0.3, at: t('#trucks') + 0.2, out: t('#factories') - 0.05, bob: 6 });
    f.emoji('🚚', { x: 0.1, y: 0.66, size: 280, at: t('#trucks') + 0.5, to: { x: 0.55 }, dur: 1.8, moveAt: t('#trucks') + 0.6, out: t('#factories') - 0.05, flip: true, cross: true, crossAt: t('#trucks') + 2.7 });
    f.banner('STOPPED', { at: t('#trucks') + 2.8, out: t('#factories') - 0.05, y: 0.5, x: 0.55, size: 64 });
    f.headline('SUPPLY SLOWS DOWN', { at: t('#trucks') + 0.15, out: t('#factories') - 0.05 });

    // factories, flights, power and gas
    f.backdrop('sky', { at: t('#factories') - 0.1, out: t('#prices') - 0.05 });
    f.emoji('🏭', { x: 0.2, y: 0.42, size: 230, at: t('#factories') + 0.1, out: t('#prices') - 0.05, cross: true, crossAt: t('#factories') + 1.0 });
    f.emoji('✈️', { x: 0.5, y: 0.42, size: 230, at: t('#flights') + 0.1, out: t('#prices') - 0.05, cross: true, crossAt: t('#flights') + 0.9 });
    f.emoji('⚡', { x: 0.8, y: 0.42, size: 230, at: t('#power') + 0.1, out: t('#prices') - 0.05, cross: true, crossAt: t('#power') + 0.9 });
    f.emoji('🍳', { x: 0.66, y: 0.62, size: 150, at: t('#power') + 1.2, out: t('#prices') - 0.05 });
    f.banner('CANCELLED', { at: t('#flights') + 1.1, out: t('#prices') - 0.05, y: 0.62, x: 0.38, size: 50 });
    f.headline('EVERYTHING STALLS', { at: t('#factories') + 0.1, out: t('#prices') - 0.05 });

    // prices climb
    f.backdrop('sky', { at: t('#prices') - 0.1, out: t('#end') - 0.05 });
    f.arrowUp({ x: 0.5, y: 0.42, size: 380, at: t('#prices') + 0.1, out: t('#end') - 0.05 });
    f.emojiRow(['🥦', '🥛', '🛵', '🍚'], { y: 0.7, size: 130, gap: 0.2, stagger: 0.35, at: t('#prices') + 0.8, out: t('#end') - 0.05, bob: 6 });
    f.headline('PRICES CLIMB', { at: t('#prices') + 0.1, out: t('#end') - 0.05 });

    // closing
    pumpScene(t('#end') - 0.1, undefined, t('#end') + 0.4);
    f.queue({ y: 0.79, items: ['🚗', '🚕', '🚌', '🛵', '🚙'], n: 5, at: t('#end') + 0.1, gap: 0.2, x0: 0.4, size: 118 });
    f.headline('85% IMPORTED.\nWHAT IF?', { y: 0.12, at: t('#end') + 0.05 });
    f.person({ x: 0.74, y: 0.88, height: 0.27, hold: 'sign', mood: 'worried', at: t('#end') + 0.2, from: 1.2 });

    k.progress();
    k.whatIfCaptions({ size: 64, maxChars: 12, lit: ['oil', 'dry', 'prices', 'cancelled', 'stopped'] });
    [t('#share'), t('#vehicles'), t('#dry'), t('#trucks'), t('#factories'), t('#prices')].forEach((m) => s.sfx('whoosh', m - 0.3, { gain: 0.2 }));
  },
};

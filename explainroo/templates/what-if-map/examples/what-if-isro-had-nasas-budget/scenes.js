// What if ISRO had NASA's budget? A rocket, budget bars that grow, planets and satellites, and one map beat at the launch site.
import { setParallel, fly, basemap, kit } from './lib/kit.js';
import { frames } from './lib/frames.js';

setParallel(22);

export default {
  story(s) {
    const t = (m) => s.time(m);
    const MARKS = ['#mars', '#nasa', '#rockets', '#deeper', '#sats', '#power', '#end'].map(t);
    const cam = fly(s, [{ lon: 82, lat: 19, span: 26 }], { beats: MARKS });
    const k = kit(s, cam);
    const f = frames(s, cam);

    // map beat: the launch site on India's east coast (official outline)
    basemap(s);
    k.fill('India', { color: '#ff9933', alpha: 0.75, border: '#ffffff', at: t('#mars') - 0.1, out: t('#mars') + 1.9, sound: false });
    k.pin({ lon: 80.23, lat: 13.72, at: t('#mars') + 0.3, out: t('#mars') + 1.9 });
    k.label('SRIHARIKOTA', { lon: 80.23, lat: 13.72, dash: true, dx: 90, dy: -190, size: 44, plate: true, at: t('#mars') + 0.5, out: t('#mars') + 1.9 });
    k.flow([[80.4, 13.9], [83.5, 17], [86.5, 21]], { at: t('#mars') + 1.0, out: t('#mars') + 1.9, color: '#ffe066' });

    k.grade(); k.ambient(); k.credit('@YourChannel'); k.vignette();

    const space = t('#mars') + 1.8;

    // opening: two budgets, one rocket
    f.backdrop('sky', { at: -1, out: t('#mars') - 0.05, sound: false });
    f.bars({ rows: [{ label: 'ISRO', value: 1.6, color: '#ff9933', text: '$1.6B' }, { label: 'NASA', value: 25, color: '#1c7ed6', text: '$25B' }], at: 0.3, out: t('#mars') - 0.05, y: 0.74, h: 0.42, w: 0.6, stagger: 0.5 });
    f.rocket({ x: 0.84, y: 0.8, size: 0.34, at: 0.1, out: t('#mars') - 0.05, launchAt: 1.5 });
    f.person({ x: 0.14, y: 0.93, height: 0.2, mood: 'shock', at: 0.1, from: -0.2, out: t('#mars') - 0.05 });
    f.headline('WHAT IF ISRO HAD\nNASA\'S BUDGET?', { at: 0, y: 0.095, out: t('#mars') - 0.05 });

    // India's Mars mission: about 74 million dollars, less than a film
    f.backdrop('space', { at: space, out: t('#nasa') - 0.05 });
    f.planet({ x: 0.74, y: 0.22, r: 150, color: '#d1593a', at: space + 0.2, out: t('#nasa') - 0.05 });
    f.rocket({ x: 0.14, y: 0.88, size: 0.34, at: space + 0.1, out: t('#nasa') - 0.05, launchAt: space + 0.7 });
    f.countUp(0, 74, { at: space + 0.9, dur: 1.5, out: t('#nasa') - 0.05, x: 0.56, y: 0.45, size: 190, prefix: '$', suffix: ' M', color: '#7cff6b', sub: 'MARS MISSION' });
    f.emoji('🎬', { x: 0.5, y: 0.7, size: 220, at: t('#mars') + 5.3, out: t('#nasa') - 0.05, bob: 6 });
    f.banner('A FILM CAN COST MORE', { at: t('#mars') + 5.9, out: t('#nasa') - 0.05, x: 0.5, y: 0.6, size: 40, color: '#d7282f' });
    f.headline('MARS FOR LESS', { at: space + 0.1, out: t('#nasa') - 0.05 });

    // budgets: ISRO's bar climbs to NASA's
    f.backdrop('sky', { at: t('#nasa') - 0.1, out: t('#rockets') - 0.05 });
    f.bars({ rows: [{ label: 'ISRO', value: 1.6, color: '#ff9933', text: '~$1.6B', emoji: '🛰️' }, { label: 'NASA', value: 25, color: '#1c7ed6', text: '~$25B', emoji: '🚀' }], at: t('#nasa') + 0.1, out: t('#rockets') - 0.05, y: 0.76, h: 0.5, w: 0.6, stagger: 0.6, grow: { row: 0, to: 25, at: t('#nasa') + 3.9, dur: 2.0, text: '?' } });
    f.headline('YEARLY BUDGET', { at: t('#nasa') + 0.1, out: t('#rockets') - 0.05 });

    // bigger rockets, more astronauts
    f.backdrop('space', { at: t('#rockets') - 0.1, out: t('#deeper') - 0.05 });
    f.rocket({ x: 0.5, y: 0.9, size: 0.5, at: t('#rockets') + 0.1, out: t('#deeper') - 0.05, launchAt: t('#rockets') + 0.8 });
    f.emoji('🧑‍🚀', { x: 0.2, y: 0.4, size: 220, at: t('#rockets') + 1.7, out: t('#deeper') - 0.05, bob: 8 });
    f.emoji('🧑‍🚀', { x: 0.8, y: 0.3, size: 180, at: t('#rockets') + 2.1, out: t('#deeper') - 0.05, bob: 8 });
    f.headline('BIGGER ROCKETS', { at: t('#rockets') + 0.1, out: t('#deeper') - 0.05 });

    // deeper into space
    f.backdrop('space', { at: t('#deeper') - 0.1, out: t('#sats') - 0.05 });
    f.planet({ x: 0.25, y: 0.35, r: 110, color: '#d1593a', at: t('#deeper') + 0.1, out: t('#sats') - 0.05 });
    f.planet({ x: 0.72, y: 0.55, r: 90, color: '#e8c36a', ring: true, at: t('#deeper') + 0.5, out: t('#sats') - 0.05 });
    f.emoji('🚀', { x: 0.1, y: 0.85, size: 190, at: t('#deeper') + 0.3, to: { x: 0.85, y: 0.15 }, dur: 1.3, moveAt: t('#deeper') + 0.4, out: t('#sats') - 0.05, rot: 45 });
    f.headline('DEEPER INTO SPACE', { at: t('#deeper') + 0.1, out: t('#sats') - 0.05 });

    // satellites for farming, weather, communication
    f.backdrop('space', { at: t('#sats') - 0.1, out: t('#power') - 0.05 });
    f.emoji('🛰️', { x: 0.2, y: 0.25, size: 200, at: t('#sats') + 0.1, to: { x: 0.8, y: 0.2 }, dur: 3.4, moveAt: t('#sats') + 0.3, out: t('#power') - 0.05, bob: 6 });
    f.emoji('🛰️', { x: 0.8, y: 0.4, size: 150, at: t('#sats') + 0.6, to: { x: 0.25, y: 0.38 }, dur: 3.2, moveAt: t('#sats') + 0.8, out: t('#power') - 0.05, bob: 6 });
    f.emojiRow(['🌾', '🌦️', '📡'], { y: 0.66, size: 200, gap: 0.3, stagger: 0.8, at: t('#sats') + 1.2, out: t('#power') - 0.05, bob: 6 });
    f.headline('MANY MORE SATELLITES', { at: t('#sats') + 0.1, out: t('#power') - 0.05, size: 54 });

    // a top space power
    f.backdrop('sky', { at: t('#power') - 0.1, out: t('#end') - 0.05 });
    f.emoji('🏆', { x: 0.5, y: 0.4, size: 330, at: t('#power') + 0.2, out: t('#end') - 0.05, bob: 8 });
    f.emoji('🇮🇳', { x: 0.3, y: 0.68, size: 170, at: t('#power') + 1.0, out: t('#end') - 0.05, bob: 6 });
    f.emoji('🚀', { x: 0.7, y: 0.68, size: 170, at: t('#power') + 1.6, out: t('#end') - 0.05, bob: 6 });
    f.headline('A TOP SPACE POWER', { at: t('#power') + 0.1, out: t('#end') - 0.05 });

    // closing
    f.backdrop('sky', { at: t('#end') - 0.1 });
    f.rocket({ x: 0.28, y: 0.84, size: 0.4, at: t('#end') + 0.1, launchAt: t('#end') + 1.3 });
    f.person({ x: 0.72, y: 0.9, height: 0.27, hold: 'sign', mood: 'happy', at: t('#end') + 0.1, from: 1.2 });
    f.headline('SO MUCH WITH\nSO LITTLE', { at: t('#end') + 0.05, y: 0.095 });

    k.progress();
    k.whatIfCaptions({ size: 64, maxChars: 12, lit: ['isro', 'nasa', 'mars', 'seventy', 'satellites', 'budget'] });
    [t('#mars'), t('#nasa'), t('#rockets'), t('#deeper'), t('#sats'), t('#power')].forEach((m) => s.sfx('whoosh', m - 0.3, { gain: 0.2 }));
  },
};

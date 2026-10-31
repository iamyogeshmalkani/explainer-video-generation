// What if every Indian state was its own country? A what-if-map video with cut-away cartoon frames.
// The map is the Survey of India outline (data/india-states.js). Never draw India from the world-atlas data.
import { setParallel, fly, basemap, kit, REGIONS } from './lib/kit.js';
import { frames } from './lib/frames.js';

setParallel(22);

const UT = ['Jammu and Kashmir', 'Andaman and Nicobar', 'Lakshadweep', 'Delhi', 'Chandigarh', 'Puducherry', 'Dadra and Nagar Haveli', 'Daman and Diu'];
const CREAM = '#efe3b5';
const GREY_UT = Object.fromEntries(UT.map((n) => [n, '#b9b9c6']));

export default {
  story(s) {
    const t = (m) => s.time(m);
    const MARKS = ['#well', '#how', '#kings', '#trav', '#declared', '#weeks', '#flip', '#no', '#crack', '#up', '#mh', '#office', '#border', '#pass', '#ipl', '#cong', '#end'].map(t);

    // 1. Camera: all of India, into Kerala and back out, into Maharashtra and back out.
    const cam = fly(s, [
      { lon: 82.5, lat: 21.5, span: 50 },
      { at: t('#kings') - 0.3, lon: 81, lat: 22, span: 44, dur: 1.6 },
      { at: t('#trav') - 0.3, lon: 77.2, lat: 11, span: 17, dur: 1.4 },
      { at: t('#flip') - 0.3, lon: 82.5, lat: 21.5, span: 50, dur: 1.5 },
      { at: t('#mh') - 0.3, lon: 76.8, lat: 19.2, span: 19, dur: 1.4 },
      { at: t('#office') - 0.2, lon: 82.5, lat: 21.5, span: 50, dur: 0.6 },
    ], { beats: MARKS });
    const k = kit(s, cam);
    const f = frames(s, cam);

    // 2. The map. Opening: 28 coloured states with flags, a person holding a passport.
    basemap(s);
    f.states(REGIONS.indiaStates, { at: 0, out: t('#well') + 0.2, flags: REGIONS.india28, colors: GREY_UT });

    // "the how": the map turns cream like an old atlas, the year runs back to 1947
    k.fill('India', { color: CREAM, alpha: 1, border: CREAM, at: t('#well') + 0.1, out: t('#crack'), pulse: false, sound: false });

    // 1947: the Indian flag goes up over Delhi
    f.flagPole({ lon: 77.2, lat: 28.6, at: t('#how') + 0.5, out: t('#kings') - 0.1, h: 260, tricolor: true });

    // five hundred kingdoms, each of them able to say no
    f.swarm('India', { n: 500, at: t('#kings') + 0.1, dur: 2.0, out: t('#trav') - 0.1, label: 'KINGDOMS', final: '500+', seed: 5 });
    f.bubbles(f.scatter('India', 22, 3), { at: t('#kings') + 2.2, gap: 0.08, out: t('#trav') - 0.1 });

    // Travancore (today's Kerala): a flag goes up, a stamp slams down, the weeks pile up
    k.fill('Kerala', { color: '#f4a6c0', alpha: 0.95, border: '#ffffff', at: t('#trav'), out: t('#flip') });
    f.flagPole({ lon: 76.55, lat: 10.2, at: t('#declared') + 0.2, out: t('#flip'), h: 230 });
    f.stamp('INDEPENDENT!', { lon: 75.4, lat: 8.0, at: t('#declared') + 1.1, out: t('#flip'), size: 52, tilt: -8 });
    f.calendar({ lon: 77.9, lat: 9.6, at: t('#weeks') + 0.1, out: t('#flip'), weeks: 6, gap: 0.3, dx: 20, dy: -10 });

    // flip it: everyone says no, then India cracks into 28 pieces
    f.bubbles(f.scatter('India', 26, 9), { at: t('#no') + 0.1, gap: 0.05, out: t('#crack') + 0.3 });
    f.states(REGIONS.indiaStates, { at: t('#crack') + 0.1, crack: true, flags: REGIONS.india28, colors: GREY_UT });

    // Maharashtra keeps Mumbai
    k.fill('Maharashtra', { color: '#f6b43a', alpha: 1, border: '#ffffff', at: t('#mh') + 0.2, out: t('#office') });
    k.pin({ lon: 72.83, lat: 18.97, at: t('#mh') + 0.8, out: t('#office') });
    k.label('MUMBAI', { lon: 72.83, lat: 18.97, dash: false, dy: -105, size: 40, at: t('#mh') + 0.9, out: t('#office'), plate: true });
    f.swarm('Maharashtra', { n: 90, at: t('#mh') + 1.6, dur: 1.5, out: t('#office'), icon: 'coin', size: 13, color: '#ffd23f', seed: 21 });

    // the trophy
    f.trophy({ lon: 79.5, lat: 23.5, at: t('#cong') + 0.1, out: t('#end'), size: 170 });

    // 3. Screen-fixed layers.
    k.grade();
    k.ambient();
    k.credit('@YourChannel');
    k.vignette();

    // 4. Cut-aways, headlines and the person sit above the grade and the vignette, so their colours stay bright.
    f.scale({
      at: t('#up'), out: t('#mh') - 0.15, tipAt: t('#brazil') + 0.55, title: 'PEOPLE',
      left: { name: 'Uttar Pradesh', label: 'UTTAR PRADESH', value: '241 MILLION', color: '#e08a1e', heavy: true, at: t('#up') + 0.4 },
      right: { name: 'Brazil', label: 'BRAZIL', value: '212 MILLION', color: '#3aa14a', at: t('#brazil') - 0.2 },
    });
    f.borderScene({
      at: t('#office') - 0.1, out: t('#ipl') - 0.05, sign: 'GURUGRAM', sub: '2 km',
      officerAt: t('#border') - 0.15, barrierAt: t('#border') + 0.15, passportAt: t('#pass') + 0.05, stampAt: t('#pass') + 0.75,
      stampText: 'ENTRY DENIED',
    });
    f.headline('28 STATES.\n28 PASSPORTS.', { at: 0, out: t('#well') + 0.1 });
    f.person({ x: 0.64, y: 0.8, height: 0.25, hold: true, mood: 'shock', at: 0.1, out: t('#well') + 0.1, from: 1.2 });
    f.yearRewind(2025, 1947, { at: t('#well') + 0.7, dur: 2.4, out: t('#kings') - 0.05 });
    f.headline('TRAVANCORE', { at: t('#trav') + 0.1, out: t('#flip') - 0.1, sub: "= TODAY'S KERALA" });
    f.headline('28 COUNTRIES', { at: t('#crack') + 0.9, out: t('#up') - 0.1 });
    f.headline('MAHARASHTRA', { at: t('#mh') + 0.1, out: t('#office') - 0.1 });
    f.confetti({ at: t('#cong') + 0.15, dur: 2.6, count: 150 });
    f.headline('28 STATES.\n28 PASSPORTS.', { at: t('#end') + 0.05 });
    f.person({ x: 0.64, y: 0.8, height: 0.25, hold: true, mood: 'shock', at: t('#end') + 0.1, from: 1.2 });

    k.progress();
    k.whatIfCaptions({ size: 64, maxChars: 12, lit: ['independent', 'no', 'Brazil', 'rich', 'passport', 'passports', 'country', 'closer', 'how'] });

    // 5. Sounds: the helpers add their own. Whooshes at the flights.
    [t('#kings'), t('#trav'), t('#flip'), t('#mh'), t('#ipl')].forEach((m) => s.sfx('whoosh', m - 0.3, { gain: 0.25 }));
  },
};

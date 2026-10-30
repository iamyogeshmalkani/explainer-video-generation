// what-if-map: "What if ...?" map explainers. One continuous satellite-map camera, countries filled
// with flags or colours, red pins, emoji, a rolling counter, ranking bars, a white paper scene for
// silhouettes and a podium, and small outlined captions. Edit script.md first, then tie each view
// and overlay below to a [#marker]. Every helper is documented in lib/kit.js.
import { setParallel, fly, basemap, kit, REGIONS } from './lib/kit.js';

setParallel(20);

export default {
  story(s) {
    const t = (m) => s.time(m);
    const MARKS = ['#count', '#spain', '#guinea', '#latam', '#power', '#spread', '#people', '#gdp', '#rank', '#culture', '#tango', '#flamenco', '#pins', '#heads', '#however', '#gap', '#poor', '#dialects', '#laws', '#end'].map(t);

    // 1. Camera. Slow, always moving; a flight about every 3 to 4 seconds. First key = opening shot.
    const cam = fly(s, [
      { lon: -75, lat: 5, span: 60 },
      { at: t('#count') - 0.4, lon: -45, lat: 5, span: 100, dur: 1.7 },
      { at: t('#spain') - 0.3, lon: -4, lat: 40, span: 14, dur: 1.5 },
      { at: t('#guinea') - 0.3, lon: 8, lat: 3, span: 18, dur: 1.5 },
      { at: t('#latam') - 0.3, lon: -70, lat: -18, span: 64, dur: 1.7 },
      { at: t('#power') - 0.2, lon: -35, lat: 12, span: 112, dur: 1.5 },
      { at: t('#rank') + 0.4, lon: -4, lat: 40, span: 16, dur: 1.4 },
      { at: t('#culture') - 0.2, lon: -62, lat: -30, span: 40, dur: 1.5 },
      { at: t('#flamenco') - 0.3, lon: -4, lat: 38, span: 14, dur: 1.4 },
      { at: t('#pins') - 0.3, lon: -70, lat: -20, span: 60, dur: 1.5 },
      { at: t('#heads') - 0.3, lon: -62, lat: -4, span: 26, dur: 1.4 },
      { at: t('#however') - 0.3, lon: -60, lat: -8, span: 80, dur: 1.5 },
      { at: t('#poor') - 0.3, lon: -66, lat: 6, span: 20, dur: 1.4 },
      { at: t('#dialects') - 0.4, lon: -4, lat: 40, span: 20, dur: 1.5 },
      { at: t('#laws') - 0.2, lon: -35, lat: 2, span: 112, dur: 1.7 },
      { at: t('#end') - 0.3, lon: -40, lat: 8, span: 96, dur: 1.7 },
    ], { beats: MARKS });                           // a zoom punch on every beat; the camera also drifts between flights
    const k = kit(s, cam);

    // 2. The map and what sits on it.
    basemap(s);

    // opening: all Spanish-speaking countries in a colour, then their flags
    k.fill(REGIONS.spanishAmerica, { color: '#f2a516', alpha: 0.85, at: 0.8, out: t('#spread') });
    k.fill(['Spain', 'Equatorial Guinea'], { color: '#f2a516', alpha: 0.85, at: 0.8, out: t('#spread'), mainland: false });
    k.fill(REGIONS.spanishAmerica, { flag: true, alpha: 0.9, at: t('#count') + 0.8, out: t('#culture') - 0.1 });
    k.fill('Spain', { flag: true, at: t('#spain'), out: t('#culture') - 0.1 });
    k.label('SPAIN', { lon: -4, lat: 40, dash: false, dy: -210, size: 80, at: t('#spain') + 0.3, out: t('#guinea') - 0.3 });
    k.fill('Equatorial Guinea', { flag: true, at: t('#guinea'), out: t('#culture') - 0.1, mainland: false });
    k.label('EQUATORIAL GUINEA', { lon: 10.3, lat: 1.7, dash: false, dy: -130, size: 56, at: t('#guinea') + 0.3, out: t('#latam') - 0.3 });
    k.fill('Spain', { flag: true, at: t('#spread'), out: t('#culture') - 0.1, mainland: false });
    k.fill('Eq. Guinea', { flag: true, at: t('#spread'), out: t('#culture') - 0.1, mainland: false });

    // power: red glow over the two continents the nation spans
    k.fill(['Brazil', 'Nigeria', 'Algeria', 'Dem. Rep. Congo'], { color: '#e0412f', alpha: 0.45, at: t('#spread') + 0.3, out: t('#people') });

    // numbers
    k.stat('500M', { at: t('#people') + 0.2, out: t('#gdp'), label: 'people', y: 0.5 });
    k.counter(915032679, { at: t('#gdp') - 0.2, out: t('#rank') + 0.2, y: 0.5, prefix: '$' });
    k.ranking([
      { label: 'United States', value: 29, color: '#7b8cff' },
      { label: 'China', value: 19, color: '#ff6b8a' },
      { label: 'Spanish Union', value: 7.5, color: '#ffa63d' },
      { label: 'Germany', value: 4.7, color: '#8a8f98' },
      { label: 'Japan', value: 4.1, color: '#3dff7a' },
    ], { at: t('#rank') - 0.2, out: t('#culture') - 0.1, y: 0.42 });

    // culture
    k.fill('Argentina', { color: '#9fd3ff', alpha: 0.7, at: t('#tango'), out: t('#flamenco') });
    k.emoji('🌹', { lon: -64, lat: -34, size: 150, at: t('#tango') + 0.3, out: t('#flamenco') });
    k.fill('Spain', { color: '#f2a516', alpha: 0.7, at: t('#flamenco'), out: t('#pins') });
    [[-76, 3], [-70, -10], [-68, -33], [-60, -24], [-90, 15], [-99, 20], [-72, 5], [-79, 8], [-66, -17], [-56, -33], [-78, -1], [-75, 20]]
      .forEach(([lon, lat], i) => k.pin({ lon, lat, at: t('#pins') + 0.15 * i, out: t('#however') }));
    [['🧔', -64, 8], ['🐵', -76, -4], ['👩🏽', -62, -10], ['🧑🏻', -57, -20]]
      .forEach(([e, lon, lat], i) => k.emoji(e, { lon, lat, size: 110, at: t('#heads') + 0.35 * i, out: t('#however') }));

    // inequality
    k.fill('Colombia', { color: '#3a3fe0', alpha: 0.7, at: t('#gap'), out: t('#dialects') });
    k.fill('Venezuela', { color: '#d7282f', alpha: 0.7, at: t('#gap') + 0.3, out: t('#dialects') });
    k.tag('LOWER INCOME', { lon: -67, lat: 0, size: 54, color: '#ffffff', at: t('#poor') + 0.2, out: t('#dialects') });
    k.fill('Spain', { color: '#f2a516', alpha: 0.7, at: t('#dialects') - 0.2, out: t('#laws') });
    k.tag('HIGH INCOME', { lon: -4, lat: 45, size: 54, color: '#3ddc6a', at: t('#dialects') + 0.1, out: t('#laws') });
    k.label('?', { lon: -35, lat: 2, dash: false, size: 260, at: t('#laws') + 0.6, out: t('#end') });

    // the end: all countries in the orange colour again, with outlines
    k.fill(REGIONS.spanishAmerica, { color: '#e8892b', alpha: 0.85, at: t('#end'), border: '#ffffff' });
    k.fill('Spain', { color: '#e8892b', alpha: 0.85, at: t('#end'), border: '#ffffff' });

    // 3. Screen-fixed layers last, so they sit on top of the map.
    k.grade();
    k.ambient();                                   // drifting specks and a slow light sweep
    // k.backgroundClip('background.mp4', { opacity: 0.25 });   // optional: your own looping video from assets/
    k.credit('@YourChannel');
    k.vignette();
    k.hook('What if *all Spanish countries* became one?', { at: 0.2 });
    k.twist(t('#however'));
    k.progress();
    k.follow('Follow for more');
    k.whatIfCaptions({ size: 64, maxChars: 12 });   // typing: 0.09 is a soft key click for every caption; 0 turns it off

    // 4. Sounds: the kit already adds a pop for pins and emoji, a click for flags and ranking bars, a ding for tags and the
    //    counter, a sparkle for a "?" and a soft key click for each caption. Here: a whoosh at each flight.
    [t('#count'), t('#spain'), t('#guinea'), t('#latam'), t('#culture'), t('#pins'), t('#however')].forEach((m) => s.sfx('whoosh', m - 0.3, { gain: 0.25 }));
  },
};

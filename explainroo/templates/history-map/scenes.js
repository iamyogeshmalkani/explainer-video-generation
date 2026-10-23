// History-map template. One continuous scene: the camera flies between places
// while countries light up, badges and labels appear, and the narration runs
// as short captions. Edit script.md first, then change the views and the
// overlays below so each one lands on a [#marker].
//
// Every helper is documented in lib/kit.js. Countries are named as in
// data/countries.js (REGIONS has ready-made groups).
import { setParallel, fly, basemap, kit, REGIONS } from './lib/kit.js';

setParallel(45); // 45 suits Europe and North America; use 0 for Africa or the tropics

export default {
  story(s) {
    const t = (marker) => s.time(marker);

    // 1. Camera: the first view is the opening shot; each next view is a flight
    //    that starts at `at` and lasts `dur` seconds. `span` = degrees of latitude in frame.
    const cam = fly(s, [
      { lon: -32, lat: 22, span: 130 },
      { at: t('#asia') - 0.3, lon: -70, lat: 20, span: 62, dur: 2.0 },
      { at: t('#waldsee') - 0.3, lon: 8, lat: 47, span: 26, dur: 2.4 },
      { at: t('#america') - 0.4, lon: -58, lat: -14, span: 64, dur: 2.6 },
      { at: t('#dropped') - 0.3, lon: -4, lat: 41, span: 24, dur: 2.2 },
      { at: t('#mercator') - 0.3, lon: -78, lat: 16, span: 124, dur: 2.8 },
    ]);
    const k = kit(s, cam);

    // 2. The map, then everything that sits on it.
    basemap(s);

    k.label('Part of Asia?', { lon: -72, lat: 19, dy: -190, size: 52, at: t('#asia') + 0.8, out: t('#waldsee') - 0.4 });

    k.medallion({ lon: 6.95, lat: 48.3, text: 'W', r: 78, at: t('#waldsee') + 0.6, out: t('#america') - 0.5 });
    k.label('Martin Waldseemüller', { lon: 6.95, lat: 48.3, dx: 0, dy: 190, size: 44, at: t('#waldsee') + 0.9, out: t('#america') - 0.5 });

    k.fill(REGIONS.southAmerica, { color: '#e8a33d', alpha: 0.72, at: t('#america') + 0.2 });
    k.label('AMERICA', { lon: -60, lat: -10, dash: false, size: 96, at: t('#america') + 0.5, out: t('#dropped') - 0.4 });
    k.medallion({ lon: -47, lat: -22, text: 'V', r: 78, at: t('#vespucci'), out: t('#dropped') - 0.5 });
    k.label('Amerigo Vespucci', { lon: -47, lat: -22, dy: 190, size: 44, at: t('#vespucci') + 0.2, out: t('#dropped') - 0.5 });

    k.fill('Spain', { flag: true, at: t('#dropped') + 0.4, out: t('#mercator') - 0.4 });
    k.label('Spain rejected the name', { lon: -3.7, lat: 40.4, dy: 150, size: 46, color: '#1b1308', shadowColor: 'rgba(255,255,255,0.7)', dash: false, at: t('#dropped') + 0.9, out: t('#mercator') - 0.4 });

    k.fill([...REGIONS.southAmerica, ...REGIONS.northAmerica], { color: '#e8a33d', alpha: 0.72, at: t('#mercator') + 0.4 });
    k.label('AMERICA', { lon: -84, lat: 12, dash: false, size: 110, at: t('#mercator') + 0.7 });

    // 3. Screen-fixed layers last, so they sit on top of the map.
    k.vignette();
    k.title('The name “America”', { at: 0.2 });
    k.year('1507', { at: t('#waldsee') + 0.2, out: t('#america') - 0.2 });
    k.card({ title: 'Universalis Cosmographia', sub: 'World map, 1507', at: t('#map') + 0.2, out: t('#america') - 0.3, y: 1095 });
    k.year('1513', { at: t('#dropped') + 0.2, out: t('#mercator') - 0.2 });
    k.year('1538', { at: t('#mercator') + 0.2 });
    k.flash(t('#mercator') + 1.2);
    k.captions();

    // 4. Sounds: a whoosh for each flight, a chime for each year.
    [t('#asia'), t('#waldsee'), t('#america'), t('#dropped'), t('#mercator')].forEach((m) => s.sfx('whoosh', m - 0.3, { gain: 0.3 }));
    [t('#waldsee') + 0.2, t('#dropped') + 0.2, t('#mercator') + 0.2].forEach((m) => s.sfx('chime', m, { gain: 0.25 }));
  },
};

// The Alaska Purchase, built from the history-map template.
import { setParallel, fly, basemap, kit } from './lib/kit.js';

setParallel(50);
const ALASKA = [-170, 50, -129, 73]; // [lonMin, latMin, lonMax, latMax]: picks Alaska out of the USA

export default {
  story(s) {
    const t = (m) => s.time(m);
    const cam = fly(s, [
      { lon: -149, lat: 63, span: 50 },
      { at: t('#russia') - 0.3, lon: -152, lat: 63, span: 50, dur: 2.0 },
      { at: t('#defend') - 0.3, lon: -128, lat: 60, span: 72, dur: 2.2 },
      { at: t('#deal') - 0.4, lon: -77, lat: 39, span: 12, dur: 2.8 },
      { at: t('#gold') - 0.3, lon: -157, lat: 66, span: 36, dur: 3.0 },
      { at: t('#state') - 0.3, lon: -150, lat: 63, span: 50, dur: 2.0 },
    ]);
    const k = kit(s, cam);
    basemap(s);

    // 1. The size and the price
    k.fill('United States of America', { within: ALASKA, flag: true, at: t('#size') + 0.3, out: t('#russia') - 0.2 });
    k.label('Alaska', { lon: -152, lat: 64, dash: false, plate: true, size: 96, at: t('#size') + 0.6, out: t('#size') + 2.9 });
    k.card({ title: '2¢ an acre', sub: '586,412 square miles', at: t('#size') + 3.2, out: t('#russia') - 0.3, y: 1095 });

    // 2. It belonged to Russia
    k.fill('United States of America', { within: ALASKA, flag: true, flagOf: 'Russia', at: t('#russia') + 0.3, out: t('#deal') - 0.5 });
    k.label('Russian America', { lon: -152, lat: 64, dash: false, plate: true, size: 64, at: t('#russia') + 0.6, out: t('#defend') - 0.3 });

    // 3. Why Russia sold
    k.fill('Canada', { color: '#2b6cb0', alpha: 0.4, mainland: false, at: t('#defend') + 0.4, out: t('#deal') - 0.5 });
    k.label('British North America', { lon: -118, lat: 58, dash: false, plate: true, size: 50, at: t('#defend') + 0.7, out: t('#deal') - 0.5 });
    k.card({ title: 'Crimean War', sub: 'Russia needed money', at: t('#defend') + 3.4, out: t('#deal') - 0.6, y: 1095 });

    // 4. The deal
    k.medallion({ lon: -75.2, lat: 38.9, text: 'S', r: 78, at: t('#deal') + 0.6, out: t('#price') - 0.3 });
    k.label('William Seward', { lon: -75.2, lat: 38.9, dy: 175, size: 46, at: t('#deal') + 0.9, out: t('#price') - 0.3 });
    k.medallion({ lon: -79, lat: 38.9, text: 'E', r: 78, at: t('#deal') + 1.2, out: t('#price') - 0.3 });
    k.label('Eduard de Stoeckl', { lon: -79, lat: 38.9, dy: -175, size: 46, at: t('#deal') + 1.5, out: t('#price') - 0.3 });
    k.card({ title: '$7.2 million', sub: 'signed March 30', at: t('#price') + 0.2, out: t('#senate') - 0.1, y: 1095 });
    k.card({ title: 'Senate vote', sub: '37 to 2', at: t('#senate') + 0.1, out: t('#folly') - 0.1, y: 1095 });
    k.card({ title: 'Seward’s Folly', sub: 'what some critics called it', at: t('#folly') + 0.1, out: t('#gold') - 0.3, y: 1095, tilt: 3 });

    // 5. Gold, oil, statehood
    k.label('Gold', { lon: -165.4, lat: 64.5, dy: -170, size: 64, at: t('#gold') + 0.8, out: t('#state') - 0.4 });
    k.label('Oil', { lon: -148.4, lat: 70.3, dy: 170, size: 64, at: t('#oil') + 0.2, out: t('#state') - 0.4 });
    k.fill('United States of America', { within: ALASKA, flag: true, at: t('#state') + 0.3 });
    k.label('49th state', { lon: -152, lat: 64, dash: false, plate: true, size: 84, at: t('#state') + 0.6, out: t('#largest') - 0.1 });
    k.label('Largest state', { lon: -152, lat: 64, dash: false, plate: true, size: 84, at: t('#largest') + 0.4 });

    k.card({ title: '2¢ an acre', sub: 'where it began', at: t('#cents') + 0.1, y: 1095, tilt: -3 });

    k.vignette();
    k.title('The Alaska Purchase', { at: 0.2 });
    k.year('1867', { at: t('#size') + 0.2, out: t('#gold') - 0.3 });
    k.year('1890s', { at: t('#gold') + 0.2, out: t('#oil') - 0.1 });
    k.year('1968', { at: t('#oil') + 0.2, out: t('#state') - 0.2 });
    k.year('1959', { at: t('#state') + 0.2 });
    k.flash(t('#state') + 1.0);
    k.captions();

    [t('#russia'), t('#defend'), t('#deal'), t('#gold'), t('#state')].forEach((m) => s.sfx('whoosh', m - 0.3, { gain: 0.3 }));
    [t('#size') + 0.2, t('#gold') + 0.2, t('#oil') + 0.2, t('#state') + 0.2].forEach((m) => s.sfx('chime', m, { gain: 0.25 }));
  },
};

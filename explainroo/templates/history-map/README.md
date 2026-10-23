# history-map: a satellite-map history template

Short history videos (30 to 60 seconds) in the style of "map explainers": a
satellite Earth, a camera that flies between places, countries filled with
colours or flags, round badges, dashed callouts, big year tags, a flash for the
big moment, and the narration as a few white words at a time. The voice,
music, sound effects, timing and rendering all come from explainroo.

The sample in this folder tells where the name "America" comes from. Copy the
folder, change the script and the views, and render.

## Make a video from it

```bash
cd explainroo
scripts/new-video.sh history-map my-topic        # copies this template to videos/my-topic
# edit videos/my-topic/script.md and scenes.js, then:
node bin/explainroo.js voice  videos/my-topic
node bin/explainroo.js check  videos/my-topic
node bin/explainroo.js sheet  videos/my-topic --every 2.5
node bin/explainroo.js render videos/my-topic
node bin/explainroo.js verify videos/my-topic
```

Or give an AI coding agent this prompt (it reads `TEMPLATE.md` for the rules):

```text
Make a 40 second history video about [topic] with explainroo.
Copy the history-map template (scripts/new-video.sh history-map <name>),
read templates/history-map/TEMPLATE.md and AGENTS.md, and follow them.
```

## What is in the folder

| File | What it is |
|---|---|
| `script.md` | the narration; one scene, with a `[#marker]` where something should happen |
| `scenes.js` | the camera views and what appears on the map, tied to the markers |
| `video.json` | size (`vertical`), voice, music, `"captions": false` (the kit draws its own) |
| `look.json` | the colours and fonts (only the music and sounds matter much here) |
| `lib/kit.js` | the map kit: `fly`, `basemap`, and `kit(s, cam)` with `fill`, `label`, `medallion`, `title`, `year`, `card`, `flash`, `vignette`, `captions` |
| `lib/flags.js` | flags drawn in code; add a country with one line |
| `data/countries.js` | country outlines (Natural Earth, 1:50m, today's borders) |
| `assets/basemap.jpg` | the satellite picture (NASA) |

## The kit in one minute

```js
import { setParallel, fly, basemap, kit, REGIONS } from './lib/kit.js';
setParallel(45);                                   // 45 for Europe or the US, 0 for Africa

story(s) {
  const t = (m) => s.time(m);                      // time of a [#marker]
  const cam = fly(s, [
    { lon: -32, lat: 22, span: 130 },              // opening view (span = degrees of latitude in frame)
    { at: t('#next') - 0.3, lon: 8, lat: 47, span: 26, dur: 2.4 },   // a flight
  ]);
  const k = kit(s, cam);
  basemap(s);
  k.fill('France', { flag: true, at: t('#next') });          // a country, with its flag
  k.fill(REGIONS.southAmerica, { color: '#e8a33d' });        // a group, in a colour
  k.label('Paris', { lon: 2.35, lat: 48.85, dy: -180, at: t('#next') });   // dashed callout
  k.medallion({ lon: 2.35, lat: 48.85, text: 'N' });         // badge; or image: 'napoleon.jpg'
  k.vignette(); k.title('Title'); k.year('1914', { at: t('#next') }); k.captions();   // last
}
```

Layout zones on the `vertical` size (pixels of 1920): the title sits at about 420, the
year at 600, the camera's point of interest at about 880 (set with `fly(..., { focusY })`),
the captions at about 1150, and `card()` at `y: 1095` below them. Keep labels within about
180 px of the focus so nothing collides.

Spans to start from: the whole Atlantic 130, the Mediterranean 50, western
Europe 26, one country 12 to 20, a city region 5.

## Limits, so you know before you start

- The picture is a flat map with a moving camera, not a 3D globe, so there is
  no tilted horizon like the original reference videos.
- Country shapes are **today's borders**. Historical borders (1914 empires,
  for example) are not in the data. Fill today's countries that match, use
  labels and badges, or add your own polygons. Treat disputed borders with care.
- Flags exist for about 25 countries; others fill with a flat colour.
- Portraits for badges are not included. Put your own images in `assets/`
  (only images you have the right to use) and pass `image: 'name.jpg'`.
- The satellite picture is 10800 px wide; zoomed in beyond about span 8 it
  gets soft. `fill(..., { mainland: false })` keeps far islands and overseas
  territories; by default a country shows only its main land (12 degrees around
  the biggest piece).

## Credits

Satellite picture: NASA Earth Observatory, Blue Marble Next Generation with
Topography and Bathymetry (public domain; credit NASA). Country outlines:
Natural Earth (public domain) through the `world-atlas` package (ISC).

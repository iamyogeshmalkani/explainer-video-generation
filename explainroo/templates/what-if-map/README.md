# what-if-map: "What if ...?" satellite-map explainers

English-only vertical shorts (40 to 55 seconds, fast paced) in the style of "What if all Spanish countries united?": a dark
satellite Earth that the camera keeps flying across, countries filled with their flags or one colour,
red pins, emoji faces, a green rolling counter, ranking bars, a white paper scene for a podium, and
small white captions with a black outline, 1 to 3 words at a time. The voice, music and sounds all
come from explainroo.

It is the `history-map` kit plus extra helpers, so the sample here is a full, working video.

## Make a video

```bash
cd explainroo
scripts/new-video.sh what-if-map my-topic
# edit videos/my-topic/script.md and scenes.js, then:
node bin/explainroo.js voice  videos/my-topic
node bin/explainroo.js check  videos/my-topic
node bin/explainroo.js sheet  videos/my-topic --every 2.5
node bin/explainroo.js render videos/my-topic
node bin/explainroo.js verify videos/my-topic
```

Or tell an agent:

```text
Make a 45 second "What if ..." map video about [topic]. Copy the what-if-map template
(scripts/new-video.sh what-if-map <name>), read templates/what-if-map/TEMPLATE.md and AGENTS.md, follow them.
```

## The kit (`lib/kit.js`)

Everything from `history-map` (`fly`, `basemap`, `fill`, `label`, `medallion`, `title`, `year`, `card`, `flash`, `vignette`)
plus:

| Helper | What it draws |
|---|---|
| `k.pin({ lon, lat, at, out })` | a red map pin that drops onto a place |
| `k.emoji('🌹', { lon, lat, size, at, out })` | a big emoji that pops on a place |
| `k.tag('RICH', { lon, lat, color, at })` | a small glowing serif tag on the map |
| `k.counter(7000000000, { at, dur, prefix })` | a green glowing number that rolls up |
| `k.ranking([{ label, value, color }], { at, out })` | horizontal bars that grow one after another |
| `k.paper({ at, out }, (ctx, p) => ...)` | a white embossed-look scene that covers the map; draw silhouettes and a podium inside |
| `k.whatIfCaptions({ size, lit })` | the outlined captions, each chunk pops in, numbers in yellow (use this, not `k.captions()`) |
| `k.hook('What if *X*?')` | the big on-screen hook for the first 3 s, starred words yellow, with a thud |
| `k.twist(t('#however'))` | the turn: riser, red flash, thud |
| `k.stat(500000000, { label })` | one big number that counts up on a dark pill |
| `k.progress()`, `k.follow('Follow for more')`, `k.grade()` | progress bar at the top, follow pill for the last 3 s, film colour grade |
| `fly(s, keys, { beats, drift })` | zoom punch + shake on each beat; slow drift between flights (on by default) |
| `k.river`, `k.ridge`, `k.region`, `k.flow`, `k.coastFlood`, `k.rain`, `k.tint`, `k.thermo`, `k.disc` | nature and geography: rivers that flow and dry, mountain ridges, a desert polygon, moving arrows (wind, people), a sea creeping inland, rain, a colour wash, a thermometer, a shrinking lake (`lib/india.js` has India shapes) |
| `k.credit('@Channel')` | the faint channel name at the top |

`REGIONS.spanishAmerica` and more flags (Chile, Bolivia, Ecuador, Uruguay, Paraguay, Equatorial Guinea) were added.
For another country group, add a list to `REGIONS` and a line to `FLAGS` in `lib/flags.js`.

## Sound (matched to the reference video)

The reference is voice-forward at about -20 LUFS with no pauses, a very quiet bed under the voice, and short
whooshes at the flights. Here: Kokoro `am_michael` (clear male voice), `pace` 1.15, `speed` 1.05, `"music": { "style": "calm", "volume": 0.1 }`, `"sfx": "minimal"`
with a whoosh at each flight, a rising sound before the counter and a chime on the ranking. `loudness` is -16 so it
sits at normal short-video level; set `-20` to match the reference exactly. I could only measure the reference's
loudness and spectrum, not hear it, so listen once and change `music.volume` if needed.

## Limits

- Flat map with a moving camera, not a 3D globe (the reference tilts slightly).
- Borders are today's. Disputed places: stay neutral.
- Emoji use the system emoji font (Apple Color Emoji on a Mac).
- Credit NASA (basemap) and Natural Earth in the description.

## Frames beyond the map (`lib/frames.js`)

Studied from a "What if every Indian state was its own country?" short: it is not only a map. It cuts away to cartoon
frames (a street with a border post, a balance scale), and the map itself is full of little props. `frames(s, cam)` adds them:

```js
import { frames } from './lib/frames.js';
const f = frames(s, cam);          // next to kit(s, cam); call the screen-fixed ones after k.vignette()
```

| Helper | What it draws |
|---|---|
| `f.headline('28 STATES.\n28 PASSPORTS.', { at, out, sub })` | big yellow cartoon lettering at the top (the video's title card, a place name, "PEOPLE") |
| `f.person({ x, y, height, mood, hold, from, at, out })` | a little cartoon person; `mood` neutral / shock / happy / angry / worried; `hold: true` raises a passport; `from` slides them in |
| `f.backdrop('street' \| 'sky', { at, out })` | a full-frame cut-away that whips in with motion blur and a swipe |
| `f.borderScene({ at, out, sign, sub, officerAt, barrierAt, passportAt, stampAt, stampText })` | street, sign, booth, officer, barrier, passport and stamp (the "bring your passport" gag) |
| `f.scale({ left, right, at, out, tipAt, title })` | a balance scale with two outlines on the pans (a state or a country) that tips toward the heavier one, with values |
| `f.states(list, { at, out, flags, crack, colors })` | states as a raised game board, a small flag in each; `crack: true` flashes fault lines first, then the pieces drop into colour |
| `f.flagPole({ lon, lat, at, out, tricolor })` | a flag rising on a pole at a place |
| `f.stamp('INDEPENDENT!', { lon, lat, at, out })` | a rubber stamp that slams down and leaves its word (thud) |
| `f.calendar({ lon, lat, at, weeks })` | week cards piling up (WEEK 1 ... WEEK 6) |
| `f.swarm(region, { n, at, dur, label, final })` | hundreds of crowns (or coins) scattered inside a region, with a counter ("500+ KINGDOMS") |
| `f.bubbles(f.scatter('India', 24), { text: 'NO!' })` | speech bubbles popping across a region; `text` can be an array (one word per bubble: greetings in different scripts) |
| `f.speech('नमस्ते', { x, y, tail, at, out })` | a cartoon speech bubble on the screen (not the map); any script the font can draw |
| `f.trophy({ lon, lat, at })`, `f.confetti({ at })` | a gold cup and confetti shot from both sides |
| `f.yearRewind(2025, 1947, { at, dur })` | a year that counts down in steps, with ticks |

Every helper plays its own sound (stamp thud, pop per bubble, tick per card, chime on the trophy, swipe on a cut-away).
`videos/what-if-every-state-own-country` is a full sample (the scenes and script are in `examples/india-states/` too).

## India: use the official map

India's outline comes from `data/india-states.js` (Survey of India state map via datameet, CC BY 4.0): Jammu and Kashmir
(Ladakh included) with Pakistan-occupied Kashmir, Gilgit-Baltistan and Aksai Chin, Arunachal Pradesh whole, plus the islands.
`k.fill('India')`, `REGIONS.indiaStates`, `REGIONS.india28` and every state by name (`'Kerala'`, `'Uttar Pradesh'`) use it.
The world-atlas data in `data/countries.js` draws India with de facto lines, so never use its India, and do not fill
Pakistan or China on an India map (their fills would cover parts of India's outline). Videos made before this change that
fill 'India' from the old data show a wrong map and should be re-made.

## More props and cut-aways (`lib/props.js`, added to `frames()`)

Ten "What if India ...?" shorts (in `examples/`) use these. Each one opens on the doodle: a cartoon person with a prop in a
themed cut-away and a big yellow title, then alternates cut-aways with one or two beats on the official India map.

| Helper | What it draws |
|---|---|
| `f.backdrop('pump' \| 'station' \| 'shop' \| 'stadium' \| 'smog' \| 'space' \| 'street' \| 'sky')` | cut-away scenes; `stadium` takes `{ emptyAt }` (the crowd leaves), `smog` takes `{ clearAt, clearDur }` (grey sky turns blue, the Red Fort shows) |
| `f.person({ hold: 'passport' \| 'phone' \| 'can' \| 'ticket' \| 'bat' \| 'sign', outfit: { shirt, tie, pants, hair, skin, long, vest, mask } })` | the person; change `outfit` for a shopkeeper, mechanic, child |
| `f.emoji(char, { x, y, size, to, cross })`, `f.emojiRow([...])` | emoji props that pop in, slide to a spot (`to`), or get a red X (`cross`) |
| `f.big('85%', { sub })`, `f.banner('CLOSED')`, `f.cross()`, `f.arrowUp({ down })` | a giant number, a slammed plate, a red X, a bouncing arrow |
| `f.queue({ items, n })` | a line of emoji (cars, people) that keeps growing |
| `f.pump({ dryAt })`, `f.phone({ screens })`, `f.qr()`, `f.clock()`, `f.train()` | a petrol pump that runs dry, a phone (pay / failed / ok / no signal / chat), a QR board, a racing clock, a train |
| `f.bars({ rows, grow })`, `f.countUp(from, to)`, `f.rocket({ launchAt })`, `f.planet()` | bars that grow (one can climb to another), a rolling number, a launching rocket, a planet |
| `f.silhouette('India', { x, y, w })` | a country or state outline on a cut-away, using the official India outline |
| `f.crowd({ lon, lat, r0, r1, lon1, lat1 })` | dots that fill a circle on the map and spread (a city swallowing its neighbours) |
| `addRegion('Mumbai', [[lon, lat], ...])` (from `kit.js`) | your own outline, so `k.fill('Mumbai')` and `f.swarm('Mumbai')` work |

Keep one idea per marker, give every cut-away an `out`, and let items vanish with it (they do by default). Put the title card first.
The map is blurry when you zoom in closer than about 5 degrees; darken it with `k.tint('#08182b', { alpha: 0.8 })` and let the
dots and polygons carry the picture.

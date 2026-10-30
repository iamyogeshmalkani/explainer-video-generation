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

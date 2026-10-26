# tech-explainer: how software works, one idea at a time

A vertical (9:16) video for tech topics: neon outlined boxes on charcoal (green by default, or any
color you choose, see Colors), bold capitals, key words in solid accent-colored blocks, small icons, an app card, a code card, and
dashed lines that flow between things. Each idea pops in on the word the voice says,
and the screen is cleared before the next idea. Everything is drawn on your computer,
so it needs no pictures, no clips and no API key.

The sample is "An API call, step by step" (33 seconds). It is a working video: copy
it, then replace the words and the drawings.

The style was studied from a short "MVVM in a nutshell" video (720 x 1280, 39 seconds):
background `#1a1a1a`, green `#00ef5d`, pink code keys `#e0185f`, a heavy rounded
typeface, content in the upper two thirds. Only the look was taken; the words,
pictures and layout here are our own.

## Make a video

```bash
cd explainroo
scripts/new-video.sh tech-explainer my-topic          # copies this template to videos/my-topic
# 1. edit videos/my-topic/script.md   (the narration, with [#markers] where things appear)
# 2. edit videos/my-topic/scenes.js   (what appears on each marker; see the kit below)
node bin/explainroo.js voice  videos/my-topic
node bin/explainroo.js check  videos/my-topic
node bin/explainroo.js sheet  videos/my-topic --every 2     # look at the whole video
node bin/explainroo.js render videos/my-topic
node bin/explainroo.js verify videos/my-topic
```

Or give an AI coding agent this prompt (it follows `TEMPLATE.md`):

```text
Make a 40 second tech explainer about [topic] with explainroo. Copy the tech-explainer
template (scripts/new-video.sh tech-explainer <name>), read templates/tech-explainer/TEMPLATE.md
and AGENTS.md, write the script and scenes, and check everything with still and sheet.
```

## The kit (`lib/kit.js`)

`const k = kit(s);` then call these. `x` and `y` are fractions (x of the safe width, y of
the content band at the top; the bottom third stays free for app buttons). Every call
takes `at` (seconds, a spoken word or a `'#marker'`) and `out`; `move: [{ at, x, y, dur }]`
slides it somewhere else.

| Call | What it draws |
|---|---|
| `k.title('API', { y, wave })` | a big title; the letters drop in one after another |
| `k.tag('[API] menu', { id, icon, x, y, size, w })` | an outlined box with a label. `[x]` is a solid accent-colored block, `*x*` is accent-colored text. Icons: `server`, `db`, `cloud`, `user`, `lock`, `bolt`, `check`, `phone` |
| `k.phone({ id, app, rows, picture, x, y })` | the app card: a notch, a logo with the app name, rows of text `{ text, meta, at }`, an optional picture (`true` for a placeholder or an `assets/` path) |
| `k.code(lines, { id, title, size, w })` | a code or JSON card. `"key": value` lines get a pink key; lines can be `{ text, at }`. Text shrinks to fit |
| `k.link(a, b, { pair, label })` | dashed lines that flow between two boxes (by `id`); `pair` draws one line each way |
| `k.lines(list, { y, stagger })` | lines of text that blur in one after another |
| `k.tap({ x, y, at })` | a finger that taps a spot and leaves a ripple |
| `k.sticker('rocket', { x, y, at, out, size, color, shape, rotate, from, label })` | a die-cut sticker with a white edge and a soft shadow that pops in and catches a shine (see Stickers) |

Draw things in the order you want them stacked. Give every group of elements the same
`out` (the marker where the next idea starts) so the screen clears like the reference.

## Stickers

The backgrounds stay plain, so a few stickers give the video some life. A sticker is drawn on your
computer, like everything else here: a colored badge with a white die-cut edge, a stroked icon
(any of the 1,800+ icons, search with `explainroo icons <word>`), a tilt, a pop-in and one shine.

```js
k.sticker('rocket', { x: 0.88, y: 0.1, at: '#s2', out: '#s3', color: 'yellow', rotate: 9 });
k.sticker('circle-x', { label: '404', shape: 'burst', color: 'red', x: 0.2, y: 0.68, from: 'slap', at: '#s10', out: '#r' });
k.sticker(null, { label: 'New', shape: 'pill', color: 'pink', x: 0.8, y: 0.5, at: '#s5' });   // text only
```

| Option | Meaning |
|---|---|
| `x`, `y`, `at`, `out`, `move`, `id` | as for every kit call |
| `size` | the badge width in percent of the frame (17) |
| `color` | `accent` (default), `key`, `yellow`, `pink`, `cyan`, `orange`, `purple`, `red`, `blue`, `white` or `'#rrggbb'`; the icon is dark or white, whichever reads better (`ink` overrides) |
| `shape` | `circle` (default), `square`, `burst` (a starburst, good for 404 or NEW) or `pill` (text only) |
| `label` | text on the sticker; with an icon it sits in a black tab over the lower edge (`labelColor` changes the tab) |
| `rotate` | tilt in degrees (-6) |
| `from` | `pop` (default, overshoots) or `slap` (lands from large, fast) |

Use one or two per screen: put them in a gap or at a corner, partly over the corner of a card is fine,
and keep them off the words. Give each the same `out` as the rest of its screen. They make the same soft
pop as a tag; pass `sfx: false` to silence one.

## Colors

One accent color does all the work (outlines, icons, highlight blocks), plus a second
color for the keys in code cards. Pick a palette in `scenes.js`:

```js
const k = kit(s, { palette: 'orange' });   // green (default), cyan, blue, purple, pink, orange, yellow, red
const k = kit(s, { palette: { accent: '#ff8a1f', key: '#4cc9ff' } });   // or your own two colors
```

The palettes are listed at the top of `lib/kit.js` (`PALETTES`). If you turn captions on,
also change `colors.green` in `look.json` to the same accent, because captions use the look,
not the kit.

## Settings

`video.json` turns captions off (the reference has none; set `"captions": true` to add
them), keeps the camera still, uses the `tech` music at 0.45 and the Fenrir voice.
Change the voice with `explainroo voices`. The font is Outfit (SIL Open Font License,
`assets/fonts/OFL-Outfit.txt`), loaded from `assets/fonts/`.

## Limits

- The reference moves things around the screen (an app card shrinks and slides while a
  server appears). The kit can slide an element with `move`, but it has no scene
  morphs, so most ideas here replace each other instead of transforming.
- There is no nutshell-style illustration and no character art; use pictures from the
  `story-shots` workflow, or draw shapes with `s.draw`, if a video needs them.
- The speech check is weaker on acronyms and numbers ("A P I", "four oh four"). Respell
  them in `script.md` as `{API|A P I}` and listen to the result.

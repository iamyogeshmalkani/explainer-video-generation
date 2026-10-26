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

Draw things in the order you want them stacked. Give every group of elements the same
`out` (the marker where the next idea starts) so the screen clears like the reference.

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

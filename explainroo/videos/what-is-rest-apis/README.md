# tech-explainer: how software works, one idea at a time

A vertical (9:16) video for tech topics on a plain charcoal background. **Real pictures pop in**
(a phone, a server, a shield, a package), each cut out with a white sticker edge, and **the code draws
the connections between them**: dashed lines that flow, with small labels. Key words sit in solid
accent-colored blocks (green by default, or any color you choose, see Colors). Each idea pops in on the
word the voice says, and the screen is cleared before the next idea.

The pictures are made by an image model (`shots.js`, see Pictures); everything else is drawn on your
computer. The older outlined-box kit (`tag`, `phone`, `code`) is still there if a video needs a box,
and needs no pictures.

The sample is "An API call, step by step" (33 seconds), built only from pictures and links. It is a
working video: copy it, then replace the words, the pictures and the connections.

The style was studied from a short "MVVM in a nutshell" video (720 x 1280, 39 seconds):
background `#1a1a1a`, green `#00ef5d`, pink code keys `#e0185f`, a heavy rounded
typeface, content in the upper two thirds. Only the look was taken; the words,
pictures and layout here are our own.

## Make a video

```bash
cd explainroo
scripts/new-video.sh tech-explainer my-topic          # copies this template to videos/my-topic
# 1. edit videos/my-topic/script.md   (the narration, with [#markers] where things appear)
# 2. edit videos/my-topic/shots.js    (one line per picture; delete the sample pictures you do not reuse)
# 3. edit videos/my-topic/scenes.js   (what appears on each marker; see the kit below)
node videos/my-topic/scripts/shot-images.mjs videos/my-topic --cloudflare   # the pictures (or --pollinations, --local)
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
| `k.pic('server', { id, x, y, w, at, out, label, from, rotate })` | **a real picture** from `assets/server.jpg`, cut out, with a white edge. `label` is text under it. `id` lets `link` connect it (see Pictures) |
| `k.title('API', { y, wave })` | a big title; the letters drop in one after another |
| `k.tag('[API] menu', { id, icon, x, y, size, w })` | an outlined box with a label. `[x]` is a solid accent-colored block, `*x*` is accent-colored text. Icons: `server`, `db`, `cloud`, `user`, `lock`, `bolt`, `check`, `phone` |
| `k.phone({ id, app, rows, picture, x, y })` | the app card: a notch, a logo with the app name, rows of text `{ text, meta, at }`, an optional picture (`true` for a placeholder or an `assets/` path) |
| `k.code(lines, { id, title, size, w })` | a code or JSON card. `"key": value` lines get a pink key; lines can be `{ text, at }`. Text shrinks to fit |
| `k.link(a, b, { pair, label, block })` | dashed lines that flow between two pictures or boxes (by `id`); `pair` draws one line each way; `label` is a small text on the line (`block: true` puts it in an accent block) |
| `k.lines(list, { y, stagger })` | lines of text that blur in one after another |
| `k.tap({ x, y, at })` | a finger that taps a spot and leaves a ripple |
| `k.sticker('rocket', { x, y, at, out, size, color, shape, rotate, from, label })` | a die-cut sticker with a white edge and a soft shadow that pops in and catches a shine (see Stickers) |

Draw things in the order you want them stacked. Give every group of elements the same
`out` (the marker where the next idea starts) so the screen clears like the reference.

## Pictures

`k.pic('server', { ... })` shows `assets/server.jpg` (or `.png`, `.webp`). The picture is cut out of its plain white
background when the video is drawn and given a white die-cut edge, so no background-removal tool is needed. `w` is the
width of the box the picture must fit in, as a fraction of the safe width (a tall phone is limited in height too).
A missing file shows a labelled placeholder, so you can plan the layout before the pictures exist.

```js
k.pic('phone',  { id: 'app', x: 0.5, y: 0.2,  w: 0.4,  label: 'App',    at: 0,     out: '#s3' });
k.pic('server', { id: 'srv', x: 0.5, y: 0.8,  w: 0.42, label: 'Server', at: 'server', out: '#s3' });
k.link('app', 'srv', { pair: true, label: 'API', block: true, at: '#s2', out: '#s3' });   // the code draws the connection
```

`from` is `pop` (default), `slap`, `bottom`, `top`, `left` or `right`. Put pictures side by side or in a small triangle
rather than in a tall stack: a link needs room to show (about a quarter of a picture's size between two joined pictures).
Plain text next to pictures: `k.lines(['[GET] /weather'], { y, at })`.

**Making the pictures.** `shots.js` lists them (`file`, a one-object `prompt`) with one shared `STYLE` (glossy 3D clay
icons on a plain white background). Then:

```bash
node scripts/shot-images.mjs <project-folder> --cloudflare      # hosted FLUX, about 2 seconds each, needs CLOUDFLARE_* in .env
node scripts/shot-images.mjs <project-folder> --pollinations    # hosted FLUX, needs POLLINATIONS_API_KEY
node scripts/shot-images.mjs <project-folder> --local           # on this computer, free, slower
```

Prompts are sent to the service you choose. **Open every picture afterwards**: models draw gibberish text on screens
and boxes ("DIT delivery"), so say "nothing printed on it", and remake any wrong one (delete the file, run again with
`--only <n>`). Keep objects colorful: a white or very pale object is cut away together with the white background
(a white envelope and a white cloud both vanished until they were made blue).

## Stickers

Small vector badges for accents next to the pictures (they need no files):

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

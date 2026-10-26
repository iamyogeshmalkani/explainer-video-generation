# sticker-pop

Short vertical explainers where stickers, paper notes, number chips and bold words **pop in one
after another, each with a click**, on flat colored scenes that push each other off the screen.
Made from a study of a 10-second "Nobel Prize" short: a yellow scene with a dynamite sticker, a
teal blueprint scene with a gold medal, a cream scene with a portrait, a paper tag and a year chip,
then a banner with weapons and barrels.

The sample in this folder is *Alfred Nobel: the man behind the prize* (about 35 seconds).

## Make a video

```sh
scripts/new-video.sh sticker-pop my-video          # copies this template to videos/my-video
# 1. edit videos/my-video/script.md   (the words, with a [#marker] where something should pop)
# 2. edit videos/my-video/shots.js    (one line per sticker picture)
# 3. edit videos/my-video/scenes.js   (what pops on each marker)
node bin/explainroo.js voice videos/my-video
node videos/my-video/scripts/shot-images.mjs videos/my-video --pollinations   # the sticker pictures (or --local)
node bin/explainroo.js check videos/my-video
node bin/explainroo.js sheet videos/my-video --every 1.5
node bin/explainroo.js render videos/my-video && node bin/explainroo.js verify videos/my-video
```

## The kit (`lib/pop.js`)

Each scene is `k.scene({ look, at, out }, () => { ... })`. Inside it:

| Call | What pops |
|---|---|
| `title(text)` | a bold outlined word, bounces in |
| `heading(text)` | bold lines that blur in one by one, a click each |
| `line(text)` | a plain sentence that fades up |
| `sticker(name, { from })` | a picture cut out of its white background, white sticker edge; `from` is `pop`, `bottom`, `top`, `left` or `right` |
| `note(text)` | a torn paper tag |
| `chip(text)` | a small rounded label (a year, a number, a word) |
| `banner(text)` | a torn paper strip that slides up |
| `arrow(from, to)` | a dotted curved arrow that draws itself |
| `eyes()`, `thought()` | googly eyes and a thought bubble that stay alive |
| `burst()`, `sparks()`, `ping()` | stars or rays, flying sparks, a pulsing click ring |

Looks: `sun` (yellow), `blueprint` (teal with dotted lines and rings), `paper` (cream). Add
`color: '#rrggbb'` to a scene to use another background. The header of `lib/pop.js` lists every
option.

## Pictures

Stickers are made by the picture model on a **plain white background** and cut out when the
video is drawn: no background-removal tool is needed. Keep each prompt to ONE object. Open every
picture afterwards: models add shadows, extra objects and fake text. A grey shadow under the
object is removed automatically.

## Sound

Sounds used to play on every pop (a pop and a click, a swipe and a pop, a tick and a whoosh, sparkles, pings), which made the
video busy and distracting. The kit is now quiet by default: `pop(s, { sound })` in `scenes.js`.

| Level | What you hear |
|---|---|
| `'calm'` (default) | one soft sound for each sticker, title, heading and banner, at most one a second, at about half the old level; a soft swipe where a scene pushes the last one away. Notes, chips, eyes, bubbles, arrows, sparks and pings are silent. |
| `'light'` | like calm, but notes, chips and the like also make a quiet sound (at most one every 0.7 seconds) |
| `'off'` | only the soft swipe between scenes |
| `'full'` | everything at full level, as the template used to be |

`"sfx": true` and a quiet `playful` music bed stay in `video.json`. Lower `music.volume` or remove the bed if the voice is hard to follow.

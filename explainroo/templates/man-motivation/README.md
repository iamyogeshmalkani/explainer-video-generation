# man-motivation: four portraits, one line, a dark beat

A vertical (9:16) "what a man can reach" short in the style of gym, discipline and mindset motivation reels: a black
screen, a grid of four warm sepia portraits that fade in one after another, a thin line of text on the seam in the middle
("The body a man can build"), dust drifting over it all, then one gold line alone on black ("And yet"). A dark, bass-heavy
cinematic music bed with deep thuds carries it. About 14 to 30 seconds. Everything is drawn on your computer.

The sample is *What a man can build*: three grids (body, wealth, mind), the turn "And yet", a grid of what is chosen
instead, and a closing line.

## What it was studied from

A 12 second 720 x 1280 short (30 fps, about -14 LUFS, music and on-screen text only, no voice):

- **Frame**: black. The grid is the middle two thirds, 2 x 2 cells with no gaps, each cell a portrait (about 4:5). The top
  sixth and bottom sixth are empty.
- **Grade**: every photo is turned into the same amber monochrome (black and white, then warm), dark, with a slight
  grain and floating dust. Mixed photos look like one set.
- **Motion**: the four photos fade in from dark one after another, about 0.3 s apart, and push in very slowly. The whole
  grid is replaced by the next grid after about 3 seconds.
- **Text**: one thin sans line on the seam between the rows, warm white, fading in once the second photo is up. The turn
  ("And yet") is a larger gold line alone on black.
- **Structure**: three grids of the same shape ("The body / wealth / mindset a man can reach"), a pause, the turn, then a
  grid of what is chosen instead (a phone, a drink, junk food).
- **Music**: a dark, bass-heavy bed. The closest built-in sound is the `cinematic` style (minor drone, deep sub-bass, toms
  and a beat that builds), set at volume 0.6 with `"loudness": -14`. The track in the reference is somebody else's, so it
  is not copied; the template makes its own.

Only the structure and the look were taken. The lines and the photos here are our own.

## What it needs

Photographs of people (and of things, for the last grid). They are **found for you** on Wikimedia Commons by
`scripts/find-photos.mjs` (free, no key): only public domain, CC0, CC BY and CC BY-SA pictures at least 1000 pixels wide, with
credits written to `credits.md` (paste it in the video description). Commons has no photo of some people and moments, so
**look at every photo** and swap the wrong ones. You can also save your own picture as `assets/shot01.jpg` (PNG and WebP work).
Until a file exists its cell shows a placeholder with the search words.

## Make a video

```bash
cd explainroo
scripts/new-video.sh man-motivation my-video          # copies this template to videos/my-video
# 1. edit videos/my-video/script.md   (the lines, with a [#g1] [#g2] ... marker at every grid or center line)
# 2. edit videos/my-video/shots.js    (SHOTS: one query per photo; GRIDS: which four go together; CENTERS)
node bin/explainroo.js voice videos/my-video
node videos/my-video/scripts/find-photos.mjs videos/my-video      # finds and saves the photos, writes credits.md
# open every photo in assets/ and swap any that is wrong (--only 3 --redo, --pick 3=2, --search "...")
node bin/explainroo.js check  videos/my-video
node bin/explainroo.js sheet  videos/my-video --every 1.2
node bin/explainroo.js render videos/my-video --workers 2
node bin/explainroo.js verify videos/my-video
```

Or give an AI coding agent this prompt (it follows `TEMPLATE.md`):

```text
Make a 20 second man-motivation video about [theme] with explainroo. Copy the man-motivation template
(scripts/new-video.sh man-motivation <name>), read templates/man-motivation/TEMPLATE.md and AGENTS.md, write the lines,
find the photos, look at every one, then voice, check, sheet, render and verify.
```

## The kit (`lib/grid.js`)

| Call | What it draws |
|---|---|
| `grid(s, GRIDS, SHOTS)` | the 2 x 2 sepia portrait grids: staggered fade-in from dark, a slow push, dust, and a thin line of text on the seam. `GRIDS[i] = { at, out, photos: [n, n, n, n], line, color }` |
| `center(s, CENTERS)` | one line alone on black, with a soft glow: the turn or the closing words. `{ at, out, text, color: 'gold' \| 'white', size, y }` |

`grid` options: `top` (0.156 of the height), `stagger` (0.3 s), `size` (0.05 of the width), `sfx: false` (no thud as a grid lands).
A shot may have `focus: [x, y]` (where the face is, 0 to 1) to keep the face in view when the cell crops the photo.

## Sound

`"music": { "style": "cinematic", "volume": 0.6 }`, `"sfx": "minimal"`, `"loudness": -14`. A soft thud lands with each grid and
each center line. The voice is a deep British male Kokoro voice (`bm_george`; `bm_daniel` is the other deep one, change it in `video.json`) reading the same lines that are on screen, under the beat.
The reference short has no voice; explainroo times everything from narration, so the voice stays. To make it quieter, lower
`speed` or change `voice`; to make the beat louder, raise `music.volume` (keep it at 0.7 or less so `verify` can still hear the voice).

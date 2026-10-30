# dark-history

Cinematic history shorts: full-frame **dark oil paintings** with a slow push, a deep **thud and a
small camera punch at every cut**, drifting embers, a hook line at the top for the first two
seconds, and **two or three word captions in bold italics with the spoken word lit yellow**, over
a dark minor-key cinematic music bed. Made from a study of a 40-second short about a crusade
that destroyed itself (about 15 paintings, one every 2 to 3 seconds).

The sample here is *the Battle of Nicopolis, 1396* (about 40 seconds).

## What the reference does (and what this template copies)

- **9:16, full frame, one painting per beat** (2 to 3 seconds each), orange firelight and smoke
  against blue-black night; kings, sultans and knights in waist-up portraits, battles in wide shots.
- **Slow push-in** on most shots, with a little life (embers, flicker). Cuts are hard.
- **Hook line** at the top of the first shot (white bold sentence-case), gone after about 2 seconds.
- **Captions** at about 69% of the height, 2 to 3 words, Title Case, bold italic, white with the
  current word in yellow.
- **Sound:** a dark B-minor drone-and-drums bed (`cinematic` music, `key: "D"`), loud mastering
  (about -12 LUFS here, the reference is about -9.6), and a low hit on nearly every cut.
- The reference ends with an app advert; this template leaves it out.

## Make a video

```sh
scripts/new-video.sh dark-history my-story
# 1. edit videos/my-story/script.md   (the narration, one [#s1], [#s2] ... marker per painting)
# 2. edit videos/my-story/shots.js    (HOOK and one SHOTS line per marker)
node bin/explainroo.js voice videos/my-story
node videos/my-story/scripts/shot-images.mjs videos/my-story --pollinations    # or --local
node bin/explainroo.js check videos/my-story
node bin/explainroo.js sheet videos/my-story --every 1.5
node bin/explainroo.js render videos/my-story && node bin/explainroo.js verify videos/my-story
```

## The kit (`lib/epic.js`)

`shots` (paintings with an eased hand-held camera, depth, hit and punch), `atmosphere` (mist, dust, ash),
`embers` (sparks and fire flicker), `flashes`, `vignette`, `grain`, `hook` (the opening line) and `captions`. `scenes.js` calls them; you normally edit only
`script.md` and `shots.js`. Each shot takes `motion` (push, pull, panLeft, panRight, rise, still),
`embers` (0 to 1) and `hit` (strength of the thud, 0 for none).

## Making still paintings feel like video

A painting never changes, so every effect here is something that *moves around it*. All are on by default,
cost nothing, and run on this computer. They are tuned per shot in `shots.js`.

| Effect | What the viewer feels | Shot field |
|---|---|---|
| **Eased, hand-held camera**: the push or pan eases in and out, with a slow wander, a faster tremor and a small roll, and a kick at every cut that dies away | a person is holding a camera | `ease`, `shake` |
| **Depth**: a depth map (`assets/shot01.depth.png`) cuts the painting into five layers that zoom and slide at different rates. Without a map the kit bends the picture like a camera moving forward over the ground, so the bottom of the frame moves faster than the horizon | the camera is *in* the scene, not zooming a flat picture | `depth` |
| **Mist** drifting in two layers the opposite way | there is air between you and the subject | `fog` |
| **Dust motes** that glint, near ones soft and large | light falling through a room | `dust` |
| **Falling ash** | a battlefield after the fire | `ash` |
| **Fire that flickers unevenly**, brightest low in the frame, plus drifting sparks | a real flame, not a pulse | `embers` |
| **Flash frame** on the hardest cuts | the impact of a hit | `flash`, `hit` |
| **Film grain**, redrawn 12 times a second (gentle: grain is random noise, so full strength made the file about 4.5 times bigger), and edges that breathe | the picture is never perfectly still | `grain(s, { amount })` in `scenes.js` |
| **Captions that land** with a small pop; the hook settles in | the text has weight | |

### Real depth (optional, free, one-time download)

```sh
uv run templates/dark-history/scripts/make-depth.py videos/my-story       # or: videos/my-story/scripts/make-depth.py
```

It makes `assets/<name>.depth.png` for every painting with Depth Anything V2 Small (about 100 MB from Hugging Face, run on
this computer; the first run also installs torch, a few hundred MB). The kit finds the files by name. Re-run it after
adding pictures; finished maps are kept. Without them the kit still works (the flat fallback above).

Depth maps are a guess at distance made by a model, so look at the result: a layered painting can show a faint
doubled edge on a thin object in front of a bright background. Lower `depth` for that shot (or set it to 0).

### Tuning

- A calm interior wants `shake: 0.3`, `fog: 0.5`, `embers: 0`. A battle wants `shake: 1.2`, `dust: 0.6`, `ash: 0.5`.
- If the hand-held feel is too much for the story, set `shake: 0` on every shot, or change the default in `lib/epic.js`.
- Everything changes only when the video is drawn, so it never changes the narration timing.

## Music

`"music": { "style": "cinematic", "key": "D", "volume": 0.85 }` in `video.json`. `key: "D"` puts the
drone on B minor like the reference. Raise `volume` or set `"duck": -1` for a louder bed; lower
them if `verify` says less than about 95% of the narration is understood.

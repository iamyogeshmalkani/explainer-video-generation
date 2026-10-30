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

`shots` (paintings with push, hit and punch), `embers` (sparks and flicker per shot), `vignette`,
`hook` (the opening line) and `captions`. `scenes.js` calls them; you normally edit only
`script.md` and `shots.js`. Each shot takes `motion` (push, pull, panLeft, panRight, rise, still),
`embers` (0 to 1) and `hit` (strength of the thud, 0 for none).

## Music

`"music": { "style": "cinematic", "key": "D", "volume": 0.85 }` in `video.json`. `key: "D"` puts the
drone on B minor like the reference. Raise `volume` or set `"duck": -1` for a louder bed; lower
them if `verify` says less than about 95% of the narration is understood.

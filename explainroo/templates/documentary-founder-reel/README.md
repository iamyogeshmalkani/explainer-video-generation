# Documentary Mini Founder Reel

A 9:16 mini-documentary about one founder or company, in the editorial style of modern documentary reels: **hard cuts** between
full-bleed footage and photographs, landscape archive kept whole on black, clean white, black and red **typography cards**,
paper cut-outs, stacked triptychs, one big italic-serif number, and a small centred **word-by-word caption** in a Helvetica-style
sans (Inter) with rare italic-serif, red and CAPS emphasis. **No music, no logo, no watermark.**

The sample is *Steve Jobs: fired from the company he started* (28 cuts). Read `TEMPLATE.md` first: it has the style measured from the
reference reels, the 7-phase story structure and the rules.

## Make a video

```sh
scripts/new-video.sh documentary-founder-reel my-founder   # copies this template to videos/my-founder
# 1. edit videos/my-founder/script.md   (narration, a [#s1], [#s2] ... marker at every cut)
# 2. edit videos/my-founder/shots.js    (kind, query, focus per cut; STATS; EMPHASIS)
node bin/explainroo.js voice videos/my-founder
node videos/my-founder/scripts/find-photos.mjs videos/my-founder     # free Wikimedia Commons photos + credits.md
# or drop your own footage in videos/my-founder/assets/shot01.mp4, shot02.jpg ...
node bin/explainroo.js check videos/my-founder
node bin/explainroo.js sheet videos/my-founder --every 3
node bin/explainroo.js render videos/my-founder --workers 2 && node bin/explainroo.js verify videos/my-founder
```

## The compositions (`kind` in `shots.js`)

| kind | looks like | needs |
|---|---|---|
| `full` | picture or clip fills the frame, slow push, `focus` keeps the face | `file` |
| `wide` | landscape picture or clip whole on black, never stretched | `file` |
| `card` | white, black or red card; optional big `headline` (sans caps or `serif: true`) | nothing |
| `paper` | a photo or transparent cut-out (`.png`) on off-white paper; optional red-highlight `note` | `file` |
| `triptych` | three pictures stacked, cutting in one after another | `files: ['a','b','c']` |

Also: `STATS` (one big italic-serif number over dimmed footage), `EMPHASIS` (serif / red / caps words in the caption),
per-shot `ink`, `caps`, `captionY` and a quiet `sfx` (`click`, `type`, `thud`).

## Notes

- `find-photos.mjs` only finds openly licensed photographs (public domain, CC0, CC BY, CC BY-SA) and credits them. For documentary-grade
  results, real interview and B-roll clips you have the right to use are better: name them `shotNN.mp4` and they play as they are.
- Fonts: Inter (variable, OFL) is bundled in `assets/fonts/`; the italic serif is Instrument Serif, bundled with explainroo.

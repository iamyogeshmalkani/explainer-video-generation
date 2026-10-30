# clay-stopmotion: claymation-style explainers, free

A vertical (9:16) video that looks like stop-motion clay, made from AI clay pictures that cost nothing
to make on your own Mac. Nothing is generated as video: the motion comes from the kit in `lib/clay.js`.

| What you see | How it is made |
|---|---|
| A clay set behind everything | a full-frame **backdrop** picture per shot, moved by a camera that steps (10 poses a second) and trembles a little between steps, like clay touched by a fingertip |
| Clay characters and props | **puppet** pictures on a flat green background, cut out when the video is drawn, then popped in with squash and stretch, dropped, hopped in from the side, and made to breathe while they wait |
| A hand-made feel | flickering lamp light, tiny dust specks, letters that tilt in steps, a clay plaque for numbers, captions that pop in with a squash |

It runs on explainroo (voice, timing, music and rendering are local too).

## Cost

| Part | Cost |
|---|---|
| Pictures with `--local` (Z-Image-Turbo on this Mac) | free; about 2 minutes a picture on an M2 with 16 GB; nothing leaves the computer |
| Pictures with `--perchance` or `--cloudflare` | free (daily allowance); prompts are sent to that service |
| Pictures with `--pollinations` | per your plan; prompts are sent to that service |
| Voice, music, sound, rendering | free, local |
| **Hero clips** (optional): a short real image-to-video clip for one or two shots | free tiers of hosted video tools give a few clips a day, or a few cents to cents per clip when paid. Not automated here: save the clip as `assets/shot01.mp4` and it plays as it is |

The sample (9 backdrops and 5 puppets) is 14 pictures: about 30 minutes locally, or about 10 minutes with `--all`.

## Make a video

```bash
. ./env.sh                                       # from the repository root, once per terminal
cd explainroo
scripts/new-video.sh clay-stopmotion my-topic    # copies this template to videos/my-topic
# 1. edit videos/my-topic/script.md   (narration with [#s1] [#s2] ... markers)
# 2. edit videos/my-topic/shots.js    (backdrops: SHOTS; characters and props: PUPPETS)
# 3. edit videos/my-topic/scenes.js   (CAST: who is on screen, where, when, and how they enter)
node bin/explainroo.js voice videos/my-topic
node bin/explainroo.js check videos/my-topic
node videos/my-topic/scripts/shot-images.mjs videos/my-topic --dry-run     # what would be made
node videos/my-topic/scripts/shot-images.mjs videos/my-topic --local       # free, on this Mac (add --puppets or --backdrops for one kind)
node bin/explainroo.js sheet  videos/my-topic --every 2
node bin/explainroo.js render videos/my-topic
node bin/explainroo.js verify videos/my-topic
```

Until a picture exists, a backdrop shows a numbered placeholder with its prompt and a puppet shows a clay blob
with its name, so you can check the story, the timing and the captions first.

Or give an AI coding agent this prompt (it follows `TEMPLATE.md`):

```text
Make a 45 second clay stop-motion explainer about [topic] with explainroo. Copy the
clay-stopmotion template (scripts/new-video.sh clay-stopmotion <name>), read
templates/clay-stopmotion/TEMPLATE.md and AGENTS.md, write the script, the backdrops, the
puppets and the cast, and check everything. Use the free local pictures.
```

## The files

| File | What it is |
|---|---|
| `script.md` | the narration; one scene, with `[#s1]`, `[#s2]` ... where each backdrop starts |
| `shots.js` | `SHOTS` (backdrops), `PUPPETS` (characters and props), the two style strings, `HOOK`, `BOARDS` |
| `scenes.js` | `CAST`: when each puppet enters and leaves, where its feet stand, how big it is (this is where you direct) |
| `lib/clay.js` | the kit: `backdrops`, `grain`, `puppets`, `title`, `board`, `captions` |
| `scripts/shot-images.mjs` | makes the missing pictures, each kind with its own style and shape |
| `video.json`, `look.json` | size, voice, music; `"captions": false` (the kit draws its own) |

## Directing puppets (CAST)

```js
{ file: 'yeast', at: '#s2', delay: 0.5, out: '#s5', x: 0.5, y: 0.7, w: 0.44, enter: 'pop', idle: 'hop' }
```

- `file`: the picture in `assets/` (`yeast.png`). The same file can appear many times.
- `at`, `delay`, `out`: when it arrives, a little later, and when it shrinks away (leave `out` off to keep it).
- `x`, `y`: where its **feet** stand, as fractions of the frame. `w`: its width as a fraction of the frame width.
- `enter`: `pop` (squash and stretch), `slide` (hops in from the side; `from: 'left'` or `'right'`), `drop` (falls and squashes; plays a thud), `rise` (comes up from below), `none`.
- `idle`: `breathe` (default), `hop` (a little hop every 1.4 seconds), `none`.
- `flip: true` mirrors it. `sound: false` silences its pop.

Keep the feet in the middle third of the frame (y 0.6 to 0.75): the captions sit at 85% and the title at 16%.

## Tuning the clay feel

`backdrops(s, SHOTS, { fps: 10, boil: 1 })` and `puppets(s, CAST, { fps: 10 })` in `scenes.js`:
`fps` 8 is jerkier and more "handmade", 12 is smoother; `boil` 0 holds the backdrop still, 2 is jittery.
`grain(s, { amount: 1 })` sets the specks and the lamp flicker (0 removes them).

## Limits

- The motion is made on the pictures, not by an AI video model. Characters do not walk or turn; they pop, hop,
  squash, breathe and slide. For real motion, make a hero clip with an image-to-video tool and drop it in as
  `assets/shot04.mp4` (it replaces that shot's picture).
- Text-to-image models cannot keep one character looking the same between pictures. Make each character ONE puppet
  picture and reuse it everywhere; do not ask for the same character again in a backdrop prompt.
- The cut-out removes the flat background by color (green by default, `PUPPET_BG` in `shots.js`). Pale puppets such as
  dough, sugar or eggs need the green: on a white background they vanish into it. A GREEN puppet needs
  `PUPPET_BG = 'bright magenta'`. A puppet with a leftover rim or a hole can be remade (delete the file, run the script
  again with `--only <file>`); a picture model sometimes ignores "flat solid background" and draws a floor or a gradient.
- Facts on screen (numbers, names) are drawn by `board()`, never by the picture model.
- Voices are explainroo's (Kokoro, or ElevenLabs with your own key).

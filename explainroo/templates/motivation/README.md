# motivation: a quote and a story on a black screen

A vertical (9:16) video in the style of stoic and motivational shorts: a black screen, a
quote that appears word by word with glowing red and gold key words, then classical
paintings that open from a slit while the narration appears one word at a time. A dark
cinematic music bed builds under the voice. Everything is drawn on your computer.

The sample is a 31 second video on Marcus Aurelius, *Meditations* 5.1 (George Long's
public-domain translation).

## What it was studied from

A 32 second "Marcus Aurelius wisdom" short (720 x 1280, 30 fps, about -17 LUFS):

- **Opening**: about 3 seconds of kinetic type on black: serif words of different sizes on a
  loose zigzag, soft white glow, the key words in capitals, one red and one gold.
- **Body**: paintings (landscape, in a band across the middle) that open from a thin slit,
  push in slowly and close, with floating dust; the narration one word at a time in white
  serif with a glow, centered over the painting.
- **Music**: a dark drone on the minor chord (about 92 bpm, around C# minor / E), no melody,
  a deep sub-bass that stays low and then swells in the last third, with the music about 9 dB
  under the voice. This is built into explainroo as the `cinematic` music style.

Only the structure and the sound were taken. The words, paintings and wording here are our own.

## What you need to supply

The paintings. The template does not make them:

| Source | Notes |
|---|---|
| `scripts/shot-images.mjs <project> --pollinations` | hosted FLUX; needs `POLLINATIONS_API_KEY` in `explainroo/.env`; prompts are sent to pollinations.ai; about 10 seconds a painting |
| `scripts/shot-images.mjs <project> --local` | free, on an Apple Silicon Mac; about 2 minutes a painting; needs `sh setup-local-images.sh` once |
| `scripts/shot-images.mjs <project>` | paid OpenRouter pictures (needs `--yes` and a key) |
| Your own pictures | save as `assets/shot01.jpg` (or `.png`, `.webp`), landscape 3:2 |

Public-domain paintings (museums publish many) also work and look the most authentic. Until
a file exists its shot shows a placeholder with the prompt.

## Make a video

```bash
cd explainroo
scripts/new-video.sh motivation my-quote            # copies this template to videos/my-quote
# 1. edit videos/my-quote/script.md   (the quote, then the story, with markers)
# 2. edit videos/my-quote/shots.js    (CARDS for the quote, SHOTS for the paintings)
node bin/explainroo.js voice  videos/my-quote
node bin/explainroo.js check  videos/my-quote
node videos/my-quote/scripts/shot-images.mjs videos/my-quote --pollinations
node bin/explainroo.js sheet  videos/my-quote --every 1.5
node bin/explainroo.js render videos/my-quote
node bin/explainroo.js verify videos/my-quote
```

Or give an AI coding agent this prompt (it follows `TEMPLATE.md`):

```text
Make a 30 second motivation video about [person or idea] with explainroo. Copy the motivation
template (scripts/new-video.sh motivation <name>), read templates/motivation/TEMPLATE.md and
AGENTS.md, use a quote I can verify (public domain or my own words), write the script and
shot list, and check everything with sheet and still.
```

## The files

| File | What it is |
|---|---|
| `script.md` | the narration: the quote first (`[#q1]` `[#q2]` `[#q3]`), then the story (`[#s1]` `[#s2]` ...) |
| `shots.js` | `CARDS` (the quote), `SHOTS` (the paintings), `STYLE`, `ASPECT`, `CAPTIONS_FROM` |
| `scenes.js` | turns them into the video (you rarely edit it) |
| `lib/motivation.js` | `quoteCard()`, `band()`, `wordCaptions()` |
| `video.json`, `look.json` | size, voice, music (`cinematic`, key E), the Playfair Display font |

## The quote cards

`tokens` is the quote split into words. A lowercase word is small and sits in a loose row;
a CAPITAL word is big and gets its own line; `!red`, `!gold` or `!white` after a word colors
it and makes it bigger. A single capital letter (I, A) stays small. A card lasts until `out`,
and its words appear one after another across about 80% of that time.

```js
{ tokens: ['I', 'am', 'rising', 'to', 'the', 'WORK!gold', 'of', 'a', 'HUMAN', 'BEING'], at: '#q3', out: '#s1' }
```

## Music

`"music": { "style": "cinematic", "key": "E", "volume": 0.55 }`. `cinematic` is a new
explainroo music style: a low minor drone, sub-bass that grows with the sections, sparse
bells, a low heartbeat in the last section and a boom on the final chord. Try another key
(`D`, `F#`, `B`) or `volume` (0.4 to 0.7). `node dev/music-preview.mjs cinematic 32 out.wav`
renders the music alone.

## Limits

- The reference uses real paintings; these are AI paintings in a similar style, so check
  every one for odd hands, faces and invented text.
- A recurring person looks a little different in each painting.
- `verify` warns about black frames at the start and between quote cards. That is part of the style.
- Pollinations sometimes answers 401 or 429 to a valid key. The picture script retries up to
  eight times; if it still fails, check the key at enter.pollinations.ai.

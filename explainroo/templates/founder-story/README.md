# founder-story

A documentary-style short about one founder, told with **real photographs**: slow Ken Burns moves with soft dissolves, a gold-and-serif
name and year plate, one big number, one quote card, word-lit captions, and an **inspiring piano-and-strings music bed that builds**
(the `inspiring` music style). No stickers, no drawings, no AI pictures of real people.

The sample here is *Steve Jobs: fired from the company he started* (about 80 seconds). The photographs are found for you on Wikimedia
Commons (only pictures that may be reused) and credited.

## Make a video

```sh
scripts/new-video.sh founder-story my-founder        # copies this template to videos/my-founder
# 1. edit videos/my-founder/script.md     (the narration, with a [#s1], [#s2] ... marker at every photo change)
# 2. edit videos/my-founder/shots.js      (one query per photo; plates, one stat, one quote, the hook)
node bin/explainroo.js voice videos/my-founder
node videos/my-founder/scripts/find-photos.mjs videos/my-founder      # finds and saves the photos, writes credits.md
# open every photo in assets/ and swap any that is wrong (see below)
node bin/explainroo.js check videos/my-founder
node bin/explainroo.js sheet videos/my-founder --every 4
node bin/explainroo.js render videos/my-founder --workers 2 && node bin/explainroo.js verify videos/my-founder
```

Read `TEMPLATE.md` first: it holds the story structure (researched) and the rules.

## Finding photos (`scripts/find-photos.mjs`)

| Command | What it does |
|---|---|
| `find-photos.mjs <project>` | finds the missing photos: the best match for each shot's `query` |
| `--only 3,5` | only these shots |
| `--pick 3=2` | use the 2nd candidate for shot 3 (the candidates are in `build/photos/shot03.json`) |
| `--redo` | search again and replace the photo |
| `--search "Apple I computer"` | just list candidates for some words (`--verbose` shows descriptions) |
| `--dry-run` | list what would be searched |

It keeps only public domain, CC0, CC BY and CC BY-SA pictures at least 1000 pixels wide, writes `credits.json`, `credits.js` (the end card
reads it) and `credits.md` (paste it into the video description). One request at a time, with a pause, as Commons asks.
A shot may also have `alt: ['other words']` (tried if the first search finds nothing) and `avoid: ['wrong name']`.

**Look at every photo.** A search matches words in titles and descriptions, so it can return a picture of someone else at the founder's
event. Photographs of a person are the photographer's work, not a likeness made for the video. Where no free photo of a moment exists
(common for the 1980s to 2000s), use an object, a place or a document, or the person at another time with the year on a plate.

## The kit (`lib/story.js`)

| Call | What it draws |
|---|---|
| `photos(s, SHOTS)` | the photographs: a slow push, pull, pan or rise; a soft dissolve between shots; `focus`, `fit`, `sweep` |
| `grade(s)` | a soft vignette and a dark foot so the captions stay readable |
| `hook(s, text, { out })` | the opening line near the top, in the serif |
| `labels(s, LABELS)` | a plate at the top left: a gold kicker (year, role, place) over a name or title |
| `stats(s, STATS)` | a big gold number with a short line, over the dimmed photo |
| `quotes(s, QUOTES)` | the founder's own words, with who and when |
| `captions(s)` | the narration 3 or 4 words at a time, the spoken word in gold |
| `creditsCard(s, CREDITS)` | the last 3 seconds: the photographers' credits |

## Sound

`"music": { "style": "inspiring", "volume": 0.4 }` and `"sfx": false`. The `inspiring` style is in `engine/audio/music.js`: a sparse piano
arpeggio that grows, legato strings, a warm bass, then glockenspiel and a soft beat at the climax (about 96 bpm, major key). Lower
`music.volume` if `verify` reports the narration understood under 95%. You can set `"key": "D"` or `"bpm": 90` in `music`.

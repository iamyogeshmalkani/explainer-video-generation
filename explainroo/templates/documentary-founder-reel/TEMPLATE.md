# Documentary Mini Founder Reel: rules for making a video with this template

For a coding agent (Claude Code and others) or a person. Read this, then `README.md`.

The look comes from nine reference reels (founder and company stories, 9:16, 56 to 94 seconds). It is the editing philosophy,
not a copy of any shot: **a premium editorial mini-documentary, never a slideshow with subtitles.** No music. No logo. No watermark.

## What the references do (the style, measured)

- **Picture:** full-bleed footage or photographs, **hard cuts** (no dissolves), a new picture every 1.5 to 4 seconds. Slow pushes on faces, slow pans on stills.
- **Six compositions, mixed on purpose:**
  1. `full`: vertical footage or a portrait filling the frame (people, hands, close-ups, B-roll).
  2. `wide`: landscape archive, news, concert or product footage kept whole on **black**, never stretched.
  3. `card`: a clean white, black or red typography card. For a date, a name, a verdict, the turn of the story.
  4. `paper`: a cut-out or photo on off-white paper with a soft shadow, and optionally a red-highlight strip of text (a clipping).
  5. `triptych`: three pictures stacked, cutting in one after another (three views of one subject).
  6. A big **number** in italic serif over dimmed footage (`STATS`).
- **Type:** one small, centred caption near the vertical middle (about 4% of the width), bold Helvetica-style sans (Inter), white on footage,
  black on white, white on red. Words appear **as they are spoken** and the phrase clears at a sentence end or a pause. Never a bar, an outline,
  an emoji, a bounce. Emphasis is rare and comes in three kinds: *italic serif* for an aside or a place, **RED** for the number or word the story
  turns on, **CAPS** for a name or a verdict.
- **Rhythm:** info-heavy lines get short cuts (2 to 3 s); explanations 3 to 4 s; the turning point and the last line **breathe** (a card, a long push, 5 to 6 s).
  Never every shot the same length. Hard cut to a white, black or red card at the turn, then back to footage.
- **Sound:** the voice only. No music (`"music": false`). Effects are optional and rare: a shutter `click` on a photograph, `type`, a `thud` on a number.
  Leave a shot silent rather than add a sound that does not belong to its picture. No whooshes on every cut.
- **Grade:** natural skin, natural archive colour, a very light vignette. Do not force one palette.

## The story (7 phases, adapt to the length)

| Phase | Time (of 60 s) | What it does | Pictures |
|---|---|---|---|
| 1 Hook | 0 to 3 | the most intriguing moment, the claim | a striking portrait, an object, a place; the caption starts at frame 0 |
| 2 Introduction | 3 to 12 | who this is, why you should care | the real person, recognisable; a `caps` caption on the name |
| 3 Background | 12 to 22 | where it began | the place, the family, the first product, an early photo |
| 4 Development | 22 to 38 | the chain of events, one new visual idea per sentence | people, places, objects, documents; vary `full`, `wide`, `paper` |
| 5 Turning point | about 38 to 44 | the failure, the risk, the break | change the rhythm: a black or white `card`, an isolated number, a long still |
| 6 Evidence | 44 to 54 | what it cost, what it became | products, buildings, a figure in italic serif (`STATS`), a document |
| 7 Payoff | 54 to 60 | the meaning, the last line | one strong image or a `card` (red or white). Nothing new. |

## Rules

- **Every picture matches its sentence.** A person named: show that person. A company: its building, product, branding. A number: a visual that gives it weight.
  Never stock footage to fill a gap. Never fabricate a photograph, a document or a clipping and pass it off as real. If no authentic picture exists, use a card.
- **Never stretch landscape footage.** Use `kind: 'wide'`. Keep faces and subjects out of the caption band (about 44% to 56% of the height) when you can: set `focus`.
- **One `STATS` number at most**, and only when the sources agree on it. At most one quote, only word for word from a reliable source, as a `card` with `serif: true`.
- **Captions:** keep `EMPHASIS` to a handful of words in the whole video. Everything else is plain.
- **Sources:** Wikimedia Commons photographs (found by `scripts/find-photos.mjs`) are credited in `credits.md`; paste it into the description. Your own footage goes in `assets/<file>.mp4`.
- **Facts:** 12 to 16 verified facts with dates. Leave out what sources disagree on, or say "about".

## Steps

1. Research the founder (WebSearch). Write the facts as a `>` note in `script.md`.
2. `scripts/new-video.sh documentary-founder-reel <name>`.
3. Write `script.md`: a `[#s1]`, `[#s2]` ... marker at every cut, about every 5 to 9 spoken words. Mark hook words, the key number and the closing line with `[loud]...[/loud]`.
4. Write `shots.js`: one line per marker with its `kind`, a `query` (the NAME of the person, place or object plus a fact) and a `focus`; the `STATS`; the `EMPHASIS`.
5. `node bin/explainroo.js voice videos/<name>` (fix names with `{shown|spoken}`).
6. `node videos/<name>/scripts/find-photos.mjs videos/<name>`, then **open every picture** and check it is the right person and moment. Swap with `--only 6 --pick 6=2`, `--redo`, a better `query`.
7. `check`, then `sheet --every 3` and look: is the caption clear, is any face covered, is there a different picture every few seconds, do the cards land at the turning point?
8. `render --workers 2`, `verify`. Report the files, paste `credits.md`, and say that you could not hear the audio.

## Mistakes to avoid

- Starting at the birth. Start at the hook.
- Every shot the same length, or every shot the same composition.
- Landscape footage cropped or stretched to fill the frame.
- A person's photo from the wrong year used as the moment.
- Large TikTok-style captions, coloured boxes, bouncing words, glitch, shake, spin.
- Emphasis on every other word.
- Music "just under the voice". There is none.

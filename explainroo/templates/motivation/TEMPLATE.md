# motivation: rules for making a video with this template

For a coding agent (Claude Code and others) or a person. Read `AGENTS.md` in the explainroo
folder for the general rules and `README.md` here for the steps and the kit.

## The style

- **Black screen, serif type, one glow.** White words with a soft glow; the key words are
  CAPITALS in red and gold (at most two key colors per quote). Nothing else is colored.
- **The quote comes first** as 2 to 4 kinetic cards (about 3 seconds each). Small words sit
  in loose rows, key words are big. Read the quote aloud in the first seconds.
- **Then the story** over paintings in a band across the middle, one painting every 3 to 5
  seconds, the narration one word at a time over the picture. No other text on screen.
- **Calm and slow.** About 2.2 words a second, long gaps between ideas, a dark minor drone
  underneath that grows toward the end. No jokes, no urgency.
- **Length** 25 to 40 seconds. One quote, one idea.

## Steps

1. **Pick a quote you can verify.** Use a public-domain translation (for Marcus Aurelius,
   George Long, 1862) or your own paraphrase. Never invent a quote or attribute one without
   a source. Put the source in a note at the top of `script.md`.
2. **Copy the template**: `scripts/new-video.sh motivation <name>`.
3. **Write `script.md`.** One scene, `story`. First the quote, split at `[#q1]` `[#q2]` `[#q3]`
   (2 to 4 pieces, each a phrase); then 6 to 9 short sentences, each starting with `[#s1]`,
   `[#s2]` ... Who said it, when, what it means, how to use it today. Plain words. End on one
   sentence that tells the viewer what to do.
4. **Write `shots.js`.** `CARDS` (tokens for each quote piece: choose one or two key words
   per card and color them), and one painting per `[#sN]` marker. Keep `STYLE` the same.
5. **Voice and check.** `voice`, then `check`. Fix every error; respell archaic words if the
   voice says them oddly.
6. **Paintings.** `scripts/shot-images.mjs <project> --pollinations` (or `--local`). Open every
   one: remake any with garbled text, extra limbs or the wrong period.
7. **Look.** `sheet --every 1.5`; check each quote card is readable, key words are the right
   ones, captions are legible on bright paintings, and the painting matches the sentence.
8. **Render and verify.** `render`, `verify`. Report the files and what you could not check (the sound).

## Rules

- A quote is shown exactly as spoken. Do not shorten it on screen and read it in full, or the other way round.
- The commentary says only what the quote and well-known history support. No invented
  claims about the person.
- Paintings: classical style, dramatic light, no text, no logos, landscape 3:2. Use public
  domain paintings when you can.
- Music: leave `cinematic` at 0.5 to 0.6 so `verify` still understands the voice.
- Do not put anything in the bottom third; app buttons cover it on Shorts, TikTok and Reels.

## Mistakes to avoid

- More than two colored key words in one card: the effect is lost.
- A `[#q]` card with more than about 8 words: it gets too small. Split it.
- Pictures that are not 3:2: the band crops them. Keep the subject in the middle.
- Long sentences: the one-word captions go by too fast to follow. Keep sentences short.
- A marker that does not exist in `script.md`: the build stops and lists the closest names.

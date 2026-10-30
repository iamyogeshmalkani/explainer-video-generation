# story-shots: rules for making a video with this template

For a coding agent (Claude Code and others) or a person. Read `AGENTS.md` in the
explainroo folder for the general rules and `README.md` here for the steps.

## The style, measured from the reference video

A 107 second vertical video (720 x 1280, 30 fps, about 280 spoken words, so
roughly 2.6 words a second, mastered at -10 LUFS with music under the voice).

- **About 30 shots, one every 3.6 seconds.** Each shot is a generated picture
  or a short generated clip in one consistent look (handcrafted, clay-like,
  warm candle and window light, shallow depth of field). Shots fade into each
  other; there are almost no hard cuts.
- **A title card at the start**: two or three lines of white capitals near the
  top, with the key words in blue ("BEFORE THE *X* THERE WAS Y."). It stays for
  the first sentence.
- **Captions**: three words at a time, lower middle (about 70% down), bold
  white with a dark outline, the word being spoken in yellow. No box.
- **Facts are shown as objects in the picture** (a ledger, a chalkboard with a
  cost table, a patent). In this template they are drawn by `compare()` or
  added by you, so the numbers are right.
- **A story with a shape**: hook, problem, a failed workaround that costs
  money, the inventor, the invention and its catch, one sentence that states the
  lesson, how it spread (or did not), and a twist ending.
- The reference ends with a promotion for a product. This template has none;
  add your own closing line if you need one.

## Steps

1. **Research.** Write down the facts with dates and numbers, from two sources
   when you can. Never invent a number, a name or a quote. If sources disagree,
   say so in the script or leave the detail out. Note what a figure covers (for
   example "loading costs only").
2. **Copy the template**: `scripts/new-video.sh story-shots <name>`.
3. **Write `script.md`.** One scene, `story`. 130 to 160 words for 60 seconds.
   Short sentences. Put `[#s1]`, `[#s2]` ... at the start of each sentence and
   wherever the picture should change; one shot per 3 to 4 seconds (about 14 to
   17 shots a minute). Use `{shown|spoken}` for names the voice may misread.
4. **Write `shots.js`.** For every marker one shot: a prompt (a concrete scene,
   one subject, a camera feeling: close-up, wide, aerial), a motion (vary them),
   and a file name. Set `HOOK` and any `BOARDS`. Keep `STYLE` the same for all.
5. **Voice and check.** `voice`, then `check`. Fix every error. Listen to names
   before respelling them.
6. **Pictures.** If the local model is installed (`setup-local-images.sh`), run
   `scripts/shot-images.mjs <project> --local`: free, about 2 minutes a picture, and
   nothing leaves the computer. Describe each recurring person with the same words in
   every prompt (the local model takes no `--ref`). Otherwise run `scripts/shot-images.mjs ... --dry-run`, tell the user the
   number of pictures, and make them with a free maker (`--local` or `--perchance`). Open every picture; remake wrong ones
   (wrong hands, wrong period details, invented text). Or use the user's own
   pictures and clips.
7. **Look.** `sheet --every 3` and `still` at the title card, a board and the
   last frame. Check the captions are readable on every picture and nothing
   important sits where the captions or the title are.
8. **Render and verify.** `render`, `verify`. Report where the files are, what
   the pictures cost, and what you could not check (the audio).

## Writing prompts for pictures

- One scene per prompt: who, where, what they are doing, the light, the framing.
- Period and place details matter ("1950s American docks", "1930s truck").
- Keep the same style words in every prompt (that is what `STYLE` does) and the
  same look for a recurring person; use `--ref assets/shot05.png` to carry a
  person from one picture to the next.
- No text, no logos, no signs. Picture models invent letters. Put words and
  numbers on screen with `compare()` or a caption.
- Vertical 9:16, subject in the middle third, because the title is at the top
  and the captions are at 70% down.

## Rules for the story

- Hook in the first sentence and on the title card; the first shot is also the
  cover, so make it the strongest picture.
- Every sentence adds a fact or a turn. No filler, no slogans.
- State the lesson once, plainly, in the middle ("It spread where the arithmetic
  worked") using your own words and your own story's facts.
- End on the twist or the consequence, not on an instruction to the viewer.

## Mistakes to avoid

- Fewer markers than shots: a shot with no marker is skipped, and the next one
  starts late. Keep `SHOTS[i].at` equal to a marker that exists in script.md.
- A `file` name with an extension. Use `shot01`; the kit finds `.png`, `.jpg`,
  `.webp`, `.mp4`, `.mov`, `.webm` or `.m4v` itself.
- Pictures that are not 9:16: they are cropped to fill the frame. Keep the
  subject centred.
- Claims in the title card that the narration does not support.
- Using a picture or clip you do not have the right to use.

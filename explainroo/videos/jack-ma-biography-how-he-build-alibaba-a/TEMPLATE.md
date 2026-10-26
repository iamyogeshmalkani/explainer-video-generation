# sticker-pop: rules for making a video with this template

For a coding agent (Claude Code and others) or a person. Read `AGENTS.md` in the explainroo
folder for the general rules and `README.md` here for the steps and the kit.

## The style (from the reference short)

- **Flat color scenes, one idea each.** Yellow (`sun`), teal blueprint (`blueprint`) or cream
  (`paper`). A new scene pushes the old one off to the left with a blur and a swipe sound.
  A scene lasts 1.5 to 4 seconds; the whole video 25 to 45 seconds.
- **Everything pops, nothing sits.** Each sticker, tag, chip or word appears on its own
  `[#marker]` with a spring (overshoot) and a click or pop. Something new every 0.5 to 1.5 seconds.
- **Idle life after the pop:** stickers breathe and wobble a little, eyes look around and blink,
  a thought bubble blinks its dots, sparks fly off a fuse, a ring pulses. Use one or two per scene.
- **Few words on screen.** A word, a name, a year, a short phrase. The voice says the sentence;
  the screen shows the one thing to remember.
- **Sticker pictures:** flat vector style, thick dark outlines, bright colors, one object each,
  on a plain white background (the kit cuts it out and adds the white edge).
- **A person is a portrait sticker** rising from the bottom, with a paper note and a year chip beside it.
- **Contents in the upper two thirds.** The bottom third is covered by app buttons on Shorts,
  TikTok and Reels; keep banners above `y: 0.78`.

## Steps

1. **Pick a topic with 5 to 8 beats** and check every fact. Never invent numbers or quotes.
2. **Copy the template**: `scripts/new-video.sh sticker-pop <name>`.
3. **Write `script.md`**: one scene, `story`. Short sentences, a `[#marker]` at the start of
   every scene change and at each thing that should pop mid-scene. Open with a one-word question.
4. **Write `shots.js`**: one sticker per object (`file`, one-object `prompt`). Reuse a sticker in
   several scenes instead of making a new one.
5. **Write `scenes.js`** with the kit in `lib/pop.js`: `k.scene(...)` per idea, then the pops.
   Put the pops on markers or a little after (`t('#marker', 0.4)`).
6. **Voice and check**: `voice`, then `check`. Fix every problem.
7. **Pictures**: `node scripts/shot-images.mjs <project> --pollinations` (or `--local`). Open every
   one: remake pictures with shadows, extra objects, fake text or the wrong period.
8. **Look**: `sheet --every 1.2`. Check every sticker is cut out cleanly, nothing overlaps, no
   scene is empty for more than a second, and the bottom third is free.
9. **Render and verify**: `render`, `verify`. Report the files and say that you could not hear the sound.

## Rules

- Each pop has a sound. Do not silence them; if the voice gets hard to follow (`verify` narration
  under 95%), lower `music.volume` first, then thin out the pops.
- A sticker picture that has text in it (a sign, a label) is wrong. Draw words with `title`,
  `heading`, `note`, `chip` or `banner`.
- A portrait of a real person made by a picture model is an illustration, not a likeness. Say so.
- Do not use more than two looks in a row without a reason; repeat `sun` and `paper` for rhythm.

## Mistakes to avoid

- A prompt that asks for a scene ("a man standing in front of a factory"): the cutout then keeps the
  background. Ask for one object on white.
- A sticker whose edge touches the picture border or whose background is not white or near it.
- Pops that all land on the same instant: stagger them by 0.3 to 0.5 seconds.
- Long notes: a note is 2 to 4 words per line, 2 lines at most.

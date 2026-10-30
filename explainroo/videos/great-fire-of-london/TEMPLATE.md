# clay-stopmotion: rules for making a video with this template

For a coding agent (Claude Code and others) or a person. Read `AGENTS.md` in the explainroo folder for the general
rules and `README.md` here for the steps and the CAST options.

## The style

A vertical clay-animation explainer. Warm, hand-made, simple. Every idea is a clay set with one or two clay characters
or props that pop, drop, hop and breathe. Captions are three words at a time, cream with a brown outline, the spoken
word orange. A title card in cream capitals with one orange word at the start. No voice-over tricks, no music that fights
the voice (`playful`, volume 0.45).

## Steps

1. **Research** the facts; two sources when you can. Never invent a number, name or quote. Put the facts and sources in a
   `>` note at the top of `script.md`.
2. **Copy the template**: `scripts/new-video.sh clay-stopmotion <name>`.
3. **Write `script.md`.** One scene, `story`. 70 to 160 words (30 to 60 seconds). Short sentences, everyday words.
   `[#s1]`, `[#s2]` ... at the start of each sentence or wherever the set should change: one backdrop every 3 to 4 seconds.
   The first sentence is a question or a surprising fact. Use `{shown|spoken}` for names the voice may misread.
4. **Write `shots.js`.**
   - **Backdrops (`SHOTS`)**: one per marker. Describe an EMPTY clay set (a kitchen, a lab, a street) with a clear table or
     floor in the lower middle; say what the scene is, not who is in it. No people, no text.
   - **Puppets (`PUPPETS`)**: one picture per character or prop, described as ONE object, simple rounded shape, big eyes
     for characters. Reuse a puppet instead of making a second one. 3 to 6 puppets for a whole video is plenty.
   - Keep `STYLE` and `PUPPET_STYLE` as they are, or change the subject words only (not the clay words), so every picture
     shares one look. `PUPPET_STYLE` must keep the flat background (`PUPPET_BG`, green): the cut-out depends on it. Never make a green puppet
     while the background is green; switch `PUPPET_BG` to `'bright magenta'` for that video.
5. **Direct the cast in `scenes.js`.** Every puppet appearance is one line in `CAST`. Vary the entrances (`pop`, `drop`,
   `slide`, `rise`). Something new should enter every 2 to 4 seconds. Feet at y 0.6 to 0.75, never behind the captions
   (85%) or the title (16%). Never more than three puppets on screen at once.
6. **Voice and check.** `voice`, then `check`. Fix every error.
7. **Pictures.** Run `shot-images.mjs <project> --dry-run`, then `--local` (free, nothing leaves the computer). Tell the
   user what you are about to make and roughly how long it takes (about 2 minutes a picture locally). Open every picture:
   remake wrong ones (wrong objects, text-like marks, a puppet on a floor or a gradient instead of a flat background, a green rim or a hole after the cut-out).
8. **Look.** `sheet --every 2`; `still` at the title, a puppet entrance and the last frame. Check captions are readable on
   every backdrop and no puppet hides a caption.
9. **Render and verify.** `render`, `verify`. Report the files and what you could not check (the audio by ear).
   For one or two shots that need real motion, tell the user they can add an image-to-video clip as `assets/shotNN.mp4`.

## Writing prompts for clay pictures

- Start with the object or scene, then one detail. Keep prompts under about 30 words; the style string adds the clay.
- Good puppet: "A soft round lump of white bread dough character with two big eyes and a gentle smile".
- Good backdrop: "A glowing clay oven with a warm orange light inside, brick wall behind, empty table in front".
- Do not ask for text, numbers, logos or hands holding things. Draw numbers with `board()`.
- Ask for the same lighting words across shots ("warm studio lighting") so the set feels like one studio.

# tech-explainer: rules for making a video with this template

For a coding agent (Claude Code and others) or a person. Read `AGENTS.md` in the
explainroo folder for the general rules and `README.md` here for the steps and the kit.

## The style, measured from the reference

A 39 second vertical video (720 x 1280, 25 fps, about 100 spoken words, loudness about
-19 LUFS with quiet music).

- **Colors**: charcoal `#1a1a1a`, one neon green `#00ef5d`, white text, and pink
  `#e0185f` for the keys in code. Nothing else.
- **Shapes**: outline only, a 3 to 4 px green stroke, rounded corners. No fills, except
  the solid green block behind a key word (dark text on it) and small icons.
- **Type**: one heavy rounded sans in capitals for labels; a monospace for code.
- **Layout**: everything sits in the upper two thirds. The bottom third is empty
  (app buttons cover it on Shorts, TikTok and Reels). Elements are large: a label box
  is a third to two thirds of the width.
- **Rhythm**: a new thing every 2 to 3 seconds. An idea appears on the word that names
  it, then the screen is cleared or rearranged for the next idea.
- **Opening**: the title: the topic in big green letters that
  bounce in, followed by lines such as "Architectural / Design / Pattern" blurring in.
- **Motifs**: an app card with a notch, a code card with pink keys, an icon next to a
  label (database, server, lock), dashed lines between boxes, a finger tapping.
- **Pictures and connections**: the ideas are real pictures (`k.pic`) cut out with a white edge, not
  boxes. One picture per idea, a short label under it, and dashed `k.link` lines the code draws between
  them. Prefer side by side or a small triangle over a tall stack, so links have room.
- **Stickers**: the background stays plain, so die-cut stickers (`k.sticker`) add the
  fun: a colored badge with a white edge and a tilt that pops in as the idea is named.
  One or two per screen, at a corner or in a gap. The sample video shows how.
- **Words**: plain and short, one idea per sentence, about 2.6 words a second.

## Steps

1. **Pick one idea.** A video explains one thing: one pattern, one request, one bug.
   Write down the 5 to 8 steps a beginner needs, in order. Check every fact; never
   invent a number, a name or a status code.
2. **Copy the template**: `scripts/new-video.sh tech-explainer <name>`. Delete the sample pictures in
   `assets/` that the new video does not use.
3. **Write `script.md`.** One scene, `story`. 90 to 130 words for 35 to 50 seconds.
   Put `[#s1]`, `[#s2]` ... at the start of each sentence, and extra markers
   (`[#method]`, `[#status]`) where something should appear inside a sentence. Respell
   acronyms and numbers: `{API|A P I}`, `{404|four oh four}`.
4. **Plan the screens.** One screen per idea, 1 to 4 elements each. Decide what stays
   and what leaves on every marker. Use the same position for the same kind of thing.
5. **List the pictures in `shots.js` and make them**: one object per picture (a server, a shield, a
   package), colorful, never white, no text on it. Run `scripts/shot-images.mjs` (see README, Pictures) and
   open every picture: remake any with gibberish text, a grey background or a cut-off object.
   Then **write `scenes.js`.** One `kit(s)`, then the calls in the order they stack. Give all
   elements of a screen the same `out`. Keep to the content band (`y` up to about 0.9).
6. **Voice and check.** `voice`, then `check`. Fix every error. Listen to acronyms.
7. **Look.** `sheet --every 2`, then `still` at two or three busy moments at full size.
   Check: nothing overlaps, no text leaves its box, every link has room to show.
8. **Render and verify.** `render`, `verify`. Report the files and what you could not
   check (the sound).

## Rules

- Draw it, do not show it. Facts go on screen as labels, code cards and status tags,
  never as a paragraph. The narration is not shown as text.
- Same meaning, same shape: a server is always the server icon, the same box, in the
  same place from one screen to the next.
- At most 5 elements on a screen, not counting one or two stickers. A sticker matches what the voice
  says (a shield for "checks who you are"), sits at a corner or in a gap, and never covers a word.
  Boxes need room for their links: leave about one box
  height between boxes that are joined by a line.
- Do not claim more than the sources do. Sample code and data must look like examples.

## Mistakes to avoid

- A marker that does not exist in `script.md`: the kit stops with an error that lists
  the closest names.
- A word cue (`at: 'server'`) that is spoken twice: it means the first time. Use a
  `[#marker]` for a later one.
- Two elements with the same `id` on screen at once; links use the id.
- Content below about 75% of the height: it sits under the app buttons.
- Long code lines: the card shrinks the text to fit, so keep lines under about 30
  characters.

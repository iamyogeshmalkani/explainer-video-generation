# man-motivation: rules for making a video with this template

For a coding agent (Claude Code and others) or a person. Read `AGENTS.md` in the explainroo folder for the general rules
and `README.md` here for the steps and the kit.

## The style

- **Black screen, four sepia portraits, one thin line.** No other color than amber and the gold of the turn. No stickers,
  no drawings, no AI pictures of real people.
- **The shape never changes**: a grid of four, three or four times in a row, with a line of the same form
  ("The body a man can build", "The wealth a man can earn", "The mind a man can master"). Repetition is the style.
- **The turn**: one gold line alone on black ("And yet"), then the grid of what is chosen instead, then one closing
  line ("Choose the work") with "Follow for more" under it, spoken and shown. The turn is the point of the video; without it the grids are only a list.
- **Fast and heavy.** A grid lasts 2.5 to 3.5 seconds; the whole video 14 to 30 seconds. About 2 words a second. A beat
  under it, no jokes.
- **Nothing in the bottom sixth**: app buttons cover it on Shorts, TikTok and Reels.

## Steps

1. **Pick the idea.** One contrast: what a man can reach against what he chooses. Write the three or four grid lines in
   the same form, the turn, and the closing line (3 to 5 words, an order, not a question).
2. **Copy the template**: `scripts/new-video.sh man-motivation <name>`.
3. **Write `script.md`.** One scene, `story`. A marker at every grid and center line: `[#g1] [#g2] ... [#y] [#g4] [#c]`.
   The narration is the same words as the lines on screen. Use `[pause 0.3]` between grids so each photo set breathes.
4. **Write `shots.js`.** `SHOTS`: 16 photos (4 per grid) with a Commons search `query` each (name of the person or thing, plus
   at most a few words; `alt` for other tries). `GRIDS` and `CENTERS` repeat the lines and markers from `script.md`.
5. **Voice and check.** `voice`, then `check`. Fix every error.
6. **Photos.** `find-photos.mjs <project>`. Open every file in `assets/`. Swap a photo that shows someone else, a group,
   a statue, a logo, a crowd, or a face that is tiny (`--only N --redo`, `--pick N=2`, or drop in your own `shotNN.jpg`).
   Give `focus` for a photo whose face is not in the upper middle.
7. **Look.** `sheet --every 1.2`: every grid has four photos, faces are not cut off, the line on the seam is readable on
   the brightest photo, the turn is alone on black.
8. **Render and verify.** `render --workers 2`, `verify`. Report the files, `credits.md`, and what you could not check
   (the sound).

## Rules

- **Never put a made-up fact, number or quote about a real person on screen.** The lines are general ("a man can build a
  body"); showing a person is not a statement about them, a caption that says something about them is. Do not caption a
  named person with a claim you cannot source.
- **No photo of a person in the "what is chosen instead" grid.** Use objects and scenes (a phone in a dark room, a bottle,
  fast food, a game console). Do not shame a real, identifiable person.
- **Credit the photographers.** Paste `credits.md` into the video description. Photos from Commons that are CC BY or CC BY-SA
  require it; public domain does not.
- **Look at every photo.** A search matches words in titles and descriptions, so it can return a group, a poster or the wrong
  person. A photo that cannot be found is replaced by one you supply, never by a stand-in that looks like the person.
- Music: keep `cinematic` at 0.5 to 0.7 so `verify` still understands the voice.

## Mistakes to avoid

- Fewer than four photos in a grid: the cell stays black. Always give four, or change the shape on purpose.
- A line on the seam longer than about 30 characters: it crosses the whole width and gets small. Shorten it.
- Dark photos on a dark side: the grade makes dark photos darker. Pick portraits with the face lit.
- A grid longer than 4 seconds: it feels stuck. Add a grid or cut the pause.
- A marker that does not exist in `script.md`: the build stops and lists the closest names.

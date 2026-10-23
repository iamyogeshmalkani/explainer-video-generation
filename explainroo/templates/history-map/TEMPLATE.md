# history-map: rules for making a video with this template

For a coding agent (Claude Code and others) or a person. Read `AGENTS.md` in
the explainroo folder for the general rules, and `README.md` here for the kit.
This file is the style guide for this one look.

## The style, measured from the reference video

A 30 second vertical history video, 720 x 1280, 30 fps, about 80 spoken words
(2.7 words a second), loudness about -15 LUFS. What it does:

- **One continuous camera.** A satellite Earth; the camera flies to each place
  the narration names, about every 3 to 4 seconds. Almost no hard cuts.
- **One idea per sentence, one thing on the map per idea.** A country lights
  up in its flag colours or a side colour, a round badge with a person appears,
  a word appears with a dashed line to the place, a year pops up.
- **Captions**: 1 to 3 words at a time, centre of the frame a little below the
  middle, heavy white type with a soft shadow, no box.
- **Years** are big, white and bold near the top, appearing as they are spoken.
- **A hook, a path, a twist.** It opens with a question or a surprise ("When
  did we start calling it ...?", "When X began, no one called it that"), walks
  through dated facts in order, and ends on a twist or a plain closing fact.
- **A flash** (bright warm light) marks the biggest moment, once.
- **Quiet music** under the voice, at the level of the narration.

## Steps

1. **Research.** Write down the facts you will use, with dates. Prefer two
   sources. Never invent a number, quote or date. If sources differ, say so in
   the script ("estimates range from ... to ...") or leave the detail out.
2. **Copy the template.** `scripts/new-video.sh history-map <name>`.
3. **Write `script.md`.** One scene named `story` (`{transition=cut hold=1.5}`)
   so the camera stays continuous. 60 to 100 words for 25 to 40 seconds.
   Short sentences. Put a `[#marker]` at the start of every sentence and
   wherever a picture should appear mid-sentence. Use `{shown|spoken}` for
   names the voice may misread, for example `{Waldseemüller|Vahlt zay mooler}`.
4. **Plan the beats.** For each sentence decide: where is the camera (lon, lat,
   span), which countries light up (flag or colour), which label or badge, which
   year. Write them as a list before you write code.
5. **Write `scenes.js`.** Follow the numbered comments in the sample: camera
   keys first (`fly`), then `basemap`, then countries, labels and badges tied to
   markers with `at` and `out`, then the screen layers (`vignette`, `title`,
   `year`, `card`, `flash`, `captions`) last. Give every overlay an `out` when
   the camera leaves, or the map fills up.
6. **Voice and check.** `voice`, then `check`. Fix every error. If the speech
   check cannot confirm a name, listen before changing it; respell only when
   the voice really says it wrong.
7. **Look.** `sheet --every 2.5` and `still` at the moments that matter. Check:
   text not cut off, nothing covers the caption line, labels not on top of each
   other, the opening frame is a good cover (set `"cover"` in video.json).
8. **Render and verify.** `render`, then `verify`. Tell the user where the files
   are and what you could not check (you cannot hear the audio).

## Rules for the map

- **Borders are today's.** The data has current countries only. For a past
  state (an empire, a front line) light up the modern countries that cover the
  area and say "present-day" in a label, or draw your own polygon with
  `s.draw`. Never present an approximate shape as exact historical borders.
- **Disputed places** (Kashmir, Crimea, Taiwan, Western Sahara and others):
  do not colour or label them as belonging to a side unless the narration says
  whose claim it is. Prefer a neutral label.
- **Flags and people.** Flags in `lib/flags.js` are drawn in code. For a
  portrait badge use an image the user owns or a public-domain image, and say
  which in your final message; otherwise use a monogram badge (`text: 'W'`).
- **Spans.** Whole Atlantic 130, Mediterranean 50, western Europe 26, one
  country 12 to 20. Zoomed in past span 15 the picture gets soft.
- **Parallel.** `setParallel(45)` for Europe and North America, `0` for Africa
  and the tropics, `-30` for South America and Australia.
- **Names.** Country names are as in `data/countries.js` (see `REGIONS` and the
  aliases at the top of `lib/kit.js`). A wrong name stops with a hint.

## Rules for the voice and captions

- English: Kokoro `af_heart` (default) or any voice from `explainroo voices`.
  For a quicker, newsreel feel use `"pace": 1.1` and `"speed": 1.0`.
- This template draws its own captions, so keep `"captions": false`. The `.srt`
  and `.vtt` files are still written.
- Other languages: set `language` and a matching `voice` in video.json, write
  the narration in that language, and keep labels short. Hindi notes from
  earlier projects: write years as digits (they read well), avoid ending a
  phrase on "हुआ", and respell "एकादशी" as "एका दशी" in the spoken form.

## Mistakes to avoid

- Calling `fly` after drawing something. It must be first in the scene.
- More than one scene unless the place changes completely. Extra scenes reset
  the camera; start the next scene's first view where the last one ended.
- A cue word spoken twice (`at: 'war'`). Use markers.
- Labels that stay on screen after the camera has left. Add `out`.
- Text inside the top 12% or the bottom 15%: on vertical sizes the apps cover it.
- Claims in labels that the narration does not support.

## Checklist before telling the user it is done

- [ ] every date and number checked against a source
- [ ] `check` has no errors and the hints were looked at
- [ ] stills at each year tag and at the last frame were opened and read
- [ ] `verify` run; its warnings explained in the message
- [ ] pronunciation of names flagged as "not checked by ear"
- [ ] the credits for the picture and data kept in the project (`assets/ATTRIBUTION.md`)

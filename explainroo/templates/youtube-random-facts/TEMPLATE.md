# youtube-random-facts: rules for making a video with this template

For a coding agent or a person. Read `AGENTS.md` in the explainroo folder for the general rules and
`README.md` here for the steps. The look, the kit (`lib/pop.js`), the sticker rules and the sound
rules are the same as in `templates/sticker-pop/TEMPLATE.md`; this file lists only what changes.

## The style

- **One fact per video, 20 to 35 seconds, 6 to 8 scenes.** Not a list of facts.
- **The hook comes first, in the first scene.** The narration opens with "Did you know..." (or "Ever wondered",
  "Think you know") and the fact follows at once in the second scene. The first scene is yellow (`sun`)
  with the title `DID YOU\nKNOW?` and a sticker of the subject. Never open with "In this video" or a greeting.
- **The fact is one claim with one number, name or date.** Put that number on screen as a `chip` or `title`.
- **The middle** alternates `blueprint`, `paper` and `sun` for rhythm, one idea per scene, something new
  every 0.5 to 1.5 seconds.
- **The last scene** is `sun` with `NOW YOU\nKNOW!` and a short follow line ("Follow for more tech facts").
- Contents stay in the upper two thirds; the bottom third is for app buttons.

## Steps

1. Pick a fact from `FACTS.md` (or research a new one). **Check it in a second source.** Never invent a number.
   If sources disagree on a detail, leave the detail out or say "about".
2. Copy the template: `scripts/new-video.sh youtube-random-facts <name>`.
3. Write `script.md`: one scene `story`, short sentences (8 to 14 words), a `[#sN]` marker at every scene change.
   Put a hook in `[loud]...[/loud]` (the first words) and the key number too.
   Write numbers the way the voice should say them: `{1985|nineteen eighty-five}`.
4. Write `shots.js` (one object per sticker; no text, no logos, no real brand names), then `scenes.js`.
5. `voice`, `check`, pictures, `sheet`, `render`, `verify` (see `README.md`).
6. Report the files and say that you could not hear the sound.

## Hindi videos

Copy `hindi/script.md`, `hindi/scenes.js` and `hindi/video.json` over the project's files (see `README.md`). The hook
becomes "क्या आप जानते हैं ...?" and the first scene's title `क्या आप\nजानते हैं?`; the closer is `अब आप\nजान गए!` with
a follow line. Take the hook from the entry's "Hindi hook" in `FACTS.md`. Put years and numbers in
`{1998|उन्नीस सौ अट्ठानवे}` form, keep titles to 2 short lines, and run `check`: a low "confirmed" percentage is normal
for Hindi, a mispronounced word is not (fix it with `{shown|spoken}`).

## Rules

- Everything in sticker-pop's TEMPLATE.md "Rules" and "Mistakes to avoid" applies.
- A fact that is a popular myth or disputed must say so on screen or be dropped (see the notes in `FACTS.md`).
- A portrait of a real person made by a picture model is an illustration, not a likeness. Say so.

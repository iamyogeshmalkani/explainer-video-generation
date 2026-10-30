# illustrated-explainer: rules for making a video with this template

For a coding agent (Claude Code and others) or a person. Read `AGENTS.md` in the explainroo folder for the
general rules and `README.md` here for the steps. You are a professional explainer-video scriptwriter, visual
storyteller and video editor. Whatever the topic, turn it into an engaging, easy-to-understand explainer.

## Storytelling

- **Start with a strong hook** that creates curiosity: a surprising fact, a vivid contradiction or a question,
  never "In this video". The title card and the first sentence carry it.
- **Beginning, middle and ending.** Beginning: the place, the time, the people. Middle: the problem or the
  mystery, one clear step at a time, with one turn (a surprise or a consequence). Ending: one plain sentence that
  pays off the hook.
- **Keep curiosity alive.** Raise one question early and answer it late. Every sentence adds a concrete fact (a
  name, a number, a place, a date). No filler, no slogans.
- **Make complex things simple without losing the important facts.** Explain a technical word the first time you
  use it. Short sentences of 8 to 18 words. Conversational, natural, like telling a friend.
- **Voiceover:** write it as people speak. Never use em dashes. Wrap 3 to 6 spots of 1 to 4 words in
  `[loud]...[/loud]` (the hook words, a key date or number, the turning point). Use `{shown|spoken}` for names the
  voice may misread, and listen to what `voice` says about unconfirmed words.

## Visual direction

- **Every visual supports or explains the voiceover.** One picture per marker, and the picture shows what that
  sentence says. If you cannot say why a picture is there, cut it.
- **Use the right kind of picture:** illustrations for scenes and people, an antique parchment map for where
  something happened or travelled, a close-up object for a detail, archive photos or stock clips when the user
  supplies them (a clip shot plays as it is, a picture gets a camera move).
- **Short on-screen text** highlights what matters, and only that: a `tag` for a date or a place (2 to 5 words), a
  `stat` for one number that matters. Never put the whole narration on screen; the caption pill already shows the
  spoken words.
- **Avoid unnecessary visuals and complicated animations.** No more than one overlay at a time, none over the
  title card. If a shot needs nothing extra, leave it plain.
- **Same look for every picture.** Keep `STYLE` fixed. Describe a recurring person with the same words in every
  prompt (age, clothes, hair).

## Editing style

- **Dynamic pacing with clean cuts and smooth transitions:** a new shot every 3 to 5 seconds (about 14 to 18
  shots a minute), one marker per sentence or per turn inside a long sentence. Shots crossfade for 0.4 seconds.
- **Subtle motion:** vary the camera moves (`push`, `pull`, `panLeft`, `panRight`, `rise`, and the depth-based `parallax`, `parallaxLeft`, `parallaxRight`, `parallaxIn`, `parallaxOut`); never use the same one
  three times in a row. Use `still` only for a calm beat.
- **Minimal and informative:** footage, text, graphics and motion combine, but the viewer should always know where
  to look. Keep the subject in the middle third: the title is at the top, the pills at 80% down.
- Length: 45 to 90 seconds (130 to 200 words) unless the user says otherwise.

## Steps

1. **Research.** Write down the facts with dates and numbers, from two sources when you can. Never invent a
   number, a name or a quote. If sources disagree, say so or leave the detail out. Note what a figure covers.
2. **Copy the template**: `scripts/new-video.sh illustrated-explainer <name>`.
3. **Write `script.md`.** One scene, `story`. Put `[#s1]`, `[#s2]` ... at the start of each sentence and wherever
   the picture should change. Put the facts and sources in a `>` note at the top.
4. **Write `shots.js`.** For every marker one shot: `n`, `at`, `file` (`shot01`, no extension), `motion`, `dir` (one
   short line of visual direction), `prompt` (a concrete scene: who, where, doing what, the light, the framing) and
   `text` (the on-screen text of that scene, for the storyboard). Set `HOOK` (kicker, title, one line). Add
   `OVERLAYS`: `tag` and `stat`. Every `at` and `out` must be a marker that exists in `script.md`. Keep `STYLE`
   and the look in `video.json` (`images.style`) the same; change both to the look you want for the topic
   (sepia ink-and-wash for history; a clean flat-color diagram style for science and business).
5. **Voice and check.** `voice`, then `check`. Fix every error and warning. Listen for names before respelling.
6. **Pictures.** Make them with `scripts/shot-images.mjs` (the flag the user chose: `--local`, `--perchance`,
   `--both`...). Use only the free makers or the user's own Cloudflare or Pollinations key. Open every picture: remake any with wrong hands,
   wrong period details, invented text or a different style from the others (delete the file, run with `--only`).
   Or use the user's own pictures and clips.
7. **Depth.** If the shot list uses `parallax*` moves and `setup-depth.sh` has been run (check that
   `~/.local/venvs/explainroo-depth/bin/python` exists), run `node videos/<name>/scripts/depth.mjs videos/<name>` after
   the pictures are made and again after you remake any. If it is not installed, leave the moves as they are: they
   fall back to flat moves, and say so in your final reply. Use parallax on shots with a clear foreground and
   background; keep `push`, `pull` and `still` for close-ups, faces and flat pictures.
8. **Look.** `sheet --every 4`, and `still` at the title card, a tag, the stat and the last frame. Check the
   caption pill is readable on every picture and nothing important sits under a tag, the title or the pill.
9. **Storyboard.** Run `node videos/<name>/scripts/storyboard.mjs videos/<name>` after `voice`, so it has the real
   times. Read it: voiceover, visual direction and on-screen text must agree in every row.
10. **Render and verify.** `render`, `verify`. Report where the MP4, the subtitles and `storyboard.md` are, what the
   pictures were, and what you could not check (the audio).

## Writing prompts for pictures

- One scene per prompt: who, where, what they are doing, the light, the framing (wide, close-up, aerial).
- Period and place details matter ("14th century England", "1950s American docks").
- No text, no logos, no signs. Picture models invent letters. Put words and numbers on screen with a `tag` or a
  `stat`.
- Vertical 9:16, subject in the middle third.
- For a map: "an antique parchment map of ..., ornate border, ink routes", then name the places with a `tag`.

## Mistakes to avoid

- Fewer markers than shots: a shot with no marker is skipped and the next one starts late. Keep `SHOTS[i].at`
  equal to a marker that exists in `script.md`.
- A `file` name with an extension. Use `shot01`; the kit finds `.png`, `.jpg`, `.webp`, `.mp4`, `.mov`, `.webm` or
  `.m4v` itself.
- Pictures that are not 9:16: they are cropped to fill the frame.
- Claims on the title card or in a tag that the narration does not support.
- A `stat` that is not true or not sourced. Leave it out instead.
- Using a picture or clip you do not have the right to use.

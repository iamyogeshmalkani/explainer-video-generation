# book-summary: rules for making a video with this template

For a coding agent (Claude Code and others) or a person. Read `AGENTS.md` in the explainroo
folder for the general rules and `README.md` here for the steps.

## The style, measured from the reference

A 60 second vertical video (720 x 1280, 30 fps, about -16 LUFS, quiet).

- **Opening**: a book cover card. The author in small red capitals between two thin lines,
  then the title large and white in a serif, stacked on lines. It lasts about 2 seconds.
- **Body**: about 45 seconds of one picture after another (paintings, engravings, photos,
  covers), each 2 to 6 seconds with a slow push or pan. No on-screen text and no captions.
- **Ending**: three numbered takeaways. A roman numeral (I, II, III) appears first, then
  about a second later a short line in small white text with a dark outline, centered. The
  three crossfade over one continuous slow shot.
- **Sound**: narration, with quiet music underneath.

## Steps

1. **Check the facts.** Read at least two sources for the plot and the key facts. Write down
   only what you can support. Do not invent quotes, names, figures or ending details; if
   sources disagree, leave the detail out. Put the sources in a note at the top of
   `script.md`.
2. **Copy the template**: `scripts/new-video.sh book-summary <name>`.
3. **Write `script.md`.** One scene, `story`. 110 to 150 words for 50 to 65 seconds. Start with
   the book, author and year, then the story in order, then a plain closing line. Put `[#s1]`,
   `[#s2]` ... at the start of each sentence (and mid-sentence in a long one), and
   `[#t1]` `[#t2]` `[#t3]` at the start of the three takeaways. Respell names and numbers the
   voice may misread: `{1936|spoken form}`.
4. **Write `shots.js`.** `COVER`, `CAPTIONS`, `TAKEAWAYS`, and one shot for every marker: a
   concrete prompt, a motion, a file name. Count carefully: the shot with `at: '#s7'` must be
   the picture for sentence 7. The last shot starts at the final story marker and runs under
   the takeaways.
5. **Voice and check.** `voice`, then `check`. Fix every error.
6. **Pictures.** `scripts/shot-images.mjs <project> --pollinations` (or `--local`). Open every
   picture; remake wrong ones (extra fingers, invented text, wrong period details).
7. **Look.** `sheet --every 3`, then `still` at the cover and a takeaway at full size. Check
   that each picture matches the sentence being spoken, the cover is readable, subtitles do
   not cover the cover text, and takeaways are not too small.
8. **Render and verify.** `render`, `verify`. Report the files (`.mp4`, `.srt`, `.vtt`) and what
   you could not check (the sound).

## Rules

- One idea per sentence, short sentences, plain words. The summary tells the story in
  order and ends on the outcome or the lesson.
- The three takeaways are your own reading unless you can quote the book exactly. Do not
  present them as quotes. If you do quote, quote only text you have verified.
- Say what a source claims, not more. Reviews, sales figures and rankings need a source.
- Pictures: one scene per prompt, the same style words in every prompt (`STYLE`), no text,
  no logos. Recurring characters: use the same description every time, or avoid close faces.
- Minors: no romantic or sexualised pictures of characters who are minors; show objects,
  hands and distant silhouettes.
- Use only pictures you have the right to use. Do not use real book covers.

## Mistakes to avoid

- A shot list that is one sentence out of step with the script. Check the sheet frame by
  frame against the subtitles.
- A cover held for 6 seconds: it hides the first sentence. Use `out: 3.4` or less.
- A marker that does not exist in `script.md`: the build stops and lists the closest names.
- Takeaway lines longer than about 60 characters: they wrap to three lines.
- Captions and takeaway text on screen together: `CAPTIONS` stops at the first takeaway on
  its own; keep it that way.

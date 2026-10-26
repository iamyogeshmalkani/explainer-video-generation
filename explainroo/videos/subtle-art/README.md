# book-summary: a book in under a minute

A vertical (9:16) summary video of a book: an opening cover card (author, title), a
sequence of pictures with slow camera moves while the narrator tells the story, and three
numbered takeaways at the end. Optional subtitles (three words at a time, the spoken word
lit). The voice, music, timing and rendering run on your computer through explainroo.

It was studied from a 60 second "The Art of War" book summary (720 x 1280, 30 fps):
a cover card, about 45 seconds of paintings and photos with slow zooms and no on-screen
text, then three numbered quotes (I, II, III) over one slow shot. Only the structure was
taken. The sample here is *Godaan* by Munshi Premchand, in Hindi.

## What you need to supply

The template does not make pictures. Every shot needs a picture or a clip:

| Source | Cost | Notes |
|---|---|---|
| `scripts/shot-images.mjs <project> --pollinations` | hosted FLUX on pollinations.ai; needs `POLLINATIONS_API_KEY` in `explainroo/.env`; prompts are sent to that service | about 10 seconds a picture |
| `scripts/shot-images.mjs <project> --local` | free, on this Mac; about 2 minutes a picture | needs `sh setup-local-images.sh` once |
| `scripts/shot-images.mjs <project>` | paid OpenRouter pictures; asks for `--yes` | needs an OpenRouter key |
| Your own pictures or clips | depends | save as `assets/shot01.png` (or `.jpg`, `.webp`, `.mp4`), 9:16 |

Until a file exists, its shot shows a placeholder with the shot number and prompt. Use only
pictures you have the right to use. Real book covers are copyrighted; the sample draws its
own cover card.

## Make a video

```bash
cd explainroo
scripts/new-video.sh book-summary my-book            # copies this template to videos/my-book
# 1. edit videos/my-book/script.md   (the summary, with [#s1] [#s2] ... markers)
# 2. edit videos/my-book/shots.js    (COVER, CAPTIONS, TAKEAWAYS, and one line per shot)
# 3. edit videos/my-book/video.json  ("language", "voice")
node bin/explainroo.js voice  videos/my-book
node bin/explainroo.js check  videos/my-book
node videos/my-book/scripts/shot-images.mjs videos/my-book --pollinations
node bin/explainroo.js sheet  videos/my-book --every 3
node bin/explainroo.js render videos/my-book
node bin/explainroo.js verify videos/my-book
```

Rendering also writes `out/video.srt` and `out/video.vtt` (subtitle files for YouTube) and a
cover image.

Or give an AI coding agent this prompt (it follows `TEMPLATE.md`):

```text
Make a 60 second book summary of [book] by [author] in [language] with explainroo. Copy the
book-summary template (scripts/new-video.sh book-summary <name>), read
templates/book-summary/TEMPLATE.md and AGENTS.md, check the facts first, write the script and
shot list, and check everything with sheet and still.
```

## The files

| File | What it is |
|---|---|
| `script.md` | the narration; one scene with `[#s1]`, `[#s2]` ... where each shot starts, and `[#t1]`, `[#t2]`, `[#t3]` for the takeaways |
| `shots.js` | `COVER`, `CAPTIONS` (true or false), `TAKEAWAYS`, `STYLE` and the shot list |
| `scenes.js` | turns those into the video (you rarely edit it) |
| `lib/shots.js` | pictures with camera moves, captions, vignette |
| `lib/book.js` | `cover()` and `takeaway()` |
| `video.json`, `look.json` | size, language, voice, music |

## Settings that matter

- `COVER.out` is a time in seconds (`3.4`) or a marker (`'#s2'`). The reference shows its cover
  for about 2 seconds; keep it short. `COVER.y` moves the card up (0.2) so subtitles stay clear.
- `CAPTIONS = true` draws subtitles. They stop where the takeaways start, because the
  takeaways already show the narration.
- Other languages: set `"language"` and a voice in `video.json` (`explainroo voices --language hi`).
  Hindi and the other non-English languages need `brew install espeak-ng`. Write years and
  numbers as `{1936|spoken form}` in the script.
- Music: `"music": { "style": "calm", "volume": 0.45 }`.

## Limits

- Pictures are made from text only, so a recurring person looks a little different from shot
  to shot. Describe them with the same words in every prompt, or use objects, hands and
  silhouettes (which the Fault in Our Stars sample does).
- Where the characters are minors, keep pictures non-romantic and free of close faces.
- The speech check is weak in Hindi (60 to 80 percent confirmed is normal). With music it can
  report much less, so listen, and lower the music if it is hard to follow.

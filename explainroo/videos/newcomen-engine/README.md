# story-shots: a storyboard-style history/business explainer

A vertical (9:16) video made of a **shot list**: a picture or a short clip every
3 to 4 seconds, a slow camera move on each picture, the narration a few words
at a time with the spoken word lit up in yellow, a title card with blue
highlighted words, and drawn overlays for facts. The voice, the music, the
timing and the rendering run on your computer through explainroo.

It is modelled on a style of short "how it happened" videos: a hook ("Before X,
there was Y"), a problem that gets worse, a person with an idea, a number that
explains why it worked, and an ending with a twist. The sample tells how the
shipping container cut the cost of loading a ship.

## What you need to supply (this is the important part)

The template does not make pictures. Every shot needs a picture or a clip, and
you choose where it comes from:

| Source | Cost | Notes |
|---|---|---|
| `scripts/shot-images.mjs` (explainroo's `image` command, AI pictures through OpenRouter) | paid: about 7 to 13 cents a picture, about half with `--cheap`; the 14 sample shots are about $1 to $2 | needs an OpenRouter key; sends your prompts to that service; **not tested here, no key was available** |
| Pictures you make or license elsewhere (any image tool, stock, your own photos) | depends | save as `assets/shot01.png` (or `.jpg`, `.webp`), 9:16 |
| Short video clips (any image-to-video tool, stock footage, screen recordings) | depends | save as `assets/shot01.mp4` (or `.mov`, `.webm`); the clip plays as it is |

Until a file exists, its shot shows a placeholder with the shot number and its
prompt, so you can check the story, the timing and the captions first.

Use only pictures and clips you have the right to use.

## Make a video

```bash
cd explainroo
scripts/new-video.sh story-shots my-topic              # copies this template to videos/my-topic
# 1. edit videos/my-topic/script.md  (narration with [#s1] [#s2] ... markers)
# 2. edit videos/my-topic/shots.js   (one line per shot: prompt, camera move, hook, boards)
node bin/explainroo.js voice videos/my-topic
node bin/explainroo.js check videos/my-topic
node videos/my-topic/scripts/shot-images.mjs videos/my-topic --dry-run   # what would be made, and the cost
# make or add the pictures and clips in videos/my-topic/assets/, then:
node bin/explainroo.js sheet  videos/my-topic --every 3
node bin/explainroo.js render videos/my-topic
node bin/explainroo.js verify videos/my-topic
```

Or give an AI coding agent this prompt (it follows `TEMPLATE.md`):

```text
Make a 60 second story video about [topic] with explainroo. Copy the story-shots
template (scripts/new-video.sh story-shots <name>), read templates/story-shots/TEMPLATE.md
and AGENTS.md, write the script and shot list, and check everything. Tell me what the
pictures will cost before making any.
```

## The files

| File | What it is |
|---|---|
| `script.md` | the narration; one scene, with `[#s1]`, `[#s2]` ... where each shot starts |
| `shots.js` | the shot list (`SHOTS`), the title card (`HOOK`), the number boards (`BOARDS`), the shared picture style (`STYLE`) |
| `scenes.js` | turns the shot list into the video (you rarely edit it) |
| `lib/shots.js` | the kit: `shots`, `vignette`, `hook`, `compare`, `captions` |
| `video.json`, `look.json` | size, voice, music, `"captions": false` (the kit draws its own) |
| `scripts/shot-images.mjs` | makes the missing pictures with explainroo's image command (asks for `--yes`) |

## Camera moves for pictures

`push` (slow zoom in), `pull` (zoom out), `panLeft`, `panRight`, `rise`, `still`.
A clip is not moved; it plays. Options on a clip shot: `speed` (0.25 to 4) and
`from` (start second in the clip).

## Limits

- No picture or footage is made for you unless you run the paid image script.
- The motion inside the reference's clips (people walking, water moving) comes
  from an image-to-video tool; with still pictures you get camera moves only.
- Facts on screen (numbers, dates, names) are drawn by the kit, because picture
  models spell and count badly. Do not ask a picture for text.
- The reference was mastered loud (-10 LUFS). This template targets -14 LUFS, a
  common level for social video; change `loudness` in video.json to match another.
- Voices are explainroo's (Kokoro, or ElevenLabs with your own key). The
  reference's voice is not reproduced.

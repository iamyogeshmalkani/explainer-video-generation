# illustrated-explainer: a hook-first illustrated explainer with a scene-by-scene storyboard

A vertical (9:16) explainer made of a **shot list**: an illustration, archive picture or stock clip every 3 to
5 seconds, a slow camera move on each picture, soft crossfades, a title card, a small date or place tag, one
big number when a fact needs it, and the narration as a short caption pill with the spoken word lit gold.
The voice, the music, the timing and the rendering run on your computer through explainroo. It is modelled on
illustrated history-story shorts (a sepia ink-and-wash look, a hook, then a story told one picture at a time),
but it works for any topic that can be told as a story: history, science, business, a place, an invention.

Every video also gets a **`storyboard.md`**: the scene-by-scene sheet with the voiceover, the visual direction,
the camera move and the on-screen text of each scene.

## The shape of the story

1. **Hook** in the first sentence and on the title card: something that makes the viewer ask "what happened?"
2. **Beginning**: set the place, the time and the people.
3. **Middle**: the problem gets worse, one clear step at a time, with one turn (a surprise or a consequence).
4. **Ending**: what it led to, in one plain sentence that pays off the hook.

## What you need to supply

The template does not make pictures by itself. Every shot needs a picture or a clip:

| Source | Cost | Notes |
|---|---|---|
| `scripts/shot-images.mjs <project> --local` | free; about 2 minutes a picture on an M2 | one-time setup: `sh setup-local-images.sh` in the repository root; nothing leaves your computer |
| `scripts/shot-images.mjs <project> --perchance` | free, about 25 seconds a picture | opens perchance.org in a Chrome window; the prompts are sent to that website |
| `scripts/shot-images.mjs <project> --both` | free | local and Perchance at the same time |
| `--cloudflare`, `--pollinations` | free allowance / needs a key | prompts are sent to those services |
| Your own pictures, archive photos or stock footage | depends | save as `assets/shot01.png` (or `.jpg`, `.webp`), 9:16; a clip as `assets/shot01.mp4` (or `.mov`, `.webm`) and it plays as it is |

Until a file exists, its shot shows a placeholder with the scene number and its visual direction, so you can check
the story, the timing and the captions first. Use only pictures and clips you have the right to use.

## Make a video

```bash
cd explainroo
scripts/new-video.sh illustrated-explainer my-topic     # copies this template to videos/my-topic
# 1. edit videos/my-topic/script.md   (narration with [#s1] [#s2] ... markers)
# 2. edit videos/my-topic/shots.js    (one entry per marker: prompt, direction, camera move; HOOK; OVERLAYS)
node bin/explainroo.js voice videos/my-topic
node bin/explainroo.js check videos/my-topic
node videos/my-topic/scripts/shot-images.mjs videos/my-topic --dry-run
# make or add the pictures in videos/my-topic/assets/, then:
node bin/explainroo.js sheet  videos/my-topic --every 4
node videos/my-topic/scripts/storyboard.mjs videos/my-topic     # writes videos/my-topic/storyboard.md
node bin/explainroo.js render videos/my-topic
node bin/explainroo.js verify videos/my-topic
```

Or give an AI coding agent this prompt (it follows `TEMPLATE.md`):

```text
Make a 60 second explainer about [topic] with explainroo. Copy the illustrated-explainer template
(scripts/new-video.sh illustrated-explainer <name>), read templates/illustrated-explainer/TEMPLATE.md and
AGENTS.md, write the script, the shot list and the storyboard, and check everything.
```

## The files

| File | What it is |
|---|---|
| `script.md` | the narration; one scene, with `[#s1]`, `[#s2]` ... where each shot starts |
| `shots.js` | the shot list (`SHOTS`), the title card (`HOOK`), tags and numbers (`OVERLAYS`), the shared picture style (`STYLE`) |
| `scenes.js` | turns the shot list into the video (you rarely edit it) |
| `lib/illustrated.js` | the kit: `shots`, `grade`, `titleCard`, `tag`, `stat`, `captions` |
| `video.json`, `look.json` | size, voice, music, `"captions": false` (the kit draws its own), colors and fonts |
| `scripts/shot-images.mjs` | makes the missing pictures with explainroo's image command |
| `scripts/depth.mjs` | makes a depth map for every picture, for the parallax moves (needs `setup-depth.sh`) |
| `scripts/storyboard.mjs` | writes `storyboard.md` from `script.md` and `shots.js` |

## Camera moves for pictures

`push` (slow zoom in), `pull` (zoom out), `panLeft`, `panRight`, `rise`, `still`, and the 3D `parallax` moves (see Image depth). A clip is not moved; it plays.
Options on a clip shot: `speed` (0.25 to 4) and `from` (start second in the clip).

## Image depth (parallax)

A picture with a depth map moves in 3D: near things shift and grow more than far things, like a real camera
travelling through the scene. The moves are `parallax`, `parallaxLeft`, `parallaxRight`, `parallaxIn` (a dolly
in) and `parallaxOut`. Use them on shots with a clear foreground and background (a person in front of a street,
a ship in front of a sky), and keep the flat moves for close-ups and flat pictures.

```bash
sh setup-depth.sh                                              # once, in the repository root (torch, about 1 GB)
node videos/my-topic/scripts/depth.mjs videos/my-topic         # writes assets/shot01.depth.png for every picture
```

The depth model runs on this computer (the Apple GPU when there is one) and takes a few seconds a picture; the
first run downloads about 100 MB. `--only shot01,shot05` and `--redo` work too. Without a depth map the parallax
moves fall back to a flat `push`, `pan` or `pull`, so a video still renders on a computer without torch. Open a
depth map when a move looks wrong: white is near, black is far. Use only moves of 3 to 5 seconds; a very long
parallax shot shows its stretched edges.

## On-screen elements

| Element | Use it for |
|---|---|
| title card (`HOOK`) | the first sentence: a kicker (date and place), the title, one line under it |
| `tag` | a date or a place when it changes ("Autumn 1348 · London"), 2 to 5 words |
| `stat` | one number that matters, with a short label; a plain number counts up |
| caption pill | the spoken words, a short phrase at a time, always on |

## Limits

- No picture or footage is made for you unless you run an image script; stock and archive footage you add yourself.
- With still pictures you get camera moves only; real motion inside a shot needs a clip.
- Facts on screen (numbers, dates, names) are drawn by the kit, because picture models spell and count badly.
  Do not ask a picture for text.
- Maps are pictures too: describe an old parchment map in the prompt, and put the place names in a `tag`.
- The sample (the Black Death in England) is written from standard histories; check every figure again before
  publishing a video of your own.

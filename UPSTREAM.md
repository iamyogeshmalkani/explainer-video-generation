# About the explainroo copy in this repository

`explainroo/` is a copy of https://github.com/vincentsch/explainroo (MIT license,
Copyright (c) 2026 Vincent Schmalbach; the license file is in `explainroo/LICENSE`),
taken at upstream commit **e95232c** ("README: news of the 0.4.1 release", explainroo 0.4.1).
It is vendored as plain files so one clone of this repository has everything.

## What we added or changed

- `explainroo/templates/history-map/`, `explainroo/templates/story-shots/` and `explainroo/templates/motivation/` (a quote, paintings and one-word captions; Playfair Display font under the SIL OFL), `explainroo/templates/book-summary/` (a cover card, pictures, subtitles and numbered takeaways), `explainroo/templates/tech-explainer/` (neon tech explainers, drawn by `lib/kit.js`; the Outfit font is under the SIL OFL), with
  `explainroo/templates/README.md`
- `explainroo/src/ffmpeg.js` and `src/render.js`: `EXPLAINROO_QUALITY=high` (opt-in, final renders only): JPEG frames at 0.99 instead of 0.93, x264 `slow` at crf 12 with the `film` tune instead of `veryfast` crf 17 `animation`, and 320k audio. Defaults are unchanged. Measured on a 10 second painting clip: SSIM 0.975 against 0.966, about 4 times the file size, about 4 times the render time
- `explainroo/templates/dark-history/` motion kit (`lib/epic.js`: an eased, hand-held camera with shake and a roll, real 2.5D layers from depth maps or a flat ground-plane bend, drifting mist, dust and ash, a flickering fire glow, flash frames, film grain, breathing edges and popping captions; `scripts/make-depth.py` makes the depth maps with Depth Anything V2 Small through `uv run`, optional)
- `explainroo/templates/clay-stopmotion/` (claymation-style explainers made from free AI clay pictures: `lib/clay.js` moves full-frame backdrops in 10-pose-a-second steps with a small boil, and cuts clay puppets out of a flat green background (`keyColored`: region growing from the border, so pale clay survives) to pop, drop, slide, hop and breathe on the same steps; Kalam under the SIL OFL, already bundled; the image script makes both kinds of picture)
- `explainroo/scripts/new-video.sh` (copies a template into `videos/<name>`)
- `explainroo/.gitignore`: the `videos/` line was removed so our video sources are tracked
- `explainroo/videos/`: the videos made so far (sources only)
- `explainroo/src/script.js`, `src/voice.js`, `src/wav.js`, `src/project.js`: a `[loud]...[/loud]` tag for the narration. The tagged words are made louder (`emphasisDb`, default 4 dB) after the voice is made, using the word timings, so the voice is stronger where the viewer should focus (the intro, key names, numbers, the closing point). Scenes without the tag keep their voice cache. Rule in AGENTS.md; the UI brief repeats it.
- `explainroo/templates/sticker-pop/lib/pop.js`: sound levels (`pop(s, { sound })`: `calm` is the default, then `light`, `off`, `full` = the old behaviour). The kit played a pop plus a click on almost every element, which was distracting; `calm` plays one soft sound for the big elements, at most one a second.
- `explainroo/templates/founder-story/` (real, openly licensed photographs from Wikimedia Commons, found and credited by `scripts/find-photos.mjs`; Ken Burns moves, plates, stats, quotes, captions and an end credits card in `lib/story.js`; the story structure is researched in its `TEMPLATE.md`; Playfair Display under the SIL OFL; `photos()` allows a photograph 4 seconds on screen at most) and `explainroo/engine/audio/music.js` + `src/project.js`: a new `inspiring` music style (sparse piano that grows over legato strings, a soft beat at the climax, major key, about 96 bpm)
- `explainroo/templates/man-motivation/` (a vertical motivation short studied from a 12 second reference: 2 x 2 sepia portrait grids with a line on the seam, a gold turn alone on black, dust and thuds under the `cinematic` music; photos found and credited by a copy of founder-story's `scripts/find-photos.mjs`; kit in `lib/grid.js`; Inter under the SIL OFL)
- `explainroo/src/perchance.js`, `src/images.js`, `src/cli.js`: two more image models. `perchance` drives perchance.org's free generator in a Chrome window with its own profile (no API, no key; the site's Cloudflare human check is not bypassed, a person ticks it if it appears). `cloudflare` uses Workers AI (FLUX.1 schnell for square pictures, SDXL Lightning for other shapes; `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`). The templates' `scripts/shot-images.mjs` got `--perchance`, `--cloudflare`, `--both` and `--all`, which run several makers at the same time from one shared list of missing pictures. Perchance itself works in several browser tabs at once (`--tabs N` / `EXPLAINROO_PERCHANCE_TABS`, default 3, at most 6; `perchanceTabs()` in `src/perchance.js`, which also takes a lock while it starts Chrome so parallel tabs share one window).
- `explainroo/src/images.js` and `src/cli.js`: `local` (Z-Image-Turbo through mflux, free) and `pollinations` (hosted FLUX, `POLLINATIONS_API_KEY`) image models (`--model local|pollinations`); `explainroo/templates/story-shots/scripts/shot-images.mjs` has a matching `--local` flag
- `explainroo/engine/audio/music.js`: a new `cinematic` music style (also in `src/project.js` and AGENTS.md), and `explainroo/dev/music-preview.mjs` to render a style to a WAV
- `explainroo/templates/dark-history-hindi/` (dark-history in Hindi: Devanagari captions and hook, upright captions, `epic` music) and `explainroo/scripts/series.mjs` + `explainroo/series/` (a series file with many video scripts; the runner builds, paints, voices and renders them all, with the three image makers sharing one queue)
- removed the ElevenLabs voice provider (`src/elevenlabs.js`, `voice.provider: "elevenlabs"`, `voices --elevenlabs`) and the OpenRouter picture models (`--model best|cheap`, `--ref`, `--yes`, `--cheap`); the default picture maker is now `perchance`. Pictures come from `local`, `perchance`, `cloudflare` or `pollinations`.
- at the repository root: `setup.sh`, `setup-local-images.sh`, `env.sh` (also picks a native arm64 ffprobe from `tools/`, installed with `npm install @ffprobe-installer/ffprobe`), `SETUP.md`, `tools/`

Everything else is upstream's.

## Updating from upstream

```bash
git clone https://github.com/vincentsch/explainroo.git /tmp/explainroo-new
# compare /tmp/explainroo-new with explainroo/, copy over the upstream changes,
# and keep our additions listed above.
```

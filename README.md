<img src="assets/icon.svg" width="64" height="64" alt="">

# Explainer Video generation

Narrated explainer videos made on your own computer with
[explainroo](https://github.com/vincentsch/explainroo) (free, open source): the voice,
the word timing, the music, the sound effects and the rendering all run locally.
This repository holds explainroo, our templates for it, and the videos made so far.

Created in [T3 Code](https://t3.codes).

**New Mac?** Run `sh setup.sh`, then read [SETUP.md](SETUP.md).

## What is here

| Folder | What it is |
|---|---|
| `explainroo/` | explainroo itself (a copy of upstream, see [UPSTREAM.md](UPSTREAM.md)) |
| `explainroo/templates/history-map/` | satellite-map history videos: flying camera, flags, year tags |
| `explainroo/templates/story-shots/` | storyboard videos: a picture or clip per shot, lit captions, title card |
| `explainroo/videos/` | our videos: `script.md`, `scenes.js`, `video.json`, `look.json`, assets |
| `tools/` | ffmpeg and ffprobe (from npm) and the map-data builder |

Rendered videos, model files and reference material are not stored here; see SETUP.md.

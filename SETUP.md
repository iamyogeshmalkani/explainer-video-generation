# Setting this up on a new Mac

## 1. Get the code and install (once)

```bash
git clone <this repository's URL> explainer-video-generation
cd explainer-video-generation
sh setup.sh
```

`setup.sh` needs Node.js 20 or newer (https://nodejs.org) and Google Chrome. It
installs the dependencies, ffmpeg and ffprobe (from npm, so no Homebrew needed),
and downloads the voice and speech-check models (about 400 MB, kept in
`~/.cache/explainroo`). On a slow connection a download can reset; run
`sh setup.sh` again and it carries on.

In every new terminal, from the repository root:

```bash
. ./env.sh          # points explainroo at ffmpeg and adds the `explainroo` command
```

### Optional: pictures made on your Mac (free)

```bash
sh setup-local-images.sh     # installs mflux and downloads Z-Image-Turbo, 4-bit (about 6 GB)
```

Then `explainroo image <project> <name> "<what to draw>" --model local`, or
`node scripts/shot-images.mjs <project> --local` inside a story-shots video. It needs
Apple Silicon and 16 GB of memory; a picture takes about 2 minutes at 576x1024.

## 2. Make a video

```bash
cd explainroo
scripts/new-video.sh history-map my-topic     # or story-shots, or: node bin/explainroo.js init videos/my-topic
# edit videos/my-topic/script.md and scenes.js (the template's README.md says how)
node bin/explainroo.js voice  videos/my-topic
node bin/explainroo.js check  videos/my-topic
node bin/explainroo.js sheet  videos/my-topic     # a picture of the whole video, to look at
node bin/explainroo.js render videos/my-topic     # writes videos/my-topic/out/video.mp4
node bin/explainroo.js verify videos/my-topic
```

Each template has a `README.md` (how to use it) and a `TEMPLATE.md` (style rules
for an AI coding agent such as Claude Code). Open the repository in Claude Code
and ask, for example: "make a 60 second history video about X with the
history-map template".

## 3. What is not in this repository

| Not stored | Why | How to get it back |
|---|---|---|
| Rendered videos (`videos/*/out/`) | large, and they can be rebuilt | `explainroo render videos/<name>` (copy any you want to keep by hand) |
| Voice and speech models | about 400 MB, downloaded from Hugging Face | `setup.sh`, or `explainroo doctor --fetch` |
| Hindi and other-language speech model | about 250 MB, fetched on first use | automatic on the first `voice` run |
| `node_modules` | installed by npm | `sh setup.sh` |
| API keys | secrets must never be committed | put `OPENROUTER_API_KEY=...` or `ELEVENLABS_API_KEY=...` in a `.env` file in `explainroo/` (it is git-ignored). Only needed for paid AI pictures or ElevenLabs voices. |
| Reference videos and frames | taken from other people's videos | not needed to make videos |

Apple Silicon and Intel Macs both work: `env.sh` picks the right ffprobe.

## 4. Things learned the hard way

- **Hindi** (and Spanish, French, Italian, Portuguese) needs `brew install espeak-ng`.
  With the Kokoro voice, write years as digits, avoid ending a phrase on
  "हुआ" (use "हो गया"), and spell "एकादशी" for the voice as `{एकादशी|एका दशी}`.
  The speech check is weak in Hindi; 60 to 80 percent confirmed words is normal, but
  listen to the result.
- **Names the voice mispronounces**: respell them in the script, for example
  `{Waldseemüller|Vahlt zay mooler}` shows one spelling and says the other.
- **High quality master**: `EXPLAINROO_QUALITY=high node bin/explainroo.js render videos/<name>` renders with
  near-lossless frames and a slow, low-compression encode. About 4 times the file size (a 50 second 1080x1920 video is
  about 220 MB) and about 4 times the render time. Use it for an archive or an upload that will be re-encoded by the
  platform; keep the normal render for quick shares. Film grain and fine paint texture are what make files big.
- **Real video clips for a few shots, free**: `explainroo/colab/` has a Colab notebook that turns chosen pictures into
  short clips (LTX-Video on a free GPU), and `scripts/colab-clips.mjs pack|unpack` moves pictures and clips to and from
  it. See `explainroo/colab/README.md`. Not yet run on a real Colab GPU.
- **Voices**: `explainroo voices` lists Kokoro's 54 voices; set one in `video.json`.
- **Paid extras** (never run without checking the cost): `explainroo image` and
  `templates/story-shots/scripts/shot-images.mjs` make AI pictures through OpenRouter.
- **Pictures for the story-shots template** must be supplied; until then each shot
  shows a placeholder.
- **Subtitles low on the frame**: the history-map and story-shots templates draw
  their own captions; the built-in ones (`"captions": true`) sit lower on tall frames.
- **Watermark**: `"watermark": false` in `video.json` turns off explainroo's small
  corner text. Keeping it helps more people find the free project; it is your choice.
- The map base picture and country shapes are public domain (NASA, Natural Earth);
  credits are in `explainroo/templates/history-map/assets/ATTRIBUTION.md`.

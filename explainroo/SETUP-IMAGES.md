# Image generation setup (explainroo)

This sets up the AI pictures used for stickers and illustrations, for example the
`youtube-random-facts` and `sticker-pop` templates. It takes about 5 minutes, plus a
one-time model download if you pick the free local option.

Run every command from the `explainroo/` folder.

## How it works

```
shots.js                 list of pictures (file name + prompt) + one shared STYLE
   |
scripts/shot-images.mjs  skips pictures that already exist, then for each missing one runs:
   |
explainroo image ...     src/images.js sends the prompt to the chosen model
   |
assets/<file>.png        the finished picture, used by scenes.js
```

Use `--dry-run` first to see the list of pictures that would be made.

## 1. Basics (once)

```bash
npm install
node bin/explainroo.js doctor --fetch
```

`doctor` checks Node, ffmpeg and Chrome and downloads the English speech models (about 400 MB).
For Hindi videos also run `brew install espeak-ng`.

## 2. Pick ONE image backend (or set up several)

| Backend | Flag | Cost | Speed | Needs |
|---|---|---|---|---|
| Local (Z-Image-Turbo on your Mac) | `--local` | free | about 2 min per picture | `mflux` (step 2A) |
| Pollinations (hosted FLUX) | `--pollinations` | per your plan | about 10 s | `POLLINATIONS_API_KEY` |
| Cloudflare Workers AI (FLUX schnell) | `--model cloudflare` | free daily allowance | fast | token + account id |

Local is the only one that sends nothing off your computer. The others send each prompt to that service.

### 2A. Local (free, no key)

```bash
uv tool install --python 3.13 mflux
uv pip install --python ~/.local/share/uv/tools/mflux/bin/python "pillow<13"
```

Needs [uv](https://docs.astral.sh/uv/) (`brew install uv`). The first picture downloads the model
(about 6 GB, 4-bit, fits a 16 GB Mac), so it is slower than later ones.
If `mflux-generate-z-image-turbo` lives somewhere else, set `EXPLAINROO_MFLUX` to its path.

### 2B. Hosted backends (keys)

Put the keys in a `.env` file in the `explainroo/` folder. Git ignores it. Never put a key in a
script, a commit or a chat message.

```bash
cat >> .env <<'EOF'
POLLINATIONS_API_KEY=...            # pollinations.ai
CLOUDFLARE_API_TOKEN=...            # Workers AI token
CLOUDFLARE_ACCOUNT_ID=...
EOF
```

Keep only the lines for the backends you use. Do not add a line twice.

### 2C. Perchance (free, semi-automatic)

No API and no key. explainroo drives the free generator at perchance.org in a real Chrome window.

```bash
npm install                      # installs playwright-core, which drives Chrome
node bin/explainroo.js doctor    # confirms Chrome is found (or set EXPLAINROO_CHROME)
node bin/explainroo.js image videos/<name> chip "A single computer chip, flat vector sticker, plain pure white background, no text" --aspect 1:1 --model perchance --no-style
```

- A separate Chrome window opens with its own profile (`~/.cache/explainroo/chrome-perchance`). Your normal Chrome tabs and logins are not touched.
- If Perchance shows its Cloudflare "verify you are human" box, tick it in that window. The run waits up to 5 minutes. explainroo does not bypass the check.
- It makes 2 candidates per picture. The first is saved as `assets/<name>.jpg`, the others in `build/images/alternatives/<name>-2.jpg` and so on. To use another one, copy it over `assets/<name>.jpg`.
- Use it for a few pictures at a time. The page shows ads and there is a 4 second pause between pictures.
- Optional settings: `EXPLAINROO_PERCHANCE_COUNT` (2, 4, 6 or 8 candidates), `EXPLAINROO_PERCHANCE_PORT` (default 9333), `EXPLAINROO_PERCHANCE_PROFILE`.
- **Parallel tabs.** Each picture opens its own tab in that one Chrome window, and several tabs can work at once. `node scripts/shot-images.mjs videos/<name> --perchance` (and `scripts/series.mjs ... images`) runs 3 tabs at a time, each taking the next missing picture; change it with `--tabs N` or `EXPLAINROO_PERCHANCE_TABS` (1 to 6; `--tabs 1` is one at a time). If the human check shows in several tabs, tick it in each one. Please keep the number modest: the site pays for itself with ads.

## 3. One-go script

Copy this block into a terminal. It does steps 1 and 2A, then makes the pictures for a new project.
Change `NAME` and `BACKEND` first.

```bash
set -e
cd /Users/yogeshdev/Documents/explainer-video-generation/explainroo

NAME=my-first-fact          # project folder name
TEMPLATE=youtube-random-facts
BACKEND=--local             # --local | --perchance | --pollinations | --cloudflare

npm install
node bin/explainroo.js doctor --fetch

# Local backend only (skip if you use a hosted one)
if [ "$BACKEND" = "--local" ] && ! command -v mflux-generate-z-image-turbo >/dev/null 2>&1 \
   && [ ! -x "$HOME/.local/bin/mflux-generate-z-image-turbo" ]; then
  uv tool install --python 3.13 mflux
  uv pip install --python ~/.local/share/uv/tools/mflux/bin/python "pillow<13"
fi

scripts/new-video.sh "$TEMPLATE" "$NAME"
node videos/$NAME/scripts/shot-images.mjs videos/$NAME --dry-run     # shows the list and the cost
node videos/$NAME/scripts/shot-images.mjs videos/$NAME $BACKEND       # makes the pictures
```

Then open every file in `videos/$NAME/assets/` and look at it. Image models get details wrong.
Remake one with `--only 3,5` (the numbers are the `n` values in `shots.js`).
Delete the bad file first, because existing files are skipped.

## 4. Use it on a new fact

1. Edit `videos/<name>/script.md` (hook first, then one fact).
2. Edit `videos/<name>/shots.js`: one line per object the voice names. Keep `STYLE` as it is and
   describe ONE object per prompt, on a plain white background, with no text or logos.
3. Run the shot script again (step 3). Only missing pictures are made.
4. Edit `scenes.js` to show them with `k.sticker('<file>', ...)`.
5. Build the video:

```bash
node bin/explainroo.js voice  videos/<name>
node bin/explainroo.js check  videos/<name>
node bin/explainroo.js sheet  videos/<name>
node bin/explainroo.js render videos/<name> --draft
node bin/explainroo.js render videos/<name>
node bin/explainroo.js verify videos/<name>
```

## 5. Make one picture by hand

```bash
node bin/explainroo.js image videos/<name> chip "A single computer chip, flat vector sticker, plain pure white background, no text" --aspect 1:1 --model local --no-style
node bin/explainroo.js images videos/<name>     # lists what was made
```

`--model` takes `local`, `pollinations`, `cloudflare` or `perchance`.

## Troubleshooting

| Problem | Fix |
|---|---|
| `the local image model is not installed` | Run step 2A, or set `EXPLAINROO_MFLUX` |
| `no shots.js` or `cannot find explainroo` | Run the script on a project inside `explainroo/videos/` |
| Missing key error | Check the key name in `.env` (step 2B) and that you run from `explainroo/` |
| Picture has a grey or coloured background | Make sure the prompt/STYLE says "plain pure white background", then remake it |
| Text or letters in a picture | Remove them from the prompt. Draw words in `scenes.js` instead |
| Run stopped halfway | Run the same command again. Finished pictures are kept |
| Out of memory with `--local` | Close other apps, or use a hosted backend |

#!/bin/sh
# Optional: a free image model that runs on this Mac (Apple Silicon, 16 GB or more).
# Installs mflux (FLUX/Z-Image on Apple's MLX) and downloads Z-Image-Turbo, 4-bit (about 6 GB).
# Run from the repository root:  sh setup-local-images.sh      (re-run it if a download stops)
set -e
export PATH="/opt/homebrew/bin:$HOME/.local/bin:$PATH"
command -v uv >/dev/null 2>&1 || { command -v brew >/dev/null 2>&1 || { echo "Install Homebrew (https://brew.sh) first."; exit 1; }; brew install uv; }
echo "1/3  mflux"
uv tool install --force --python 3.13 mflux
# Pillow 13 does not start on the newest Python releases yet; 12.x does.
uv pip install --python "$HOME/.local/share/uv/tools/mflux/bin/python" "pillow<13"
echo "2/3  model (about 6 GB, resumes if it stops; Xet is turned off because it stalled on slow links)"
HF_HUB_DISABLE_XET=1 uvx --from huggingface_hub hf download filipstrand/Z-Image-Turbo-mflux-4bit
echo "3/3  done. Make a picture with:  node explainroo/bin/explainroo.js image <project> <name> \"<what to draw>\" --model local"
echo "Expect about 2 minutes a picture at 576x1024 on an M2 with 16 GB."

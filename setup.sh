#!/bin/sh
# One-time setup on a new Mac. Run from the repository root:  sh setup.sh
set -e
cd "$(dirname "$0")"
command -v node >/dev/null 2>&1 || { echo "Install Node.js 20 or newer first (https://nodejs.org), then run this again."; exit 1; }
[ -d "/Applications/Google Chrome.app" ] || echo "Note: explainroo draws frames with Google Chrome; install it from https://www.google.com/chrome/"
echo "1/3  explainroo dependencies"
(cd explainroo && npm install)
echo "2/3  ffmpeg, ffprobe and map-data tools"
(cd tools && npm install)
echo "3/3  voice and speech-check models (about 400 MB, first time only; slow connections can reset, just run again)"
. ./env.sh
(cd explainroo && node bin/explainroo.js doctor --fetch) || true
echo
echo "Done. In each new terminal run:   . ./env.sh"
echo "Hindi, Spanish, French, Italian or Portuguese videos also need:   brew install espeak-ng"
echo "See SETUP.md for how to make a video."

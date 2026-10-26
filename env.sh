# Source this from the repository root:   . ./env.sh
# It points explainroo at the ffmpeg and ffprobe installed by tools/ and adds an `explainroo` alias.
ROOT="$PWD"
if [ ! -f "$ROOT/explainroo/bin/explainroo.js" ]; then echo "run this from the repository root (the folder with env.sh)"; return 1 2>/dev/null || exit 1; fi
case "$(uname -m)" in arm64) ARCH=arm64 ;; *) ARCH=x64 ;; esac
export EXPLAINROO_FFMPEG="$ROOT/tools/node_modules/ffmpeg-static/ffmpeg"
export EXPLAINROO_FFPROBE="$ROOT/tools/node_modules/ffprobe-static/bin/darwin/$ARCH/ffprobe"
# ffprobe-static's arm64 folder holds an Intel binary (needs Rosetta); use a native arm64 one when it is installed.
[ "$ARCH" = arm64 ] && [ -x "$ROOT/tools/node_modules/@ffprobe-installer/darwin-arm64/ffprobe" ] && export EXPLAINROO_FFPROBE="$ROOT/tools/node_modules/@ffprobe-installer/darwin-arm64/ffprobe"
alias explainroo="node $ROOT/explainroo/bin/explainroo.js"
echo "explainroo ready (ffmpeg: $EXPLAINROO_FFMPEG)"

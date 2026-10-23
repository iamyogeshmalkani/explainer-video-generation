#!/bin/sh
# usage: scripts/new-video.sh <template> <project-name>
# Copies templates/<template> to videos/<project-name> and clears build output.
set -e
cd "$(dirname "$0")/.."
tpl="$1"; name="$2"
if [ -z "$tpl" ] || [ -z "$name" ]; then
  echo "usage: scripts/new-video.sh <template> <project-name>"
  echo "templates: $(ls templates | tr '\n' ' ')"
  exit 1
fi
[ -d "templates/$tpl" ] || { echo "no template called $tpl (have: $(ls templates | tr '\n' ' '))"; exit 1; }
[ -e "videos/$name" ] && { echo "videos/$name already exists"; exit 1; }
mkdir -p videos
cp -R "templates/$tpl" "videos/$name"
rm -rf "videos/$name/build" "videos/$name/out"
echo "created videos/$name from the $tpl template."
echo "next: edit videos/$name/script.md and scenes.js (see templates/$tpl/README.md), then:"
echo "  node bin/explainroo.js voice videos/$name && node bin/explainroo.js check videos/$name"

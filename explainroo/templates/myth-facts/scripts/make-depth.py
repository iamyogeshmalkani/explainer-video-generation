# /// script
# requires-python = ">=3.10"
# dependencies = ["torch", "transformers", "pillow", "numpy"]
# ///
"""Makes a depth map for every picture in a project, for the template's 2.5D parallax.

  uv run scripts/make-depth.py <project-folder> [--only shot01,shot04]

For each assets/<name>.png|jpg|webp it writes assets/<name>.depth.png: a grey picture where WHITE is near the
camera and BLACK is far. The kit (lib/epic.js) finds it by name and shifts near parts more than far parts when
the camera moves, so a painting seems to have depth. Without the depth maps the kit still works (it falls back
to a flat perspective push).

Runs on this computer with Depth Anything V2 Small (about 100 MB, downloaded once from Hugging Face, no key).
Nothing is sent anywhere after that download.
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image
from transformers import pipeline

args = sys.argv[1:]
if not args or args[0].startswith("--"):
    sys.exit("usage: uv run scripts/make-depth.py <project-folder> [--only name1,name2]")
project = Path(args[0])
only = set(args[args.index("--only") + 1].split(",")) if "--only" in args else None
assets = project / "assets"
if not assets.is_dir():
    sys.exit(f"no assets folder in {project}")

pics = [p for p in sorted(assets.iterdir())
        if p.suffix.lower() in {".png", ".jpg", ".jpeg", ".webp"} and ".depth" not in p.name
        and (not only or p.stem in only)]
todo = [p for p in pics if not (assets / f"{p.stem}.depth.png").exists()]
print(f"{len(todo)} depth map(s) to make ({len(pics) - len(todo)} already there)")
if not todo:
    sys.exit(0)

depth = pipeline("depth-estimation", model="depth-anything/Depth-Anything-V2-Small-hf")
for p in todo:
    img = Image.open(p).convert("RGB")
    d = np.array(depth(img)["depth"], dtype=np.float32)  # bigger = nearer
    lo, hi = np.percentile(d, 1), np.percentile(d, 99)
    d = np.clip((d - lo) / max(hi - lo, 1e-6), 0, 1)
    out = Image.fromarray((d * 255).astype(np.uint8)).resize(img.size, Image.BILINEAR)
    out.save(assets / f"{p.stem}.depth.png")
    print("made", p.name)

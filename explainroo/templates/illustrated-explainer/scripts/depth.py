# Makes a depth map for each picture: assets/shot01.png -> assets/shot01.depth.png
# (white = near, black = far). Run through depth.mjs, which finds this Python.
import argparse, os, sys, warnings
warnings.filterwarnings("ignore")
ap = argparse.ArgumentParser()
ap.add_argument("assets")
ap.add_argument("--only", default="")      # shot file names, e.g. shot01,shot05
ap.add_argument("--redo", action="store_true")
ap.add_argument("--model", default="depth-anything/Depth-Anything-V2-Small-hf")
a = ap.parse_args()

import numpy as np
from PIL import Image, ImageFilter
from transformers import pipeline
import torch

todo = []
only = [x for x in a.only.split(",") if x]
for f in sorted(os.listdir(a.assets)):
    base, ext = os.path.splitext(f)
    if ext.lower() not in (".png", ".jpg", ".jpeg", ".webp") or base.endswith(".depth"):
        continue
    if only and base not in only:
        continue
    out = os.path.join(a.assets, base + ".depth.png")
    if os.path.exists(out) and not a.redo:
        continue
    todo.append((os.path.join(a.assets, f), out, base))
if not todo:
    print("nothing to do: every picture already has a depth map")
    sys.exit(0)

device = "mps" if torch.backends.mps.is_available() else "cpu"
pipe = pipeline("depth-estimation", model=a.model, device=device)
for src, out, base in todo:
    img = Image.open(src).convert("RGB")
    d = np.array(pipe(img)["depth"], dtype=np.float32)
    lo, hi = np.percentile(d, 1), np.percentile(d, 99)   # ignore a few extreme pixels
    d = np.clip((d - lo) / max(hi - lo, 1e-6), 0, 1)
    m = Image.fromarray((d * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(2))  # soft edges: less tearing
    m.thumbnail((768, 768))
    m.save(out)
    print(f"depth {base}: {m.size[0]}x{m.size[1]} on {device}")

# Free video clips from pictures (Colab + LTX-Video)

`pictures-to-video-ltx.ipynb` turns still pictures into 2 to 6 second clips on a free Google Colab GPU, using
[LTX-Video 0.9.5](https://huggingface.co/Lightricks/LTX-Video-0.9.5) (2 billion parameters, open weights, the
picture is the first frame). The clips drop into any template that accepts `assets/shotNN.mp4` (clay-stopmotion,
dark-history, story-shots, ...), replacing that shot's picture.

**Status: run once on a real free Colab T4** (Tesla T4, 15 GB GPU memory, 12.67 GB system RAM, 112 GB disk). What happened:

| Step | Result |
|---|---|
| Install, GPU check, settings | fine; the T4 has no native bfloat16 (emulated), which still works |
| Text encoder (10 GB download, then encode the prompts and discard it) | about 12 minutes the first time; system RAM peaked at 7.5 of 12.7 GB, then fell back to 3.3 GB. The "encode first, then free it" step is what makes this fit |
| Video model download and load | about 5 more minutes; GPU memory idle 0.0 GB (the offloading keeps it on the CPU side) |
| First clip, 4 seconds at 480 x 864 (97 frames) | **ran out of GPU memory** |
| Retry, 2 seconds at 480 x 864 (49 frames), 30 steps | worked: 7.6 minutes (the failed 4 second attempt added little). A smooth camera push through the clay street, about 310 KB |
| A second picture (burning street), 2 seconds, same settings | worked, **7.6 minutes again** with no failed attempt, once the session was restarted and the models were already on disk. Flames flicker, smoke rises, the camera pushes down the street (about 200 KB) |

So: **use 2 second clips** (`SECONDS` = 2, the default now). Later sessions skip the downloads only if the session is kept; a fresh session downloads them again.

## Steps

```bash
# 1. on this computer: pick the shots that should move (3 or 4 per video is plenty)
node scripts/colab-clips.mjs pack videos/<project> --shots 3,7,12
#    -> videos/<project>/out/colab-pack/ with the pictures and a prompts.json (edit it: say what should MOVE)

# 2. put that folder in Google Drive as  My Drive/clay-clips
# 3. open colab/pictures-to-video-ltx.ipynb in Colab (upload it, or File > Open notebook > Upload)
#    Runtime > Change runtime type > T4 GPU, then Runtime > Run all.  The first run makes one test clip.
# 4. happy with the test? set FIRST_N to 0 and run cells 3, 4, 5, 7 again. Clips land in clay-clips/clips/

# 5. back on this computer: copy the clips into the project
node scripts/colab-clips.mjs unpack videos/<project> ~/Downloads/clips
node bin/explainroo.js render videos/<project>
```

A clip stops on its last frame. For a shot longer than the clip, add `speed: 0.6` to its line in `shots.js` (0.25 to 4).

## What to expect

- Free Colab: one T4 GPU (about 15 GB), about 12 GB of system RAM, no guarantee a GPU is free, sessions end after
  a few hours or when idle. Run all again and pictures that already have a clip are skipped.
- Clips: about 480 x 864 (portrait), 2 seconds, gentle motion. Smoke, fire, drifting light, a slow push or a small
  movement work. A cavalry charge or a face turning does not.
- Time per 2 second clip on a T4: **7.6 minutes**, measured twice. For 4 hero shots plan about half an hour plus the one-time
  setup (about 15 minutes of downloads in a fresh session). Lower `STEPS` to 20 to go faster at some loss of quality.

## If something fails

| What you see | Try |
|---|---|
| "No GPU" | Runtime > Change runtime type > T4 GPU. If none is free, try later |
| Session crashes with a RAM message at cell 5 or 6 | Runtime > Restart session, then Run all. If it repeats, the free tier is too small for this model; tell Claude |
| "out of GPU memory" in cell 7 | The notebook already retries shorter and smaller. Set `SIZE` = draft and `SECONDS` = 2 |
| Motion is wrong or too small | Edit that picture's line in `prompts.json`, delete its clip from `clips/`, run cell 7 again |
| Any other error | Copy the red error text to Claude |

## Other models

LTX is the lightest of the open models that take a picture as the first frame. MiniMax-H3 (33 billion parameters) does
not fit a free GPU. Hosted models (Veo, Kling, Runway, MiniMax) are better and cost about $0.05 to $0.40 per second.

## Getting the clip off Colab when downloads are blocked

`files.download` (cell 8) works in a normal browser. In an embedded or automated browser it can be blocked; then print the
clip as text and copy that, or send it to a local receiver. Clips are small (about 300 KB for 2 seconds), so this is cheap.

## Using the clips

A clip is 2 seconds, so play it slower to fill a longer shot: in `shots.js` give the shot `speed: 0.45` for a 4 to 5 second
shot, `speed: 0.6` for about 3.5 seconds (allowed range 0.25 to 4). At half speed the 24 fps clip steps at about 12 fps,
which suits the clay stop-motion look. Used in the Great Fire of London sample for shots 1 and 6.

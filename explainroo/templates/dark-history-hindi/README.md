# dark-history-hindi

The **dark-history** look (full-frame dark oil paintings, a slow push, a thud and a small punch at every cut, drifting
embers, a hook line at the top, word-lit captions, a war-score `epic` music bed) with **Hindi narration**, and a
**batch runner** that makes many videos from one script file.

- Narration: Kokoro Hindi voice (`hm_omega`, male; `hm_psi`, `hf_alpha`, `hf_beta` also work), `language: "hi"`.
- Captions: Devanagari, upright, 2 to 3 words at a time, the spoken word lit yellow, `।` ends a caption.
- Hook: the video's title in Devanagari near the top for the first 3 seconds.
- Music: `epic` (low strings, ostinato and taiko), `duck` -4 dB under the voice. Use `cinematic` for a calmer, darker drone.

## Make many videos at once: the series file

Write one markdown file (see `series/india-china-1962.md` for a full example, and `series.example.md` here):

```markdown
---
name: my-series                 # videos are made in videos/my-series-01, -02, ...
template: dark-history-hindi
voice: hm_omega                 # optional
style: dark dramatic oil painting, ... no text, no flags    # optional: the look of every painting
characters:                     # optional: people described the same way every time
  nehru: an elderly Indian statesman with a white Gandhi cap ...
---

## Short 1: any label
title: The hook line shown on screen (Hindi)
facts: optional note for yourself (not spoken)

> English painting prompt for beat 1, can use {nehru} | motion=push embers=0.6 hit=1.2
The Hindi narration spoken while painting 1 is on screen.
> English painting prompt for beat 2
Next sentence or half sentence.

## Short 2: ...
```

Rules:

- **One beat = one painting** (about 2 to 4 seconds, 5 to 12 Hindi words). A `>` line starts a beat; the lines under
  it are what the narrator says. Split long sentences at a comma so the picture changes often.
- **Pronunciation in Hindi script:** `{1962|उन्नीस सौ बासठ}` shows `1962` on screen and says the Hindi words. Use it for
  years, dates, numbers and names the voice gets wrong, always spelling the spoken part in Devanagari.
  Avoid ending a phrase on "हुआ": write `{हुआ|हो गया}`.
- `[loud]...[/loud]` says those words louder (the hook, key names, the closing line). Keep it inside one beat.
- **Prompts are English** (the picture models understand it best). Say what is in the picture, the light and the framing.
  Keep text, signs, flags and logos out. `{name}` is replaced by the character description.
- Optional end of a prompt line: `| motion=push|pull|panLeft|panRight|rise|still embers=0..1 hit=0..2`.
- Never invent numbers or quotes; mark estimates; keep violence implied (aftermath, silhouettes, smoke).

Run it from the explainroo folder:

```sh
node scripts/series.mjs series/my-series.md plan             # list every video and its beats, writes nothing
node scripts/series.mjs series/my-series.md build            # create videos/my-series-NN (keeps pictures already made)
node scripts/series.mjs series/my-series.md images           # paintings for ALL videos: local + Perchance + Cloudflare share one queue
node scripts/series.mjs series/my-series.md voice            # narration + speech check for every video
node scripts/series.mjs series/my-series.md render           # render and verify every video
node scripts/series.mjs series/my-series.md make             # everything above, in order
# add --only 2,5 to work on some videos only, --lanes pollinations (or local, perchance, cloudflare) to pick the picture makers,
# --draft for a quick half-size render
```

Edit the series file and run `build` again: `script.md`, `shots.js` and `video.json` are regenerated, pictures and the
voice cache are kept (the voice is remade only for scenes whose text changed). To redo one picture, delete
`videos/<name>-NN/assets/shotNN.*` and run `images`.

## One video by hand

`scripts/new-video.sh dark-history-hindi my-story`, then edit `script.md` (one scene `story`, a `[#s1]` marker per
painting) and `shots.js` like `templates/dark-history`.

## Checking a Hindi video

`voice` prints how many words the speech check confirmed. For Hindi, 60 to 80 percent is normal; Whisper knows Hindi
less well. Listen to the result. If a word is mispronounced, respell it in Devanagari with `{shown|spoken}`.

# myth-facts

Short **Indian mythology facts and stories** told by a **deep male voice** over a slow cinematic bed. Built on the
`dark-history` / `horror-story` engine: full-frame **temple-mural style paintings** with a slow push, a **deep thud at every
cut**, drifting incense smoke, golden dust, diya sparks and a flickering lamp glow, a hook line at the top for the first two
seconds, and **two or three word captions in bold italics with the spoken word lit gold**.

| Part | Setting |
|---|---|
| Pictures | Indian temple mural / classical oil painting: saffron, crimson and gold on near-black, lamp light, incense smoke |
| Voice | `am_onyx` (the deepest Kokoro voice), `speed` 0.8. Try `bm_george` for a deep British voice |
| Music | `cinematic` (dark drums and drone), `volume` 0.7, dips 6 dB under the voice |
| Lit caption word | gold (`LIT` in `lib/epic.js`) |
| Size | 9:16 for Shorts, Reels and TikTok, about 40 to 55 seconds |

The sample is *How Hanuman got his name* (about 45 seconds), the Valmiki Ramayana, checked claim by claim in `facts.md`.

## Make a video

```sh
scripts/new-video.sh myth-facts hanuman-jaw
# 0. research the fact in a primary text and fill videos/hanuman-jaw/facts.md (every claim, with its source)
# 1. edit videos/hanuman-jaw/script.md   (the narration, one [#s1], [#s2] ... marker per picture)
# 2. edit videos/hanuman-jaw/shots.js    (HOOK and one SHOTS line per marker)
node videos/hanuman-jaw/scripts/check-facts.mjs videos/hanuman-jaw    # fails until every claim is verified
node bin/explainroo.js voice videos/hanuman-jaw
node videos/hanuman-jaw/scripts/shot-images.mjs videos/hanuman-jaw --pollinations    # or --local, --perchance
node bin/explainroo.js check videos/hanuman-jaw
node bin/explainroo.js sheet videos/hanuman-jaw --every 1.5
node bin/explainroo.js render videos/hanuman-jaw && node bin/explainroo.js verify videos/hanuman-jaw
```

## Other voices and languages

- Deeper or different English voice: set `"voice"` in `video.json` (`am_onyx`, `am_fenrir`, `bm_george`, `bm_lewis`). Lower `speed` (0.75 to 0.85) for more weight.
- Hindi: set `"language": "hi"`, `"voice": "hm_omega"` (or `hm_psi`) and write the narration in simple everyday Hindi. See `horror-story-hindi` for the Devanagari caption setup.
- Music: `cinematic` is the default. Use `epic` for war stories (Mahabharata, Ramayana battles) or `inspiring` for devotion and wisdom tales.

## Tuning

- **Scale is the feeling.** Use `rise` and `push` on gods and mountains, `pull` to reveal something huge.
- **Save the big hits.** Give 2 or 3 shots `hit: 1.4` or more (the thunderbolt, the turn); leave the rest at 0.8 to 1.2.
- **Calm shots:** `still` with `shake: 0` before the key moment.
- Real depth: `uv run scripts/make-depth.py videos/<name>`.

## Fact checking

Mythology is sensitive, so each video needs a `facts.md`: one row per claim, with the primary text it was checked in. `scripts/check-facts.mjs` fails until every row is `verified` and has a source. The sample's `facts.md` shows the format. Checking uses web sources and a named translation; a person from the tradition should still watch the video before it is posted.

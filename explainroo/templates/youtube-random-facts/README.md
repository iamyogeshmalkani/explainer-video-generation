# youtube-random-facts: a "Did you know?" tech fact in 30 seconds

Short vertical videos that open with a hook ("Did you know...?") and then tell one surprising fact.
It is the **sticker-pop** template with the same kit, looks and sounds (flat colored scenes where
stickers, paper notes, number chips and bold words pop in one after another, each scene pushing the
last one away). Only the script and the scene recipe change: every video goes hook, fact, details,
"Now you know!".

The sample in this folder is *Pixar almost deleted Toy Story 2* (about 30 seconds).
`FACTS.md` has 20 researched tech facts, each with a hook line, a short script and sticker ideas.

## Make a video

```sh
scripts/new-video.sh youtube-random-facts my-fact     # copies this template to videos/my-fact
# 1. pick a fact from FACTS.md and write videos/my-fact/script.md (hook first, a [#marker] for each pop)
# 2. edit videos/my-fact/shots.js    (one line per sticker picture)
# 3. edit videos/my-fact/scenes.js   (what pops on each marker)
node bin/explainroo.js voice videos/my-fact
node videos/my-fact/scripts/shot-images.mjs videos/my-fact --pollinations   # the sticker pictures (or --local)
node bin/explainroo.js check videos/my-fact
node bin/explainroo.js sheet videos/my-fact --every 1.5
node bin/explainroo.js render videos/my-fact && node bin/explainroo.js verify videos/my-fact
```

## The shape of the script

1. **Hook (first 2 seconds):** a short opener that starts with "Did you know" (or "Ever wondered",
   "Think you know") and goes straight into the fact as a question. The screen shows DID YOU KNOW?
   in big letters with a sticker of the thing the fact is about.
2. **The fact:** one sentence with the surprising number, name or date.
3. **2 to 4 supporting beats:** who, when, why it matters. One idea per scene.
4. **Closer:** "Now you know!" and a follow line.

## Hindi

The template ships a Hindi version of the sample in `hindi/`: `script.md` (the narration), `scenes.js` (the on-screen
words in Devanagari) and `video.json` (`"language": "hi"`, a Hindi voice, speed 1). Copy them over the English ones:

```sh
scripts/new-video.sh youtube-random-facts my-fact-hi
cp templates/youtube-random-facts/hindi/{script.md,scenes.js,video.json} videos/my-fact-hi/
node bin/explainroo.js voice videos/my-fact-hi
```

Hindi voices (set `"voice"` in `video.json`; `node bin/explainroo.js voices --language hi` lists them):

| Voice | Sounds like |
|---|---|
| `hm_omega` | Hindi, male (the sample's choice, same as the other Hindi videos here) |
| `hm_psi` | Hindi, male |
| `hf_alpha` | Hindi, female (the default when `voice` is left out) |
| `hf_beta` | Hindi, female |

Your own recording also works for Hindi (see `AGENTS.md`).

Notes for Hindi:
- Needs `espeak-ng` (`brew install espeak-ng`).
- Every `FACTS.md` entry has a Hindi hook that starts with "क्या आप जानते हैं". Write the rest of the script the way
  you would say it to a friend, not word for word from the English.
- Write numbers and years with a spoken form: `{1998|उन्नीस सौ अट्ठानवे}`. Put Latin words the voice may misread
  as `{shown|spoken}` in Devanagari.
- The speech check confirms fewer Hindi words (about 70% on the sample), so a few "unconfirmed" words are normal.
  Listen to the voice for any word that stays unconfirmed in several scenes.
- Hindi takes a bit longer to say, so scenes run about 20% longer. Titles use size 0.15 instead of 0.17.
- On-screen text is Devanagari (the Hindi font is built in): `title`, `heading`, `chip`, `note`, `banner` and `line` all work.

## The kit

Same as sticker-pop: `title`, `heading`, `line`, `sticker`, `note`, `chip`, `banner`, `arrow`, `eyes`,
`thought`, `burst`, `sparks`, `ping`. Looks: `sun`, `blueprint`, `paper`. The header of `lib/pop.js`
lists every option. Sounds are quiet by default (`pop(s, { sound })`).

## Pictures

Stickers are made on a **plain white background** and cut out when the video is drawn. Keep each
prompt to ONE object and no text. Open every picture afterwards. See sticker-pop's notes in
`TEMPLATE.md` for the mistakes to avoid.

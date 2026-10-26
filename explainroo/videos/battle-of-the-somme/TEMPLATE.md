# dark-history: rules for making a video with this template

For a coding agent (Claude Code and others) or a person. Read `AGENTS.md` in the explainroo
folder for the general rules and `README.md` here for the steps and the kit.

## The style

- **One story, told as a chain of cause and effect:** a setup, a warning that is ignored, a
  mistake, a disaster, an aftermath. The hook line says the moral ("destroyed by its own arrogance").
- **One dark oil painting per beat**, 2 to 3 seconds each, 12 to 18 paintings, 30 to 45 seconds.
  Alternate wide shots (armies, battles, landscapes) with waist-up portraits of the people named.
- **Narration:** short sentences, 7 to 14 words, plain words, about 2.5 words a second. Start with
  the year and the place. Name each person once with their role.
- **Captions** are on screen the whole time (2 to 3 words, Title Case). No other text on screen.
- **Sound:** keep the `cinematic` music; every cut has a thud. Do not add other effects.

## Steps

1. **Pick a story you can verify** and write the facts at the top of `script.md` as a note. Never
   invent numbers, quotes or causes. If chroniclers disagree, leave the number out.
2. **Copy the template**: `scripts/new-video.sh dark-history <name>`.
3. **Write `script.md`**: one scene, `story`, a `[#sN]` marker at the start of every sentence or
   half-sentence that should get its own painting.
4. **Write `shots.js`**: `HOOK` and one painting per marker. Describe each recurring person the same
   way every time (the constants at the top), name the lighting and the framing, no text anywhere.
5. **Voice and check**: `voice`, `check`. Fix mispronounced names with `{Shown|spoken}`; the voice says
   a soft g in names like Sigismund, so respell them (`{Sigismund|Sig is mund}`).
6. **Paintings**: `node scripts/shot-images.mjs <project> --pollinations` (or `--local`). Open every one:
   remake any with garbled text, wrong period costume, extra limbs or modern objects.
7. **Look**: `sheet --every 1.5`. Check the hook is readable, captions sit clear of faces, each
   painting matches the sentence, and the picture changes every 2 to 3 seconds.
8. **Render and verify**: `render`, `verify`. Report the files and say you could not hear the sound.

## Rules

- A history short is a story, not a verdict: say what the sources support. Mark estimates as such.
- Do not show real historical atrocities in graphic detail; keep violence implied (aftermath,
  silhouettes, smoke).
- Paintings are illustrations, not records. Say so if asked, and do not present them as real art.
- Music at `volume` 0.85 and `duck` -3: if `verify` narration drops under 95%, lower the volume.

## Mistakes to avoid

- A hook that makes a claim the video does not support.
- Two paintings in a row that look alike: change the framing or the character.
- A sentence with no new picture for more than 4 seconds: add a marker.
- Captions on top of a face: raise `y` in `captions(s, { y: 0.74 })` or change the shot.

# myth-facts: rules for making a video with this template

For a coding agent (Claude Code and others) or a person. Read `AGENTS.md` in the explainroo
folder for the general rules and `README.md` here for the steps and the kit.

## The style

- **One fact or one story per video**, told in 40 to 55 seconds. The hook is the surprising fact itself ("Hanuman's name
  means broken jaw."), then the story that explains it, then one plain sentence that pays off the hook.
- **One painting per beat**, 2 to 4 seconds each, 12 to 18 pictures. Alternate wide shots (mountains, palaces, battlefields)
  with close-ups (one face, one weapon, one object). Gods and heroes are shown as respectful traditional paintings.
- **Narration:** deep, slow, calm. Short sentences of 5 to 12 words, plain everyday words, about 2 words a second (the voice
  is slowed). No exclamation marks, no jokes. Wrap 3 to 5 key words (the fact, a name, the turn) in `[loud]...[/loud]`.
- **Captions** are on the whole time (2 to 3 words, the spoken word lit gold). No other text.
- **Sound:** keep the `cinematic` music; every cut has a deep thud. Do not add other effects.

## Accuracy and respect (important)

- Myths have many versions. Tell **one version you can name** (Valmiki Ramayana, Vyasa's Mahabharata, a Purana) and say
  "the story goes", "in the Ramayana" or "according to the Puranas". Never present a myth as proven history.
- **Fact-check every claim before you make the voice.** This is a sensitive topic. Write `facts.md` (one row per claim:
  every name, number, relationship, cause and quote) and mark a row `verified` only after you read it in a **named primary
  text** (Valmiki Ramayana, Vyasa's Mahabharata, a Purana, a Gita chapter) and, where you can, a second reliable source.
  Fetch the actual text, do not trust popular retelling sites, films or memory; they often add details (for example
  "pulled all the air out of the world" or "begged for peace" are not in Valmiki's Hanuman story).
- Run `node scripts/check-facts.mjs <project>`. It fails until every row is `verified` with a source. It cannot tell if a
  claim is true, so the checking is your job; the file proves it was done.
- Say only what the source says. If versions disagree, follow one and name it ("the Ramayana says", "in one version").
  Do not turn a story into a fact ("means", "proves"); do not add numbers, quotes or verse numbers you did not read.
- If you cannot verify a detail, **leave it out**, and tell the user what you dropped.
- Before posting, a person from the tradition should watch the video. Say in your report that the check used web sources
  and the translation named in `facts.md`.
- Treat gods and sacred figures with respect: no mockery, no jokes at their cost, no comparisons that insult any faith.
- Gods are never drawn as cartoons. Keep the paintings in the traditional temple-mural style.

## Steps

1. **Pick one fact.** Good ones have a clear "why": a name's origin, a boon with a twist, a number (the Mahabharata has
   about 100,000 verses), a curse and its result. Note the source.
2. **Copy the template**: `scripts/new-video.sh myth-facts <name>`. Then research the fact in a primary text and fill `facts.md`.
3. **Write `script.md`**: one scene, `story`, a `[#sN]` marker at the start of every sentence or half-sentence that gets its
   own picture. Plan 2 or 3 big beats. Fix names with `{Shown|spoken}`, for example `{Vayu|vah-yoo}`.
4. **Write `shots.js`**: `HOOK` and one picture per marker. Describe each recurring god or hero the same way every time
   (the constants at the top), name the light and the framing, no text anywhere. Set `hit` 1.4+ on the big beats.
5. **Fact gate, voice and check**: `node scripts/check-facts.mjs <project>`, then `voice`, `check`. Re-run the gate after every script edit.
6. **Pictures**: `node scripts/shot-images.mjs <project> --pollinations` (or `--local`, `--perchance`). Open every one: remake any
   with garbled text, wrong number of arms or faces, or cold blue light (the look is saffron, crimson, gold and black).
7. **Look**: `sheet --every 1.5`. The hook must be readable, captions must not cover a face, each picture must match its
   sentence, and the picture must change every 2 to 4 seconds.
8. **Render and verify**: `render`, `verify`. Report the files and say you could not hear the sound. If `verify` says less
   than 95% of the narration is understood, lower the music `volume`.

## Mistakes to avoid

- Telling a regional folk version as if it were the only one.
- Every cut at `hit: 1.8`: the thuds stop meaning anything.
- Two pictures in a row that look alike: change the framing or the subject.
- A sentence with no new picture for more than 4 seconds: add a marker.
- Captions on a face: raise `y` in `captions(s, { y: 0.74 })` or change the shot.

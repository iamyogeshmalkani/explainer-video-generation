# clay-story: a story with fixed characters, told in AI clay pictures

A vertical (9:16) **full-screen** story short. Each picture is an AI clay scene that stays on screen **2 to 3 seconds**, with a slow camera move; the
narration is captioned word by word in big capitals over the lower part of the picture. (`LAYOUT = 'letterbox'` in `shots.js` gives the layout of the
`sheikh-ajgar-clay` video instead: a square picture between black bars, a title above, phrase captions below.) It is made from
`founder-story-claymation`, with three changes:

1. **2 to 3 seconds a picture.** Shots are cut from the narration by *time*, not by markers: `scripts/plan-shots.mjs` cuts it into shots of 2.0 to
   3.0 seconds at sentence and phrase boundaries, and the kit refuses to render a picture that lasts less than 2 or more than 3 seconds.
2. **Characters stay the same.** Every recurring character is written once in `CAST` (age, **height as a number**, build, face, hair, outfit). A scene
   writes `{mira}`, and the prompt always contains the same full description, plus who is taller than whom. `check-shots.mjs` stops a scene that
   describes a person by hand ("a young boy"), which is how one character turns into another between pictures.
3. **Scenes that say what the narration says.** Every shot keeps its narration (`says`) next to what the picture shows (`action`); `check-shots.mjs`
   reports narration words the picture never mentions and writes `storyboard.md`, and `storyboard.mjs` makes a sheet of the pictures with the words under them.

Read `TEMPLATE.md` first: it has the rules for writing a scene and for keeping a character the same.

## Make a story

```sh
. ./env.sh                                              # from the repository root, once per terminal
cd explainroo
scripts/new-video.sh clay-story my-story                # copies this template to videos/my-story
# 1. script.md   the narration, one scene "## story" (about 8 to 12 words a sentence; 40 to 70 seconds)
# 2. shots.js    CAST (the characters) and SETS (the places), written once, with the numbers for the heights; LAYOUT, TITLE, CAPTIONS
node bin/explainroo.js voice videos/my-story
node videos/my-story/scripts/plan-shots.mjs videos/my-story        # cuts the narration into shots of 2 to 3 seconds (writes SHOTS in shots.js)
# 3. write every "TODO" shot in shots.js: who / shot / set / mood / action (see TEMPLATE.md), then
node videos/my-story/scripts/check-shots.mjs videos/my-story       # errors and warnings, and storyboard.md
node videos/my-story/scripts/shot-images.mjs videos/my-story --characters --perchance   # look at the cast first: assets/char-<key>.png
node videos/my-story/scripts/shot-images.mjs videos/my-story --perchance                # the pictures (12 tabs; --tabs N)
node videos/my-story/scripts/storyboard.mjs videos/my-story                             # pictures with their narration: do they match?
node videos/my-story/scripts/storyboard.mjs videos/my-story --who mira                  # one character in every picture: is she the same?
node bin/explainroo.js render videos/my-story && node bin/explainroo.js verify videos/my-story
```

If you change the voice, the speed or a sentence, run `plan-shots.mjs` again: shots whose narration did not change keep everything you wrote and
their picture; only new shots get a `TODO`. Pictures are named `shot01.png`, `shot02.png` ... by number; when the shots move, delete the pictures
of the changed shots (`storyboard.md` lists the narration of each number) and make them again with `--only`.

Perchance (free, no key) needs a visible Chrome: set `EXPLAINROO_CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"`, and
do not close that window while pictures are made. `--local`, `--cloudflare` and `--pollinations` work too. Without a maker flag
`shot-images.mjs` only writes `prompts.md`, one paste-ready prompt per picture.

## Hindi, with a cloned voice and captions in Roman letters

Set `"language": "hi"` and a voice in `video.json`, for example the F5 voice with a clone (`{ "provider": "f5", "ref": "assets/my-voice.wav", "refText": "..." }`;
see "Hindi voice with voice cloning" in `AGENTS.md`). Write the story as pairs, `Roman words || देवनागरी words`, one phrase a line, and run
`node scripts/pairs-to-script.mjs videos/my-story pairs.txt`: the captions show the Roman words and the voice says the Devanagari words. The 2 to 3
second shots work the same way. Run the pictures and the voice one after the other, not at the same time: 12 Chrome tabs and the F5 model together
slow a 16 GB Mac to a crawl.

## The kit (`lib/clay.js`)

| Call | What it draws |
|---|---|
| `shots(s, SHOTS, { frame, amount, minShot, maxShot })` | the pictures: a shot starts on its `word`, 2 to 3 seconds each (an error otherwise); `frame` clips them to a square band, `amount` makes the camera moves gentler |
| `barTitle(s, { lines, y, size, gap })` | a plain bold title in the top bar; `*starred*` words gold; an emoji may end a line |
| `captions(s, CAPTIONS)` | phrase captions, the spoken word lit gold (or `captions(s, {})`: big capitals for the full-frame layout) |
| `urlBar`, `bigWord`, `title`, `plates`, `stats`, `quotes`, `endCard`, `grade`, `grain` | from the founder template: an end call to action, hook text, plaques; not used by default |

Camera moves (`motion`): `push`, `pushHard`, `pull`, `pullHard`, `slideLeft`, `slideRight`, `rise`, `fall`, `drift`, `still`. Arrivals (`enter`): `cut`, `slide`, `zoom`, `fade`.

## Limits (read before promising anything)

- The pictures are made from text only, so one character looks **similar, not identical**, from picture to picture; the fixed descriptions, the size
  numbers and the check keep it close, but look at every picture (`storyboard.mjs --who`) and remake the ones that drift.
- The motion is a slow camera move over a still picture: characters do not walk or change their face. Put the movement into the next picture.
- Two characters in a picture work well, three can mix up, four rarely work.
- The picture model cannot draw text or numbers; show them with captions or in the narration.
- The sample story was tested with Kokoro (English) and Perchance pictures; nobody has listened to the audio.

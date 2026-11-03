# clay-story: rules for writing a story with this template

For a coding agent (Claude Code and others) or a person. `AGENTS.md` in the explainroo folder has the general rules; `README.md` here has the steps and
the commands. This file has the rules that make the pictures say what the narration says, and keep every character the same.

## 1. The narration

- One scene, `## story`. Short sentences, one idea each, 8 to 12 words; one event per sentence, in the order it happens. 40 to 70 seconds.
- A picture lasts 2 to 3 seconds, which is 5 to 8 spoken words. A sentence of 12 words becomes two pictures, so write each sentence so that its halves
  can be pictured: "Mira grabbed a candle, and ran up the hill." is two pictures (the candle, the run).
- Name every character in the narration once with the same word each time. Do not call one person "the boy", "Raj" and "the child" in turns: the
  viewer and the picture model both lose them. (This was the problem of the first video: a child, a young man and an old man were all "sheikh".)
- Show, do not tell: "she was afraid" has no picture; "her hands shook as she held the candle" has one.
- End with one plain sentence that pays off the opening.

## 2. The cast (`CAST` in shots.js)

- Write each character once, every field: `noun` (what it is, "an old grandfather"), `short` (how a later mention reads, "the grandfather"), `age`, `height`,
  `build`, `face`, `hair`, `outfit`. The more specific, the more alike the pictures come out ("round wire-rim glasses", "two black braids with red ribbons").
- **`height` is a number**, 1 for the tallest grown-up of the story, a child 0.5 to 0.6, a teenager 0.8. Every prompt with two characters says who is
  taller and by how much, so a child never grows into an adult between pictures.
- One outfit, one age per key. The same person at another age or in another outfit is another key (`mira`, `miraGrown`).
- Never describe a cast member by hand in a scene. Write `{key}`. `check-shots.mjs` reports "young", "old", "boy", "girl", "man", "woman", "child" and
  similar words in an action (add `crowd: true` to a shot for a crowd or an extra who is not in CAST).
- At most 2 characters per picture, 3 at the very most. Faces drift first in wide shots with several people: use a medium shot or a close-up for the
  important face.
- Run `shot-images.mjs --characters --perchance` first and look at `assets/char-<key>.png`. If a character is not what you meant, change the words (they
  are what every shot will use) before you make the pictures.
- Places that come back are written once in `SETS` and used by key (`set: 'cottage'`), so a room looks the same each time.

## 3. Shots of 2 to 3 seconds

`node scripts/plan-shots.mjs <project>` cuts the narration after `voice`: sentence ends first, commas next, never after "the", "of", "two" if it can be
avoided. It writes `word` (where the shot starts) and `says` (its narration). Do not edit those two by hand; change the script and run it again. If the
speech is so slow or so fast that no cut gives 2 to 3 seconds, it says so; change `speed` in video.json and run `voice` again.

## 4. Writing a shot (do this for every shot)

For each shot read its `says`, the `says` of the shot before and after, and the whole story. Then fill:

1. **`action`: what the viewer SEES if the sound is off.** Who does what to what, where. One moment, one verb, under about 40 words. Use `{keys}` for
   every character. Use the **nouns of the narration** (candle, lantern, hill): a word that is said and never shown is the commonest fault
   (`check-shots.mjs` lists such words).
2. **Show the verb at the moment it happens.** "ran up the hill" is a character mid-stride on a slope with the hill below, not the character at the top.
   "was fired" is the letter in the hand, not the office. Use the moment of the sentence that tells the most.
3. **Abstract words need a concrete picture.** lonely: one small figure in a big empty place; fear: wide eyes, hands raised, a long shadow; time passing:
   the same place at another light (morning, dusk, night); a plan: a character pointing at a thing; success: a raised arm, a crowd, light.
4. **Time and weather are in `set` and `mood`**: "night", "storm", "golden evening", with the same `set` key as the other shots of that place.
5. **Continuity between neighbours.** A lantern that was blown out in shot 7 is dark in shot 8. A character who left the room is not in it. Keep a prop in
   the same hand. Keep the camera side: a character who walks right in one shot walks right in the next.
6. **`who`**: exactly the characters in the picture, each as `{key}` in the action. A reaction shot (a face looking at something) is a good picture for a
   sentence that has no action of its own.
7. **`shot` size**: close-up for a feeling or a decision, medium shot for people talking or doing, wide shot for a place or a distance, top-down view for a
   map-like layout, low angle for pride or fear. Do not use the same size four times in a row.
8. **`motion`**: `push` for attention and tension, `pull` for a reveal, `slideLeft`/`slideRight` for a walk or time passing, `rise` for hope,
   `fall` for loss, `drift` for quiet. Do not repeat one move three times in a row. `focus` on the face for pushes and pulls of a character.
9. No text, numbers or logos in a picture (the model cannot draw them); say them in the narration.

After writing: `node scripts/check-shots.mjs <project>` (fix every error and read every warning), then read `storyboard.md` top to bottom as a viewer:
narration, then picture. Does each picture say what its words say?

## 5. The pictures and the check by eye

- Make the cast first, then the shots (`--perchance`, 12 tabs). Pictures that fail are retried by running the command again.
- `node scripts/storyboard.mjs <project>` shows every picture with its narration. `--who mira` shows only the pictures with her: the face, the height and the clothes
  must be the same. Remake a picture that drifts: delete `assets/shotNN.*`, run `shot-images.mjs --perchance --only NN`. If one character keeps drifting, make her
  description more specific, or use a closer shot.
- Look at each picture for extra fingers, two heads, text-like marks, a flat cartoon look instead of clay.

## 6. The sound and the look

- Voice: Kokoro (`af_heart`, `am_michael` ...) or, for Hindi, F5 with a cloned voice (README). Music `warm` at 0.3 under the story, or `false`.
- `LAYOUT = 'full'` (the default: a full-screen portrait picture and big captions) or `'letterbox'` (a square picture between black bars, a title, phrase
  captions). Change only that line: the picture shape (`ASPECT`) and the clay words (`STYLE_TAIL`) follow it. Pictures made for one layout do not fit the other.
  In a full-screen portrait picture keep the faces in the upper two thirds: the captions cover the lower third.
- Keep `STYLE_HEAD`, `STYLE_TAIL` and `NEGATIVE` as they are for all the pictures of one video; they are what makes it clay.
- The pictures are AI clay caricatures. Do not describe a real person by name; describe them by clothes and hair.

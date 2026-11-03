// clay-story: the shot list of a story told in AI clay pictures. This file holds
//   1. the STYLE (every picture shares one clay look),
//   2. the CAST: every recurring character, written ONCE, with a fixed age, height, build, face, hair and outfit,
//   3. the SETS: every recurring place, written once,
//   4. the SHOTS: one picture each, 2 to 3 seconds long, planned from the narration by scripts/plan-shots.mjs,
//   5. promptFor(): builds the picture prompt from the pieces above.
//
// WHY THE CHARACTERS STAY THE SAME. A picture model has no memory, so the look is held by words, and the words are never
// retyped: in a shot you write {mira} in the action and promptFor() writes "the girl" there and adds the SAME full description
// of her in a "Characters:" part of every prompt she is in. The height of each character is a
// number, so promptFor() also adds who is taller than whom in every picture that has two or more characters. Never describe
// a cast member by hand in a scene ("a young boy", "an old sheikh"): check-shots.mjs reports it. Another age or outfit of the
// same person is another key (mira, miraGrown).
//
// WHAT A SHOT SAYS (every field is needed; scripts/check-shots.mjs reports what is missing):
//   n       the number (shot-images.mjs --only 3,5)
//   word    the index of the first narration word of the shot (0 = the first word). Written by plan-shots.mjs.
//   says    the narration words of this shot, copied by plan-shots.mjs. The picture must SHOW what these words say.
//   who     keys of CAST that are in the picture (at most 2 or 3). Every one of them must appear as {key} in `action`.
//   shot    the shot size: 'wide shot' | 'medium shot' | 'close-up' | 'top-down view' | 'low angle shot' ...
//   action  what the viewer SEES: who does what, to what, where, with {keys} for characters and sets. One moment, one verb.
//   set     where it happens: a key of SETS, or a few words. Keep the same key for the same place.
//   mood    one or two words for the feeling ('worried', 'warm and calm').
//   motion  how the camera moves: push | pushHard | pull | pullHard | slideLeft | slideRight | rise | fall | drift | still
//   focus   [x, y] where a push or pull goes (the face), 0.25 to 0.75. Default [0.5, 0.45].
//   enter   how it arrives: cut (default) | slide | zoom | fade (`from: 'left'` flips a slide)
//
//   node scripts/plan-shots.mjs <project>      after `voice`: cuts the narration into shots of 2 to 3 seconds, keeps what you wrote
//   node scripts/check-shots.mjs <project>     lint: characters, words, durations, and storyboard.md (says next to the picture prompt)
//   node scripts/shot-images.mjs <project>     prompts.md, or --perchance (12 tabs), --characters first to look at the cast
//   node scripts/storyboard.mjs <project>      a sheet of the pictures with the narration under each, to check the story reads right

// ---------- the layout ----------
// 'full' (default): a full-screen 9:16 picture, big word-by-word captions in the lower middle over a soft dark foot.
// 'letterbox':      a square picture in a 9:16 frame between black bars, a title above, phrase captions below (like the sheikh video).
// The picture shape and the clay words below follow the layout, so change only this line.
export const LAYOUT = 'full';
export const TITLE = null; // letterbox only: { lines: ['The Lantern', '*Light*'] } puts a title in the top bar; *starred* words are gold
// Big white capitals, two or three words at a time, the spoken word lit yellow (full layout). y: 0.66 = lower middle of the frame.
export const CAPTIONS_FULL = { y: 0.7, size: 0.085, maxWords: 3, maxChars: 16 };
// Plain phrase captions under the picture, the spoken word gold (letterbox layout).
export const CAPTIONS = { y: 0.805, size: 0.04, upper: false, maxWords: 6, maxChars: 34, breakOn: /[,.!?]$/, pop: false, edge: 0, lit: '#f0c14b', weight: 800 };

// ---------- the look ----------
const FULL = LAYOUT === 'full';
export const STYLE_HEAD = 'Claymation stop-motion scene, handmade plasticine and polymer clay,';
export const STYLE_TAIL = `visible fingerprints and soft clay texture, warm cinematic lighting, shallow depth of field, ${FULL ? 'vertical 9:16' : 'square 1:1'}, no text, no letters, no logos`;
export const NEGATIVE = 'photo, realistic, 3d render, cgi, cartoon, anime, flat illustration, text, letters, watermark, blurry, extra fingers, deformed hands, two heads';
export const ASPECT = FULL ? '9:16' : '1:1';

// ---------- the cast ----------
// height: a number, 1 = the tallest grown-up of the story. A child is about 0.5 to 0.6, a teenager 0.8, a short adult 0.9.
// Write every field. Do not use words that change between pictures ("young", "old") anywhere else than here.
export const CAST = {
  dada: {
    noun: 'an old grandfather', short: 'the grandfather', age: 'about 70 years old', height: 1,
    build: 'tall and thin with a slight stoop', face: 'long face, deep smile lines, a bushy grey moustache, round wire-rim glasses',
    hair: 'a bald head with white hair at the sides', outfit: 'a brown knitted cardigan, grey trousers and brown slippers',
  },
  mira: {
    noun: 'a little girl', short: 'the girl', age: 'about 8 years old', height: 0.55,
    build: 'small and slim', face: 'round face, big brown eyes, rosy cheeks',
    hair: 'two black braids tied with red ribbons', outfit: 'a yellow dress, a green scarf and red boots',
  },
  traveler: {
    noun: 'a tired traveler', short: 'the traveler', age: 'about 35 years old', height: 0.95,
    build: 'medium height and broad shoulders', face: 'square face, short stubble, tired eyes',
    hair: 'short black hair', outfit: 'a long dark-blue raincoat, a straw hat and a big brown backpack',
  },
};

// ---------- the sets ----------
// A place used in more than one shot is written once here, so it looks the same each time.
export const SETS = {
  cottage: 'a small clay cottage with a red roof and a blue wooden door at the edge of a village, a big brass lantern hanging by the door',
  inside: 'the cozy inside of the cottage with a wooden table, a stove and blue curtains',
  cottageNight: 'the same small clay cottage with a red roof and a blue wooden door at night, the storm has passed and stars are coming out',
  hill: 'a grassy clay hill above the village with one bare tree, dark stormy clouds',
  path: 'a winding dark clay path through a small village at night under a stormy sky',
};

// ---------- the shots ----------
// <SHOTS> generated by scripts/plan-shots.mjs: it rewrites everything down to </SHOTS> and keeps the scenes you wrote
// for lines of the narration that did not change.
export const SHOTS = [
  { n: 1, word: 0, motion: "push", focus: [0.5,0.5],
    says: "Mira lived with her grandfather at the edge",
    who: ["dada","mira"], shot: "wide shot", set: "cottage", mood: "warm and happy",
    action: "{dada} and {mira} stand hand in hand in front of their cottage, she smiles up at him" },
  { n: 2, word: 8, motion: "pull", focus: [0.5,0.45],
    says: "of a small village. Every evening,",
    who: [], shot: "wide shot", set: "cottage", mood: "peaceful",
    action: "evening over a quiet village of tiny clay houses with glowing windows, the cottage stands alone at the edge of the village, golden sunset sky" },
  { n: 3, word: 14, motion: "push", focus: [0.5,0.4],
    says: "he lit a big brass lantern and hung",
    who: ["dada"], shot: "medium shot", set: "cottage", mood: "warm",
    action: "{dada} lights a big brass lantern with a long match, the flame glows on his glasses" },
  { n: 4, word: 22, motion: "slideLeft", focus: [0.5,0.45],
    says: "it by the door. Mira asked him why.",
    who: ["dada","mira"], shot: "medium shot", set: "cottage", mood: "curious",
    action: "{dada} hangs the glowing brass lantern on a hook by the blue door while {mira} looks up at him with a curious face and one hand raised as if asking a question" },
  { n: 5, word: 30, motion: "push", focus: [0.5,0.45],
    says: "He said a light helps lost travelers find",
    who: ["dada","mira"], shot: "medium shot", set: "cottage", mood: "gentle and wise",
    action: "{dada} crouches beside {mira} and points at the glowing lantern, its light helps a tiny lost walking figure find the way along a dark path" },
  { n: 6, word: 38, motion: "pull", focus: [0.5,0.45],
    says: "their way home. One stormy night,",
    who: [], shot: "wide shot", set: "path", mood: "stormy and lonely",
    action: "the dark path leads home through the village, far away one small warm window glimmers in the cottage" },
  { n: 7, word: 44, motion: "pushHard", focus: [0.5,0.45],
    says: "the wind blew the lantern out.",
    who: [], shot: "close-up", set: "cottage", mood: "dramatic",
    action: "the brass lantern by the door is dark and unlit, its glass is black and a thin curl of smoke rises from its wick, a strong wind bends the trees in the storm" },
  { n: 8, word: 50, motion: "slideRight", focus: [0.5,0.45],
    says: "Mira grabbed a candle and ran up the hill.",
    who: ["mira"], shot: "wide shot", set: "hill", mood: "brave and urgent",
    action: "{mira} runs up the grassy hill holding a small lit candle in both hands, her scarf flying in the wind" },
  { n: 9, word: 59, motion: "rise", focus: [0.5,0.4],
    says: "She held it high in the dark. Soon,",
    who: ["mira"], shot: "low angle shot", set: "hill", mood: "hopeful and brave",
    action: "{mira} stands on top of the hill with one arm stretched straight up high above her head, holding a small lit candle in her raised hand, the small flame is the only light in the dark" },
  { n: 10, word: 67, motion: "push", focus: [0.5,0.4],
    says: "a tired traveler walked out of the rain.",
    who: ["traveler"], shot: "medium shot", set: "hill", mood: "tired and hopeful",
    action: "{traveler} walks slowly out of heavy rain toward a small glowing light, hunched under his raincoat" },
  { n: 11, word: 75, motion: "push", focus: [0.5,0.45],
    says: "He thanked her with a warm smile.",
    who: ["traveler","mira"], shot: "medium shot", set: "hill", mood: "warm and grateful",
    action: "{traveler} bows his head and smiles warmly down at {mira} who holds up her candle" },
  { n: 12, word: 82, motion: "push", focus: [0.5,0.5],
    says: "Grandfather hugged her tight. Now",
    who: ["dada","mira"], shot: "medium shot", set: "cottage", mood: "relieved and loving",
    action: "{dada} kneels and hugs {mira} tightly, her candle between them, in front of the cottage door" },
  { n: 13, word: 87, motion: "pull", focus: [0.5,0.45],
    says: "two lanterns glow by the door,",
    who: [], shot: "medium shot", set: "cottageNight", mood: "warm and magical",
    action: "two brass lanterns glow side by side by the blue door, one slightly smaller than the other, soft golden light on the door step" },
  { n: 14, word: 93, motion: "pull", focus: [0.5,0.45],
    says: "one for the travelers, and one for Mira.",
    who: ["dada","mira"], shot: "wide shot", set: "cottageNight", mood: "peaceful",
    action: "{dada} and {mira} sit together on the door step under the two glowing lanterns, her head leaning on his arm" },
];
// </SHOTS>

// ---------- the prompts ----------
const EXPAND = /\{(\w+)\}/g;
export const fileOf = (shot) => shot.file ?? `shot${String(shot.n).padStart(2, '0')}`;

// The full description of a character. Always the same words.
export function describe(key) {
  const c = CAST[key];
  if (!c) throw new Error(`"${key}" is not in CAST (have: ${Object.keys(CAST).join(', ')})`);
  for (const f of ['noun', 'short', 'age', 'height', 'build', 'face', 'hair', 'outfit']) if (c[f] === undefined) throw new Error(`CAST.${key} has no "${f}"`);
  return `a clay figurine of ${c.noun}, ${c.age}, ${c.build}, ${c.face}, ${c.hair}, wearing ${c.outfit}${c.extra ? `, ${c.extra}` : ''}`;
}

// Who is taller than whom, from the numbers in CAST.
export function sizes(keys) {
  const list = [...new Set(keys)].map((k) => ({ k, c: CAST[k] })).filter((x) => x.c).sort((a, b) => b.c.height - a.c.height);
  const out = [];
  for (let i = 1; i < list.length; i++) {
    const tall = list[i - 1].c;
    const small = list[i].c;
    const r = small.height / tall.height;
    const how = r >= 0.92 ? 'about the same height as' : r >= 0.75 ? 'a little shorter than' : r >= 0.6 ? 'clearly shorter than, up to the chest of' : r >= 0.45 ? 'about half as tall as' : 'tiny next to';
    out.push(`${small.short} is ${how} ${tall.short}`);
  }
  return out.length ? `Sizes: ${out.join('; ')}.` : '';
}

// In the action, {key} becomes the character's short name ("the grandfather"), so the sentence reads clearly; the full,
// always identical description of every character in `who` follows in a "Characters:" part. A set key becomes its description.
function expand(text, seen) {
  return String(text).replace(EXPAND, (m, key) => {
    if (CAST[key]) { seen.add(key); return CAST[key].short; }
    if (SETS[key]) return SETS[key];
    throw new Error(`{${key}} is neither in CAST (${Object.keys(CAST).join(', ')}) nor in SETS (${Object.keys(SETS).join(', ')})`);
  });
}
const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1);

// The prompt of one shot: clay words, shot size and action, the characters in full, their sizes, the set, the mood, clay words.
export function promptFor(shot) {
  if (!shot.action || /^TODO/.test(shot.action)) throw new Error(`shot ${shot.n}: the action is not written yet`);
  const seen = new Set();
  const action = expand(shot.action, seen);
  const missing = (shot.who || []).filter((k) => !seen.has(k)); // a character in `who` that the action never mentions
  if (missing.length) throw new Error(`shot ${shot.n}: ${missing.join(', ')} is in "who" but {${missing[0]}} is not in the action`);
  const set = shot.set ? (SETS[shot.set] ? SETS[shot.set] : shot.set) : '';
  const who = [...new Set(shot.who || [])];
  const parts = [
    STYLE_HEAD,
    `${shot.shot || 'medium shot'}: ${cap(action)}.`,
    who.length ? `Characters: ${who.map((k) => `${cap(CAST[k].short)} is ${describe(k)}`).join('. ')}.` : '',
    sizes(who),
    set ? `Setting: ${set}.` : '',
    shot.mood ? `Mood: ${shot.mood}.` : '',
    STYLE_TAIL,
  ].filter(Boolean);
  return parts.join(' ');
}

// A picture of one character alone on a plain background, to look at before any shot is made (shot-images.mjs --characters).
export function characterPrompt(key) {
  return `${STYLE_HEAD} full body portrait, ${describe(key)}, standing, facing the camera, calm friendly expression, plain soft grey background, ${STYLE_TAIL}`;
}

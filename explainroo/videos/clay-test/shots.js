// The picture list for the clay-stopmotion template (sample: why bread rises).
//
// Two kinds of picture, both made as AI clay pictures:
//   SHOTS    full-frame clay scenes, one per [#sN] marker in script.md. assets/shot01.png ...
//            Each one is moved by a camera that steps and trembles like clay under a fingertip.
//            A clip (assets/shot01.mp4, from any image-to-video tool) replaces the picture and plays as it is.
//   PUPPETS  clay characters and props on a plain flat green background. assets/yeast.png ...
//            They are cut out when the video is drawn, then pop, hop, squash and breathe (see CAST in scenes.js).
//
// While a file is missing, a backdrop shows a placeholder with its prompt and a puppet shows a clay blob
// with its name, so you can check the story, the timing and the captions first.
//
// Make the missing pictures with:  node scripts/shot-images.mjs <project-folder> --dry-run
//   then --local (free, on this Mac), --perchance, --cloudflare or --pollinations (free tiers; prompts go to that site).

// Added to every backdrop prompt. Say "empty table in front": the puppets will stand there.
export const STYLE = 'handmade claymation miniature set, plasticine and polymer clay, visible fingerprints and soft clay texture, warm studio lighting, shallow depth of field, cozy, a clear empty table surface in the lower middle, no characters, vertical 9:16, no text, no letters, no logos';
export const ASPECT = '9:16';

// The flat background the puppets are drawn on; the cut-out removes it by color. Green keeps pale puppets
// (dough, sugar, eggs, snow) intact, which a white background cannot. For a GREEN puppet use 'bright magenta' here.
export const PUPPET_BG = 'bright green';

// Added to every puppet prompt.
export const PUPPET_STYLE = `handmade plasticine clay figure, soft clay texture with fingerprints, simple rounded cute shape, bright saturated colors, soft studio light, standing on its own, whole figure visible and centered, isolated on a plain flat solid ${PUPPET_BG} background like a green screen, no text, no letters, no logos`;
export const PUPPET_ASPECT = '1:1';

// motion: push | pull | panLeft | panRight | rise | still
export const SHOTS = [
  { n: 1, at: '#s1', file: 'shot01', motion: 'push', prompt: 'A cozy clay kitchen counter with a window, a wooden board, a rolling pin and a flour sack in the background' },
  { n: 2, at: '#s2', file: 'shot02', motion: 'panRight', prompt: 'A clay kitchen counter, a big mixing bowl and a small jar on a wooden table, warm morning light' },
  { n: 3, at: '#s3', file: 'shot03', motion: 'push', prompt: 'A clay bakery table dusted with flour, a pile of white flour and a small bowl of sugar cubes, close view' },
  { n: 4, at: '#s4', file: 'shot04', motion: 'pull', prompt: 'A clay kitchen counter with a large glass bowl and a cloth, soft window light, empty table in front' },
  { n: 5, at: '#s5', file: 'shot05', motion: 'push', prompt: 'A clay baking table with a big round bowl of dough in the background, flour dust in the air' },
  { n: 6, at: '#s6', file: 'shot06', motion: 'rise', prompt: 'A clay kitchen shelf scene with colorful balloons floating near the ceiling, bright and playful' },
  { n: 7, at: '#s7', file: 'shot07', motion: 'push', prompt: 'A glowing clay oven with a warm orange light inside, brick wall behind, empty table in front' },
  { n: 8, at: '#s8', file: 'shot08', motion: 'panLeft', prompt: 'A clay oven door open with golden light spilling out, a wooden peel leaning on the wall' },
  { n: 9, at: '#s9', file: 'shot09', motion: 'pull', prompt: 'A clay kitchen counter at golden hour, a cooling rack and a folded cloth, empty table in front' },
];

export const PUPPETS = [
  { n: 1, file: 'yeast', prompt: 'A tiny round beige yeast cell character with two big friendly eyes and a small smile' },
  { n: 2, file: 'dough', prompt: 'A soft round lump of white bread dough character with two big eyes and a gentle smile' },
  { n: 3, file: 'sugar', prompt: 'A small square white sugar cube made of clay with tiny sparkly sugar crystals on it, a plain cube shape, no face, no arms, no legs' },
  { n: 4, file: 'bubble', prompt: 'A single shiny round blue-tinted air bubble made of clay, a little highlight on it' },
  { n: 5, file: 'loaf', prompt: 'A golden brown loaf of bread with a crispy crust and a happy face, small arms' },
];

// A line of title text on the first shot. *Starred* words are lit orange.
export const HOOK = { text: 'WHY DOES *BREAD* RISE?', at: 0.2, out: '#s2' };

// Number plaques drawn on top of a shot (see board() in lib/clay.js). None in the sample.
export const BOARDS = [];

// The sticker list for the youtube-random-facts template (sample: Pixar almost deleted Toy Story 2).
// One line per picture. scenes.js shows each one by its `file` name (k.sticker('computer', ...)).
// Finished pictures go in assets/ named after `file` (computer.png). The picture is cut out of
// its plain white background and given a white sticker edge when the video is drawn, so the
// prompt must say "plain white background" (STYLE already does) and describe ONE object.
//
// Make them with:  node scripts/shot-images.mjs <project-folder> --pollinations   (or --local)
// For a new fact, ask for the objects the voice names: a chip, a cable, a camera, a phone.

// Added to the end of every prompt so all the stickers share one look.
// (Keep text and logos out: picture models get letters wrong. Draw words in scenes.js.)
export const STYLE = 'flat vector sticker illustration, bold clean dark outlines, bright saturated colors, simple shading, isolated on a plain pure white background, centered, whole object visible, no shadow, no text, no letters, no logos';

// Stickers are square.
export const ASPECT = '1:1';

export const SHOTS = [
  { n: 1, file: 'cowboy', prompt: 'A cute toy cowboy doll with a brown hat, a red bandana and a yellow vest, standing, full body' },
  { n: 2, file: 'clapper', prompt: 'A blank black and white movie clapperboard, open, with no writing on it' },
  { n: 3, file: 'computer', prompt: 'A single beige desktop computer with a boxy monitor and a keyboard, front view' },
  { n: 4, file: 'folder', prompt: 'A single yellow file folder with a few blank papers sticking out' },
  { n: 5, file: 'trash', prompt: 'A single metal trash can with its lid slightly open, a crumpled paper on top' },
  { n: 6, file: 'house', prompt: 'A cozy small house with a red roof, a door and two windows, front view' },
];

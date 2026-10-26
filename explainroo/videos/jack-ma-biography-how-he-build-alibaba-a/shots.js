// The sticker list for "Jack Ma: rejected 30 times, then Alibaba".
// One line per picture. scenes.js shows each one by its `file` name (k.sticker('stamp', ...)).
// Finished pictures go in assets/ named after `file` (stamp.png). The picture is cut out of
// its plain white background and given a white sticker edge when the video is drawn, so the
// prompt must say "plain white background" (STYLE already does) and describe ONE object.
//
// Make them with:  node scripts/shot-images.mjs <project-folder> --perchance --only 1,2,3

// Added to the end of every prompt so all the stickers share one look.
// (Keep text and logos out: picture models get letters wrong. Draw words in scenes.js.)
export const STYLE = 'flat vector sticker illustration, bold clean dark outlines, bright saturated colors, simple shading, isolated on a plain pure white background, centered, whole object visible, no shadow, no text, no letters, no logos';

// Stickers are square.
export const ASPECT = '1:1';

export const SHOTS = [
  { n: 1, file: 'stamp', prompt: 'A single red rubber hand stamp with a round wooden handle, standing upright, red ink on its base' },
  { n: 2, file: 'jackma', prompt: 'Head and shoulders portrait of a slim smiling Chinese man in his thirties with short black hair and a thin face, wearing a dark blue suit, white shirt and red tie, cartoon style' },
  { n: 3, file: 'exam', prompt: 'A single white exam paper sheet with grey lines of tiny unreadable scribbles and one big red cross mark drawn over it, a yellow pencil lying on it' },
  { n: 4, file: 'harvard', prompt: 'A single classic red brick university building with white columns, a white clock tower and green doors, front view' },
  { n: 5, file: 'chicken', prompt: 'A single red and white striped paper bucket full of golden fried chicken drumsticks, no label' },
  { n: 6, file: 'plane', prompt: 'A single white passenger airplane with a blue tail flying slightly upward, side view' },
  { n: 7, file: 'computer', prompt: 'A single beige 1990s desktop computer with a boxy CRT monitor showing a plain blue screen, with a keyboard in front' },
  { n: 8, file: 'apartment', prompt: 'A single small beige apartment building with many windows, balconies and a flat roof, front view' },
  { n: 9, file: 'money', prompt: 'A single bulging tan canvas money bag tied with a brown rope, plain, no symbol' },
  { n: 10, file: 'chart', prompt: 'A single rising bar chart with green bars growing from left to right and a thick upward red arrow over it, no numbers' },
];

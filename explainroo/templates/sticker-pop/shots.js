// The sticker list for the sticker-pop template (sample: Alfred Nobel).
// One line per picture. scenes.js shows each one by its `file` name (k.sticker('dynamite', ...)).
// Finished pictures go in assets/ named after `file` (dynamite.png). The picture is cut out of
// its plain white background and given a white sticker edge when the video is drawn, so the
// prompt must say "plain white background" (STYLE already does) and describe ONE object.
//
// Make them with:  node scripts/shot-images.mjs <project-folder> --pollinations   (or --local)

// Added to the end of every prompt so all the stickers share one look.
// (Keep text and logos out: picture models get letters wrong. Draw words in scenes.js.)
export const STYLE = 'flat vector sticker illustration, bold clean dark outlines, bright saturated colors, simple shading, isolated on a plain pure white background, centered, whole object visible, no shadow, no text, no letters, no logos';

// Stickers are square.
export const ASPECT = '1:1';

export const SHOTS = [
  { n: 1, file: 'dynamite', prompt: 'A single stick of red dynamite standing upright, with a short curled fuse on top' },
  { n: 2, file: 'medal', prompt: 'A round gold prize medal with a raised profile portrait of a bearded man, shiny metal rim, seen straight on' },
  { n: 3, file: 'nobel', prompt: 'Head and shoulders portrait of a serious 19th century Swedish man with a short beard, dark hair, a black suit, a white shirt and a black bow tie, vintage sepia illustration style' },
  { n: 4, file: 'rifle', prompt: 'A single old-fashioned rifle with a wooden stock, side view' },
  { n: 5, file: 'pistol', prompt: 'A single old-fashioned revolver pistol with a wooden grip, side view' },
  { n: 6, file: 'barrels', prompt: 'Two wooden barrels with yellow warning labels, standing side by side' },
  { n: 8, file: 'newspaper', prompt: 'A folded old newspaper page with a black and white photo and gray lines of tiny unreadable scribbles instead of words, slightly crumpled paper' },
  { n: 7, file: 'scroll', prompt: 'A rolled-up parchment scroll tied with a red ribbon and a red wax seal, with a quill pen leaning on it' },
];

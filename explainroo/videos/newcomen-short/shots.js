// The shot list for "The pump that started the age of steam". One line per picture or clip.
// The script (script.md) has a [#s1], [#s2] ... marker where each shot starts; a shot lasts
// until the next marker. Finished files go in assets/ named after `file`:
// shot01.png / .jpg / .webp for a picture (it gets the camera move below),
// or shot01.mp4 / .mov / .webm for a clip (it plays as it is).
//
// motion: push | pull | panLeft | panRight | rise | still   (pictures only)

// Added to the end of every prompt so all the pictures share one look.
// (Keep text and logos out: picture models get letters wrong. Draw facts with compare().)
export const STYLE = 'handcrafted claymation miniature diorama, hand-sculpted clay figures with visible fingerprints, warm candlelight and window light, shallow depth of field, rich textures, early 1700s England, vertical 9:16, no text, no letters, no signs, no logos';

// The recurring people, described the same way every time (the local picture model takes no reference images).
const MINER = 'a thin miner with a soot-smudged face, torn linen shirt and a flat leather cap';
const NEWCOMEN = 'a stocky middle-aged ironmonger with a grey curled wig, a brown wool waistcoat and a leather apron';

export const HOOK = { text: 'BEFORE THE *INDUSTRIAL REVOLUTION*, THERE WAS A FLOODED MINE.', at: 0.2, out: '#s3' };

export const SHOTS = [
  { n: 1, at: '#s1', file: 'shot01', motion: 'push', prompt: 'A dark timber-framed mine shaft with black water rising between the wooden props, a single candle glowing' },
  { n: 2, at: '#s2', file: 'shot02', motion: 'push', prompt: `${MINER} standing waist deep in dark water in a low mine tunnel, looking up in dismay, candle on the wall` },
  { n: 3, at: '#s3', file: 'shot03', motion: 'panLeft', prompt: 'A brown horse walking in a circle turning a wooden winding drum at a hillside mine, grey cloudy sky' },
  { n: 4, at: '#s4', file: 'shot04', motion: 'push', prompt: `${NEWCOMEN} standing behind the counter of a cluttered ironmonger's shop, hands resting on a bolt of cloth, window light` },
  { n: 5, at: '#s5', file: 'shot05', motion: 'push', prompt: 'A brass cylinder filling with steam while a stream of cold water sprays into it, glowing blue droplets in the dark' },
  { n: 6, at: '#s6', file: 'shot06', motion: 'pull', prompt: 'Steam collapsing into water droplets inside a glass-like cylinder, a hollow vacuum, cool blue light' },
  { n: 7, at: '#s7', file: 'shot07', motion: 'push', prompt: 'A heavy iron piston forced down into a brass cylinder, a massive wooden beam above it tilting' },
  { n: 8, at: '#s8', file: 'shot08', motion: 'pull', prompt: 'A tall brick engine house at a coal works with a great wooden beam sticking out of its upper window, smoke from a small chimney' },
  { n: 9, at: '#s9', file: 'shot09', motion: 'push', prompt: 'A huge heap of black coal at the foot of an engine house, a shovel stuck in it, miners working nearby' },
  { n: 10, at: '#s10', file: 'shot10', motion: 'rise', prompt: 'A tall brick chimney pouring dark smoke over a bright industrial town at sunset, a flooded mine pit in the foreground' },
];

// No number boards in the short version.
export const BOARDS = [];

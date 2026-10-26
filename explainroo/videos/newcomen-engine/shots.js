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
  { n: 2, at: '#s2', file: 'shot02', motion: 'pull', prompt: 'A glowing orange coal fire in an iron grate in a cold stone room, a pile of black coal beside it' },
  { n: 3, at: '#s3', file: 'shot03', motion: 'push', prompt: `${MINER} standing waist deep in dark water in a low mine tunnel, looking up in dismay, candle on the wall` },
  { n: 4, at: '#s4', file: 'shot04', motion: 'rise', prompt: 'Close-up of muddy hands hauling a wooden bucket of water up a mine shaft on a rope, water spilling' },
  { n: 5, at: '#s5', file: 'shot05', motion: 'panLeft', prompt: 'A brown horse walking in a circle turning a wooden winding drum at a hillside mine, grey cloudy sky' },
  { n: 6, at: '#s6', file: 'shot06', motion: 'pull', prompt: 'A wide view of a rainy moorland coal mine with a wooden headframe and flooded muddy ground, miners looking down the shaft' },
  { n: 7, at: '#s7', file: 'shot07', motion: 'push', prompt: `${NEWCOMEN} standing behind the counter of a cluttered ironmonger's shop, hands resting on a bolt of cloth, window light` },
  { n: 8, at: '#s8', file: 'shot08', motion: 'panRight', prompt: `${NEWCOMEN} talking with ${MINER} in front of a shop, other miners in the background sitting on the ground` },
  { n: 9, at: '#s9', file: 'shot09', motion: 'push', prompt: 'Top-down view of a workbench covered in sketches of a cylinder and beam, brass parts, tools and a candle' },
  { n: 10, at: '#s10', file: 'shot10', motion: 'still', prompt: 'A copper kettle boiling on a fire with a thick plume of white steam rising, dark background, warm glow' },
  { n: 11, at: '#s11', file: 'shot11', motion: 'push', prompt: 'A brass cylinder filling with steam while a stream of cold water sprays into it, glowing blue droplets in the dark' },
  { n: 12, at: '#s12', file: 'shot12', motion: 'pull', prompt: 'Steam collapsing into water droplets inside a glass-like cylinder, a hollow vacuum, cool blue light' },
  { n: 13, at: '#s13', file: 'shot13', motion: 'push', prompt: 'A heavy iron piston forced down into a brass cylinder, a massive wooden beam above it tilting' },
  { n: 14, at: '#s14', file: 'shot14', motion: 'rise', prompt: 'A giant wooden rocking beam with iron chains lifting a long pump rod out of a mine shaft' },
  { n: 15, at: '#s15', file: 'shot15', motion: 'pull', prompt: 'A tall brick engine house at a coal works with a great wooden beam sticking out of its upper window, smoke from a small chimney' },
  { n: 16, at: '#s16', file: 'shot16', motion: 'panLeft', prompt: 'An empty horse walk beside the engine house while the engine works, a resting horse grazing in the foreground' },
  { n: 17, at: '#s17', file: 'shot17', motion: 'push', prompt: `${NEWCOMEN} with a worried look holding a lump of coal, the engine house in the background` },
  { n: 18, at: '#s18', file: 'shot18', motion: 'push', prompt: 'A brass cylinder glowing red hot on one side while cold water drips on the other, heat shimmer and steam' },
  { n: 19, at: '#s19', file: 'shot19', motion: 'rise', prompt: 'A stoker shoveling coal into a roaring orange furnace under a boiler, sparks flying' },
  { n: 20, at: '#s20', file: 'shot20', motion: 'pull', prompt: 'A cart pulled by a horse carrying heavy sacks of coal down a long muddy road, far from any mine' },
  { n: 21, at: '#s21', file: 'shot21', motion: 'push', prompt: 'A huge heap of black coal at the foot of an engine house, a shovel stuck in it, miners working nearby' },
  { n: 22, at: '#s22', file: 'shot22', motion: 'panRight', prompt: 'A single wheelbarrow of coal and scraps beside the engine furnace at a pithead, smoke drifting across the hills' },
  { n: 23, at: '#s23', file: 'shot23', motion: 'pull', prompt: 'A row of engine houses with beams rocking across a misty hilly landscape, many small chimneys smoking' },
  { n: 24, at: '#s24', file: 'shot24', motion: 'push', prompt: 'A young Scottish instrument maker in a workshop leaning over a small brass model steam engine on a bench, window light' },
  { n: 25, at: '#s25', file: 'shot25', motion: 'push', prompt: 'A small brass vessel with pipes standing separate from the main cylinder of a model engine, a lamp glowing beside it' },
  { n: 26, at: '#s26', file: 'shot26', motion: 'still', prompt: 'Two engines side by side in the dark, a big one buried in a mountain of coal and a smaller one with a small pile of coal' },
  { n: 27, at: '#s27', file: 'shot27', motion: 'panLeft', prompt: 'A busy early factory interior with a steam engine turning shafts and belts, workers at looms, golden dusty light' },
  { n: 28, at: '#s28', file: 'shot28', motion: 'rise', prompt: 'A tall brick chimney pouring dark smoke over a bright industrial town at sunset, a flooded mine pit in the foreground' },
];

// Number boards drawn on top of a shot (see compare() in lib/shots.js).
export const BOARDS = [
  { at: '#s26', out: '#s27', title: 'Coal for the same work', a: { label: 'Newcomen engine', value: '100%' }, b: { label: 'Watt engine', value: 'about 50%' } },
];

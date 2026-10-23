// The shot list. One line per picture or clip. The script (script.md) has a
// [#s1], [#s2] ... marker where each shot should start; the shot lasts until
// the next marker. Put the finished files in assets/ named after `file`:
// shot01.png / .jpg / .webp for a picture (it gets the camera move below),
// or shot01.mp4 / .mov / .webm for a clip (it plays as it is).
// While a file is missing, the shot shows a placeholder with its prompt.
//
// motion: push | pull | panLeft | panRight | rise | still   (pictures only)

// Added to the end of every prompt so all the pictures share one look.
// (Keep text and logos out: picture models get letters wrong. Draw facts with compare().)
export const STYLE = 'handcrafted claymation miniature diorama, warm cinematic lighting, shallow depth of field, rich textures, 1950s American shipping docks, vertical 9:16, no text, no logos';

export const HOOK = { text: 'BEFORE THE *SHIPPING CONTAINER*, EVERY CARGO WAS LOADED PIECE BY PIECE.', at: 0.2, out: '#s4' };

export const SHOTS = [
  { n: 1, at: '#s1', file: 'shot01', motion: 'push', prompt: 'A heavy dock crane hook swinging above the open hold of a cargo ship at dawn, orange sky' },
  { n: 2, at: '#s2', file: 'shot02', motion: 'panLeft', prompt: 'Dockworkers lifting wooden crates, barrels and sacks one by one into a ship hold' },
  { n: 3, at: '#s3', file: 'shot03', motion: 'pull', prompt: 'A crowded pier piled high with loose crates, barrels and sacks waiting to be loaded' },
  { n: 4, at: '#s4', file: 'shot04', motion: 'push', prompt: 'Close-up of a dusty dock office clock and a ledger on a wooden desk, late afternoon light' },
  { n: 5, at: '#s5', file: 'shot05', motion: 'push', prompt: 'A weathered 1930s truck driver leaning on his truck cab at a pier, thoughtful' },
  { n: 6, at: '#s6', file: 'shot06', motion: 'panRight', prompt: 'A long line of old trucks loaded with cotton bales waiting on a New Jersey pier' },
  { n: 7, at: '#s7', file: 'shot07', motion: 'rise', prompt: 'A whole truck trailer being lifted by a crane toward a ship, dreamlike glow' },
  { n: 8, at: '#s8', file: 'shot08', motion: 'push', prompt: 'An old wartime tanker ship in a shipyard being fitted with a deck for metal boxes' },
  { n: 9, at: '#s9', file: 'shot09', motion: 'pull', prompt: 'A ship loaded with steel containers leaving a harbor at sunset, the city skyline behind' },
  { n: 10, at: '#s10', file: 'shot10', motion: 'panLeft', prompt: 'Rows of identical steel containers stacked on a ship deck, close and dramatic' },
  { n: 11, at: '#s11', file: 'shot11', motion: 'push', prompt: 'Macro shot of a few coins on a worn ledger beside a small toy ship, warm light' },
  { n: 12, at: '#s12', file: 'shot12', motion: 'rise', prompt: 'A crane lifting a single container off a truck onto a ship in one smooth move' },
  { n: 13, at: '#s13', file: 'shot13', motion: 'pull', prompt: 'The first all-container ship sailing out to sea, calm water, golden hour' },
  { n: 14, at: '#s14', file: 'shot14', motion: 'push', prompt: 'Aerial view of a huge modern container port at dusk, thousands of boxes, ships alongside' },
];

// Number boards drawn on top of a shot (see compare() in lib/shots.js).
export const BOARDS = [
  { at: '#s11', out: '#s12', title: 'Loading cost per ton', a: { label: 'Loose cargo, 1956', value: '$5.83' }, b: { label: 'In a container', value: 'about 16¢' } },
];

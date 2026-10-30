// The shot list. One entry per picture or clip. The script (script.md) has a [#s1], [#s2] ...
// marker where each shot should start; the shot lasts until the next marker.
//
//   file    the name of the picture or clip in assets/ (no extension): shot01.png / .jpg / .webp
//           gets the camera move below; shot01.mp4 / .mov / .webm plays as it is (stock or archive footage)
//   motion  push | pull | panLeft | panRight | rise | still   (pictures only; vary them)
//           parallax | parallaxLeft | parallaxRight | parallaxIn | parallaxOut: 3D moves that use the picture's
//           depth map (run scripts/depth.mjs); without a depth map they fall back to a flat move
//   prompt  what the picture shows: one scene, one subject, the light, the framing. No text in pictures.
//   dir     the visual direction in a short line (shown on the storyboard and on the placeholder)
//   text    the on-screen text for this scene, for the storyboard (HOOK and OVERLAYS draw it)
// While a file is missing, the shot shows a placeholder with its direction.

// Added to the end of every prompt so all the pictures share one look.
export const STYLE = 'hand-inked comic book illustration with warm sepia watercolor wash, painterly parchment tones, golden cinematic light, detailed linework, 14th century England, vertical 9:16, no text, no letters, no signs, no logos';
export const ASPECT = '9:16';

// The title card: shown from the start until the marker in `out`.
export const HOOK = { kicker: '1348 · England', title: 'When the Black Death hit England', sub: 'One ship. One summer.', at: 0.2, out: '#s2' };

export const SHOTS = [
  { n: 1, at: '#s1', file: 'shot01', motion: 'parallaxIn', dir: 'Hook: a lone merchant ship at a quiet harbour, golden dawn light.', prompt: 'A lone medieval merchant ship with a square sail arriving at a small English harbour at dawn, calm water, golden light, wide shot', text: 'Title card' },
  { n: 2, at: '#s2', file: 'shot02', motion: 'parallaxRight', dir: 'Dockers on the quay look up, unaware.', prompt: 'Medieval dockworkers and merchants on a stone quay watching a ship tie up, relaxed, unaware of danger, morning light', text: 'Tag: Summer 1348 · Dorset' },
  { n: 3, at: '#s3', file: 'shot03', motion: 'pull', dir: 'Map: the plague moving along trade routes into Europe.', prompt: 'An antique parchment map of Europe and the Mediterranean with dark ink stains spreading along trade routes, seen from above, ornate border', text: '' },
  { n: 4, at: '#s4', file: 'shot04', motion: 'push', dir: 'Close-up: a rat on a ship rope, fleas implied, ominous.', prompt: 'Close-up of a rat climbing a thick rope on a medieval ship deck, sacks of grain behind it, dim warm light', text: '' },
  { n: 5, at: '#s5', file: 'shot05', motion: 'parallaxLeft', dir: 'The port of Melcombe Regis: crowded harbour, ships and warehouses.', prompt: 'A small crowded medieval English port town with timber warehouses and moored ships, overcast sky', text: 'Tag: June 1348 · Melcombe Regis' },
  { n: 6, at: '#s6', file: 'shot06', motion: 'push', dir: 'A feverish villager in a dim cottage, a candle by the bed.', prompt: 'A pale feverish medieval villager lying in a cottage bed, candlelight, a worried family member at the bedside', text: '' },
  { n: 7, at: '#s7', file: 'shot07', motion: 'rise', dir: 'A hand reaching from a doorway; the sense of time running out.', prompt: 'A weak hand reaching out from a dark cottage doorway toward a bright street, cold blue light and warm light contrasting', text: '' },
  { n: 8, at: '#s8', file: 'shot08', motion: 'parallaxRight', dir: 'London street in autumn, smoke, few people.', prompt: 'A medieval London street in autumn, half-timbered houses, drifting smoke, only a few figures hurrying, a cart in the distance', text: 'Tag: Autumn 1348 · London' },
  { n: 9, at: '#s9', file: 'shot09', motion: 'parallaxIn', dir: 'A cart of the dead and a lone gravedigger.', prompt: 'A lone medieval gravedigger beside a horse cart on a misty road, shovel in hand, bleak evening light', text: '' },
  { n: 10, at: '#s10', file: 'shot10', motion: 'pull', dir: 'A doctor in a long robe, helpless over a patient.', prompt: 'A medieval physician in a long dark robe and hat examining a patient in a stone room, helpless expression, books on a shelf', text: '' },
  { n: 11, at: '#s11', file: 'shot11', motion: 'parallaxIn', dir: 'The scale of loss: an empty village square. The number appears.', prompt: 'A silent empty medieval village square at dusk, doors open, a single dog, long shadows', text: 'Stat: 30–50% of England' },
  { n: 12, at: '#s12', file: 'shot12', motion: 'panLeft', dir: 'Fields left untended, a plough abandoned.', prompt: 'An abandoned wooden plough in an overgrown medieval field, an empty village in the background, golden dusk', text: '' },
  { n: 13, at: '#s13', file: 'shot13', motion: 'still', dir: 'Turn: a survivor looks toward the horizon, light breaking.', prompt: 'A medieval peasant standing on a hill looking at the horizon as sunlight breaks through clouds, hopeful mood', text: '' },
  { n: 14, at: '#s14', file: 'shot14', motion: 'parallax', dir: 'A farm worker bargaining with a landowner.', prompt: 'A medieval farm labourer confidently talking terms with a richly dressed landowner in a barn, coins on a table', text: 'Tag: Higher wages' },
  { n: 15, at: '#s15', file: 'shot15', motion: 'pull', dir: 'A royal clerk reads out a decree to a crowd.', prompt: 'A royal herald reading a scroll aloud to a doubtful crowd of peasants in a market square, banners behind him', text: 'Tag: 1351 · Statute of Labourers' },
  { n: 16, at: '#s16', file: 'shot16', motion: 'parallaxOut', dir: 'Closing image: a castle on a hill at sunrise over open farmland.', prompt: 'A castle on a hill at sunrise above open farmland with workers heading to the fields, warm hopeful light, wide shot', text: 'End' },
];

// Overlays drawn on top of a shot. `at` and `out` are markers that exist in script.md (out: the marker
// where it leaves; leave it out and it stays until the end of the video).
//   { type: 'tag',  text, at, out }               a date or place chip, top left
//   { type: 'stat', value, label, at, out, count } one big number (a plain number counts up; use count: false to keep text as written)
export const OVERLAYS = [
  { type: 'tag', text: 'Summer 1348 · Dorset', at: '#s2', out: '#s3' },
  { type: 'tag', text: 'June 1348 · Melcombe Regis', at: '#s5', out: '#s6' },
  { type: 'tag', text: 'Autumn 1348 · London', at: '#s8', out: '#s9' },
  { type: 'stat', value: '30–50%', label: "of England's people died by about 1350", at: '#s11', out: '#s12', count: false },
  { type: 'tag', text: 'Higher wages', at: '#s14', out: '#s15' },
  { type: 'tag', text: '1351 · Statute of Labourers', at: '#s15', out: '#s16' },
];

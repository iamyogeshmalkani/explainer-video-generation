// The shot list for the book summary (sample: Godaan by Munshi Premchand, in Hindi).
// One line per picture or clip. script.md has a [#s1], [#s2] ... marker where each shot starts;
// a shot lasts until the next marker. Finished files go in assets/ named after `file`:
// shot01.png / .jpg / .webp for a picture (it gets the camera move below),
// or shot01.mp4 / .mov / .webm for a clip (it plays as it is).
//
// motion: push | pull | panLeft | panRight | rise | still   (pictures only)

// Added to the end of every prompt so all the pictures share one look.
// (Keep text and logos out: picture models get letters wrong.)
export const STYLE = 'painterly watercolor and ink illustration, muted earthy tones, warm soft light, textured paper, rural north India in the 1930s, vertical 9:16, no text, no letters, no signs, no logos';

// The recurring person, described the same way every time (these picture models take no reference images).
const HORI = 'a thin elderly Indian peasant farmer with a grey moustache, a worn white turban and a patched white dhoti';

// Show captions of the narration (3 words at a time, the spoken word lit)? The reference has none.
export const CAPTIONS = false;

// The opening card: the author, the title, a subtitle. It stays until `out`.
export const COVER = { author: 'मुंशी प्रेमचंद', title: 'गोदान', subtitle: 'उपन्यास', out: '#s2' };

// Numbered takeaways at the end: a numeral, then a short line. Each lasts until the next marker.
// These are the video's own lessons, not quotes from the book. Say so if you write them as quotes.
export const TAKEAWAYS = [
  { numeral: '१', text: 'कर्ज़ का बोझ पूरी ज़िंदगी निगल जाता है।', at: '#t1', out: '#t2' },
  { numeral: '२', text: 'ज़मींदार और महाजन के बीच किसान पिसता है।', at: '#t2', out: '#t3' },
  { numeral: '३', text: 'आलोचक होरी की मौत को आदर्शवाद का अंत मानते हैं।', at: '#t3' },
];

export const SHOTS = [
  { n: 1, at: '#s1', file: 'shot01', motion: 'push', prompt: `${HORI} standing alone in a golden wheat field at dusk, a cow standing quietly beside him, long shadows` },
  { n: 2, at: '#s2', file: 'shot02', motion: 'pull', prompt: 'An antique cloth-bound book lying open on a wooden desk beside an inkpot and a pen, warm lamp light, a 1930s writer\'s study' },
  { n: 3, at: '#s3', file: 'shot03', motion: 'push', prompt: `Close-up portrait of ${HORI}, tired kind eyes, deep wrinkles, soft evening light` },
  { n: 4, at: '#s4', file: 'shot04', motion: 'panRight', prompt: `${HORI} standing at a neighbor's doorway gazing longingly at a healthy cow tied there, dusty village lane` },
  { n: 5, at: '#s5', file: 'shot05', motion: 'panLeft', prompt: `${HORI} proudly leading a brown cow home along a dusty village path at sunset, village children following` },
  { n: 6, at: '#s6', file: 'shot06', motion: 'push', prompt: 'A jealous man crouching in the dark corner of a village cowshed by moonlight, a cow sleeping nearby, shadowy and tense' },
  { n: 7, at: '#s7', file: 'shot07', motion: 'rise', prompt: `A stern moneylender in a white dhoti sitting on a cot with a thick ledger, ${HORI} standing before him with folded hands` },
  { n: 8, at: '#s8', file: 'shot08', motion: 'pull', prompt: 'A young village man with a small bundle walking along a railway track toward a smoky city skyline at dawn' },
  { n: 9, at: '#s9', file: 'shot09', motion: 'push', prompt: `A village council of elders sitting in a circle under a banyan tree, ${HORI} standing with his head bowed` },
  { n: 15, at: '#s10', file: 'shot15', motion: 'push', prompt: 'An official in a long coat reading a paper at the edge of a small dry field while a worried farming family watches, a flag stuck in the soil, heavy afternoon light' },
  { n: 10, at: '#s10b', file: 'shot10', motion: 'panRight', prompt: 'A poor village wedding, a young bride in a red sari with her head lowered beneath a simple canopy, sparse decorations, worried parents' },
  { n: 11, at: '#s11', file: 'shot11', motion: 'push', prompt: `${HORI} working his dry field under a scorching sun, sweat on his face, a plough and two thin oxen` },
  { n: 12, at: '#s12', file: 'shot12', motion: 'pull', prompt: `${HORI} lying exhausted under a neem tree at dusk, his wife sitting beside him in a faded sari, quiet and sad` },
  { n: 13, at: '#s13', file: 'shot13', motion: 'rise', prompt: 'A wide view of many Indian farmers working in vast fields under a heavy grey sky, a single small cow in the distance' },
  { n: 14, at: '#t1', file: 'shot14', motion: 'pull', prompt: 'A quiet village evening, a cow standing in a mud doorway lit by a small oil lamp, deep blue dusk, peaceful and still' },
];

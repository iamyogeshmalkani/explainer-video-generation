// The shot list for the book summary: Deep Work by Cal Newport.
// One line per picture. script.md has a [#s1], [#s2] ... marker where each shot starts;
// a shot lasts until the next marker. Finished files go in assets/ named after `file`.
//
// motion: push | pull | panLeft | panRight | rise | still   (pictures only)

// Added to the end of every prompt so all the pictures share one look.
export const STYLE = 'cinematic digital painting, muted deep blues and warm amber light, soft film grain, quiet and calm mood, vertical 9:16, no text, no letters, no signs, no logos';

// Captions on: three words at a time, the spoken word lit. They stop where the takeaways start.
export const CAPTIONS = true;

// The opening card: the author, the title, a subtitle. It stays until `out`.
// y: 0.16 moves the card up so the subtitles underneath stay clear of it.
export const COVER = { author: 'Cal Newport', title: 'Deep\nWork', subtitle: 'Rules for focused success', out: 3.0, y: 0.16 };

// Numbered takeaways at the end. These are the video's own lessons, not quotes from the book.
export const TAKEAWAYS = [
  { numeral: 'I', text: 'Focus is a skill you train.', at: '#t1', out: '#t2' },
  { numeral: 'II', text: 'Guard a few deep hours daily.', at: '#t2', out: '#t3' },
  { numeral: 'III', text: 'Boredom is part of the training.', at: '#t3' },
];

export const SHOTS = [
  { n: 1, at: '#s1', file: 'shot01', motion: 'push', prompt: 'A man seen from behind sitting alone at a wooden desk inside a lakeside cabin, a tall stack of paper beside him, a large window showing a misty lake at dawn, no phone, no screens' },
  { n: 2, at: '#s2', file: 'shot02', motion: 'pull', prompt: 'A plain dark blue hardcover book with a blank cover lying closed on a tidy wooden desk beside a cup of coffee, soft morning light from a window' },
  { n: 3, at: '#s3', file: 'shot03', motion: 'push', prompt: 'A person seen from behind at a desk in a dark quiet room, one desk lamp lighting a single open notebook, everything else in shadow' },
  { n: 4, at: '#s4', file: 'shot04', motion: 'rise', prompt: 'A tall office tower at night with every window dark except one warmly lit window, city lights far below, deep blue sky' },
  { n: 5, at: '#s5', file: 'shot05', motion: 'push', prompt: 'A hand reaching for a smartphone whose bright blank screen glows in a dark room, the glow lighting the fingers, a closed notebook pushed aside, no writing anywhere' },
  { n: 6, at: '#s6', file: 'shot06', motion: 'panRight', prompt: 'Four flat stepping stones in a row across still dark water leading toward a small lit doorway in the mist, early morning' },
  { n: 7, at: '#s7', file: 'shot07', motion: 'push', prompt: 'An old round stone tower standing on the shore of a calm alpine lake at dusk, one warm lit window, mountains behind, reflection in the water' },
  { n: 8, at: '#s8', file: 'shot08', motion: 'panLeft', prompt: 'A person standing in a queue at a bus stop in light rain, hands in coat pockets, looking up at the sky, while the others in the line stare down at their phones' },
  { n: 9, at: '#s9', file: 'shot09', motion: 'pull', prompt: 'A smartphone placed face down on a wooden windowsill, a bright green garden outside the open window, sunny morning' },
  { n: 10, at: '#s10', file: 'shot10', motion: 'rise', prompt: 'A single glass hourglass standing on a clean tidy desk, sand running, warm morning light, a closed notebook and a pencil beside it' },
  { n: 11, at: '#s11', file: 'shot11', motion: 'pull', prompt: 'A man seen from behind walking out of a lakeside cabin at sunrise carrying a folder of papers under his arm, mist lifting off the water, bright sky' },
  { n: 12, at: '#t1', file: 'shot12', motion: 'push', prompt: 'A quiet study at night, a desk lamp glowing over an open notebook, rain on the dark window, a calm empty chair' },
];

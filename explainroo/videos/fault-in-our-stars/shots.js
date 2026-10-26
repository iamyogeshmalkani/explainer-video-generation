// The shot list for the book summary of The Fault in Our Stars (John Green, 2012), in English.
// One line per picture or clip. script.md has a [#s1], [#s2] ... marker where each shot starts;
// a shot lasts until the next marker. Finished files go in assets/ named after `file`.
//
// motion: push | pull | panLeft | panRight | rise | still   (pictures only)

// Added to the end of every prompt so all the pictures share one look.
// (Keep text and logos out: picture models get letters wrong.)
// The characters are teenagers, so the pictures show objects, hands and distant silhouettes, not close faces or romance.
export const STYLE = 'soft watercolor and ink illustration, gentle pastel palette with warm sunset tones, delicate paper texture, contemporary American teenage story, vertical 9:16, no text, no letters, no signs, no logos';

// Show captions of the narration (3 words at a time, the spoken word lit)? Yes: this video has subtitles.
export const CAPTIONS = true;

// The opening card: the author, the title, a subtitle. It stays until `out`.
export const COVER = { author: 'John Green', title: 'The Fault in\nOur Stars', subtitle: 'A novel, 2012', y: 0.2, out: 3.4 };

// Numbered takeaways at the end: a numeral, then a short line. Each lasts until the next marker.
// These are the video's own lessons, not quotes from the book.
export const TAKEAWAYS = [
  { numeral: 'I', text: 'Love can be real, even when time is short.', at: '#t1', out: '#t2' },
  { numeral: 'II', text: 'Hurt is unavoidable, but we choose who we let hurt us.', at: '#t2', out: '#t3' },
  { numeral: 'III', text: 'Hazel ends the book happy with her choice.', at: '#t3' },
];

export const SHOTS = [
  { n: 1, at: '#s1', file: 'shot01', motion: 'push', prompt: 'A young girl seen from behind sitting on a park bench at sunset, a small portable oxygen tank beside her, falling autumn leaves, warm golden light' },
  { n: 2, at: '#s1b', file: 'shot02', motion: 'pull', prompt: 'A hardcover novel with a plain blue cover on a bedside table beside a small lamp and a glass of water, soft morning light' },
  { n: 3, at: '#s2', file: 'shot03', motion: 'panRight', prompt: 'A teenage girl seen from behind pulling a small oxygen tank cart along a long quiet hospital corridor, pale green walls, soft light' },
  { n: 4, at: '#s3', file: 'shot04', motion: 'push', prompt: 'A circle of folding chairs in a church basement for a support group, a plate of cookies and paper cups, soft window light, a few empty chairs' },
  { n: 5, at: '#s4', file: 'shot05', motion: 'panLeft', prompt: 'A tall teenage boy seen from the side as a silhouette leaning on a hallway railing in warm afternoon light, hands in his jacket pockets' },
  { n: 6, at: '#s5', file: 'shot06', motion: 'push', prompt: 'Two paperback novels being exchanged between two hands over a small table, warm light, shallow depth of field' },
  { n: 7, at: '#s6', file: 'shot07', motion: 'pull', prompt: 'An open book whose last pages fade into blank white paper, a reading lamp, dim room, a sense of an unfinished story' },
  { n: 8, at: '#s7', file: 'shot08', motion: 'rise', prompt: 'Amsterdam canal houses with bicycles along a canal at golden hour, reflections in the water, a few small figures walking' },
  { n: 9, at: '#s8', file: 'shot09', motion: 'push', prompt: 'A messy dim room with an unshaven man slumped in an armchair surrounded by empty bottles and scattered papers, gloomy and bitter mood' },
  { n: 10, at: '#s9', file: 'shot10', motion: 'pull', prompt: 'A narrow brick canal house in Amsterdam at dusk beside a canal, warm lit windows, two small silhouettes standing on a bridge far away' },
  { n: 11, at: '#s10', file: 'shot11', motion: 'push', prompt: 'A hospital window with rain running down the glass, a single empty chair beside a bed, grey-blue light, quiet and heavy' },
  { n: 12, at: '#s11', file: 'shot12', motion: 'still', prompt: 'A single white candle burning on a small table beside a closed book in a dark blue room, calm and sorrowful' },
  { n: 13, at: '#s12', file: 'shot13', motion: 'push', prompt: 'A handwritten letter on lined paper held in two hands under a warm lamp, loose scribbled lines instead of readable words' },
  { n: 14, at: '#s13', file: 'shot14', motion: 'pull', prompt: 'Two mismatched cups of tea on a window sill with rain outside, warm glow, tender and quiet mood' },
  { n: 15, at: '#s14', file: 'shot15', motion: 'rise', prompt: 'An old leather-bound book of plays beside a quill and an inkwell on a desk, a night sky full of stars seen through the window' },
  { n: 16, at: '#s15', file: 'shot16', motion: 'pull', prompt: 'A wide night sky full of stars over a quiet suburban rooftop, one warm lit window, deep blue and violet, calm and hopeful' },
];

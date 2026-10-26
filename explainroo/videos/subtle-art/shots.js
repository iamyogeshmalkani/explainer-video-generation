// Shot list for the book summary. One line per picture; script.md has a [#s1], [#s2] ... marker where each
// shot starts, and a shot lasts until the next marker. Finished files go in assets/ named after `file`.
// motion: push | pull | panLeft | panRight | rise | still
export const STYLE = "bold flat editorial illustration with thick dark outlines, warm orange and charcoal palette on a cream background, playful and slightly sarcastic mood, vertical 9:16, no text, no letters, no signs, no logos";

// Subtitles: three words at a time, the spoken word lit.
export const CAPTIONS = true;

export const COVER = { author: 'Mark Manson', title: 'The Subtle Art of\nNot Giving a F*ck', subtitle: 'A counterintuitive approach to living a good life', y: 0.2, out: 3.4 };

// The video's own lessons, not quotes from the book.
export const TAKEAWAYS = [
  {numeral: 'I', text: 'Choose carefully what you care about.', at: '#t1', out: '#t2'},
  {numeral: 'II', text: 'Struggle is part of a meaningful life.', at: '#t2', out: '#t3'},
  {numeral: 'III', text: 'Pick values you can control, not ones you cannot.', at: '#t3'},
];

export const SHOTS = [
  { n: 1, at: '#s1', file: 'shot01', motion: 'push', prompt: "A calm cheerful stick-figure person shrugging with open hands and a relaxed smile beside a tidy desk with a notebook" },
  { n: 13, at: '#s1b', file: 'shot13', motion: 'panLeft', prompt: "An open notebook, a pen and a coffee cup on a wooden desk in morning light, a small potted plant, calm and orderly" },
  { n: 2, at: '#s2', file: 'shot02', motion: 'pull', prompt: "A winding path splitting into two, one crooked and one straight, with a signpost made only of blank arrows" },
  { n: 3, at: '#s3', file: 'shot03', motion: 'panRight', prompt: "A person peeling a yellow smiley sticker off a plain bare wall while crumpled paper balls pile up on the floor, no posters, no writing" },
  { n: 4, at: '#s4', file: 'shot04', motion: 'rise', prompt: "A person running after a giant yellow smiley balloon that keeps floating away over rooftops, tired but determined" },
  { n: 5, at: '#s5', file: 'shot05', motion: 'push', prompt: "A hiker climbing a steep rocky mountain trail with a heavy backpack, a small flag waiting at the top, determined" },
  { n: 14, at: '#s6', file: 'shot14', motion: 'push', prompt: "A person standing in front of a long wall of many different doors, reaching for just one of them, thoughtful" },
  { n: 6, at: '#s6b', file: 'shot06', motion: 'pull', prompt: "Close-up of two open hands palms up with three glowing orbs floating above them, each with a simple icon: a heart, a clock and a handshake, no face in the picture" },
  { n: 7, at: '#s7', file: 'shot07', motion: 'panLeft', prompt: "A person waving on a flimsy cracking wooden platform above a crowd of tiny silhouettes, applause marks around, wobbly" },
  { n: 8, at: '#s8', file: 'shot08', motion: 'push', prompt: "Nine stepping stones across a stream, each carved with a simple icon, a person hopping from stone to stone" },
  { n: 9, at: '#s9', file: 'shot09', motion: 'rise', prompt: "A very tall tower of identical orange books rising up through the clouds, tiny people looking up" },
  { n: 10, at: '#s10', file: 'shot10', motion: 'push', prompt: "A bespectacled critic holding a magnifying glass over a tiny book and giving a thumbs up" },
  { n: 11, at: '#s11', file: 'shot11', motion: 'pull', prompt: "A book wearing sunglasses with a small speech bubble full of stars and swirls instead of words, cheeky" },
  { n: 12, at: '#t1', file: 'shot12', motion: 'pull', prompt: "A calm person sitting cross-legged on a hilltop at sunset with a notebook, a few tiny clouds, peaceful" },
];

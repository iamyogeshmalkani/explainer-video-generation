// Shot list for the book summary. One line per picture; script.md has a [#s1], [#s2] ... marker where each
// shot starts, and a shot lasts until the next marker. Finished files go in assets/ named after `file`.
// motion: push | pull | panLeft | panRight | rise | still
export const STYLE = "soft muted watercolor and ink illustration, calm pastel palette of blues, soft oranges and greys, gentle paper texture, quiet and thoughtful mood, vertical 9:16, no text, no letters, no signs, no logos";

// Subtitles: three words at a time, the spoken word lit.
export const CAPTIONS = true;

export const COVER = { author: 'Bessel van der Kolk', title: 'The Body Keeps\nthe Score', subtitle: 'Brain, Mind, and Body in the Healing of Trauma', y: 0.2, out: 3.4 };

// The video's own lessons, not quotes from the book.
export const TAKEAWAYS = [
  {numeral: 'I', text: 'Van der Kolk argues that trauma marks the body as well as the mind.', at: '#t1', out: '#t2'},
  {numeral: 'II', text: 'He points to safe relationships, EMDR and yoga as ways to heal.', at: '#t2', out: '#t3'},
  {numeral: 'III', text: 'Critics say the science is shaky, so seek qualified help.', at: '#t3'},
];

export const SHOTS = [
  { n: 1, at: '#s1', file: 'shot01', motion: 'push', prompt: "A calm figure seen from behind sitting on a quiet shoreline at dawn, soft mist over the water, gentle light" },
  { n: 2, at: '#s2', file: 'shot02', motion: 'pull', prompt: "Abstract watercolor of a human silhouette with swirling blue and orange colors inside the head and chest, soft and gentle" },
  { n: 3, at: '#s3', file: 'shot03', motion: 'push', prompt: "Two hands clasped tightly together with pale knuckles resting on a wooden table, soft window light, quiet and tense" },
  { n: 4, at: '#s4', file: 'shot04', motion: 'panRight', prompt: "An old typewriter and a stack of printed journal pages on a desk by a window, warm lamp light, a cup of coffee" },
  { n: 5, at: '#s5', file: 'shot05', motion: 'rise', prompt: "Two adults sitting close on a sofa, one gently comforting the other, seen from behind, warm lamp light" },
  { n: 6, at: '#s6', file: 'shot06', motion: 'push', prompt: "A person wearing a long-sleeve top and leggings in a seated yoga pose on a mat at sunrise beside a large window, seen from behind, peaceful morning light" },
  { n: 7, at: '#s7', file: 'shot07', motion: 'pull', prompt: "A bookstore table with a tall stack of identical books and a small crowd of readers browsing, warm light" },
  { n: 8, at: '#s8', file: 'shot08', motion: 'panLeft', prompt: "A long wall of tiny weekly calendar pages stretching into the distance, soft muted colors, a sense of years passing" },
  { n: 9, at: '#s9', file: 'shot09', motion: 'push', prompt: "Researchers in a quiet laboratory looking skeptically at brain scan images on a monitor, cool blue light" },
  { n: 10, at: '#s10', file: 'shot10', motion: 'pull', prompt: "A magnifying glass over a page of dense text with a pen resting beside it, red marks in the margin, desk lamp" },
  { n: 14, at: '#s11', file: 'shot14', motion: 'panRight', prompt: "A long table covered with stacks of research papers with small colored tabs, a researcher in a lab coat checking pages one by one, cool light" },
  { n: 11, at: '#s11b', file: 'shot11', motion: 'push', prompt: "A glowing brain scan image on a screen next to a notebook with graphs, a hand holding a pencil, dim office" },
  { n: 12, at: '#s12', file: 'shot12', motion: 'rise', prompt: "A calm therapist office with two armchairs, a small table with tea and a notepad, soft afternoon light" },
  { n: 13, at: '#t1', file: 'shot13', motion: 'pull', prompt: "A person walking alone along a quiet path through a misty forest toward a warm light in the distance, hopeful and calm" },
];

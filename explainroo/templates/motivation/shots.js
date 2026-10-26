// The shot list for the motivation video (sample: Marcus Aurelius, Meditations 5.1, George Long's translation).
// script.md has [#q1] [#q2] [#q3] where each quote card starts and [#s1] [#s2] ... where each painting starts;
// a painting lasts until the next marker. Finished files go in assets/ named after `file`
// (shot01.png / .jpg / .webp). Until a file exists, its shot shows a placeholder with the prompt.

// The paintings are landscape (3:2), shown in a band across the middle of the screen.
export const ASPECT = '3:2';

// Added to the end of every prompt so all the paintings share one look. Keep text and logos out.
export const STYLE = 'classical oil painting in the style of 19th century academic realism, dramatic chiaroscuro lighting, rich warm earth tones with deep reds, visible brush strokes, museum quality, horizontal 3:2, no text, no letters, no logos';

// The opening quote, as kinetic cards. Lowercase words are small, CAPITAL words are big and get their own line;
// add !red, !gold or !white to a token to color it (and make it bigger). Each card lasts until `out`.
export const CARDS = [
  { tokens: ['In', 'the', 'MORNING', 'when', 'thou', 'risest', 'UNWILLINGLY!red'], at: '#q1', out: '#q2' },
  { tokens: ['let', 'this', 'THOUGHT', 'be', 'PRESENT'], at: '#q2', out: '#q3' },
  { tokens: ['I', 'am', 'rising', 'to', 'the', 'WORK!gold', 'of', 'a', 'HUMAN', 'BEING'], at: '#q3', out: '#s1' },
];

// The narration appears one word at a time from here on (it is also read aloud over the quote cards, unshown).
export const CAPTIONS_FROM = '#s1';

// motion is not used: the band always pushes in slowly. `n` and `prompt` are for the placeholder and the picture script.
export const SHOTS = [
  { n: 1, at: '#s1', file: 'shot01', prompt: 'A Roman emperor in a plain tunic and a purple cloak seated at a desk in a lamp-lit campaign tent, writing on a scroll, thoughtful, red drapes' },
  { n: 2, at: '#s2', file: 'shot02', prompt: 'A bearded Roman philosopher in a toga standing in a marble colonnade at dawn with one hand on his chin, thoughtful' },
  { n: 3, at: '#s3', file: 'shot03', prompt: 'An ancient wax tablet and a bronze stylus on a wooden desk beside a burning oil lamp, warm candlelight' },
  { n: 4, at: '#s4', file: 'shot04', prompt: 'A stack of old leather-bound codices and scrolls on a table in a candlelit study, dust in the air' },
  { n: 5, at: '#s5', file: 'shot05', prompt: 'A man sitting on the edge of a simple bed in a stone room at dawn, light through a small window, pulling on his sandals' },
  { n: 6, at: '#s6', file: 'shot06', prompt: 'Roman farmers and craftsmen working in a sunlit field and workshop, strong and dignified' },
  { n: 7, at: '#s7', file: 'shot07', prompt: 'A warm unmade bed with rumpled sheets in a dim Roman bedchamber, soft morning light through heavy curtains' },
  { n: 8, at: '#s8', file: 'shot08', prompt: 'A Roman figure striding out of a stone archway into bright dawn light, cloak flowing, determined' },
];

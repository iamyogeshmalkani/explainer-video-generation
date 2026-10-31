// The shot list for the Documentary Mini Founder Reel (sample: Steve Jobs). One line per cut.
// script.md has a [#s1], [#s2] ... marker where each shot starts; a shot lasts until the next marker.
//
//   node scripts/find-photos.mjs <project>   finds an openly licensed photo for each shot that has a `query`
//                                            (Wikimedia Commons) and saves it as assets/<file>.jpg
//   Better still: drop your own footage in assets/ as <file>.mp4 (interview, archive, B-roll). It plays as it is.
//
// n / at / file / query / alt / avoid / motion / focus work as in founder-story. New here:
// kind:    'full' (default) | 'wide' (landscape kept whole on black) | 'card' | 'triptych' | 'paper'. See lib/reel.js.
// bg:      card background: 'white' | 'black' | 'red'
// ink:     caption colour: 'auto' | 'red' | 'black' | 'white'
// caps:    true = this shot's caption in bold CAPITALS
// headline: (card) a big line of its own: a date, a name, one word. Leave it out and the caption carries the card.
// note:    (paper) a short line on a red highlight strip under the picture
// files:   (triptych) ['a', 'b', 'c'] three pictures stacked; each is its own file in assets/
// sfx:     one quiet sound at the cut: 'click' (shutter), 'type', 'thud', 'tick'. Only when it fits the picture.
//
// PACE: hard cuts. Info-heavy lines: a shot every 2 to 3 seconds. Explanations: 3 to 4. The turning point and the last
// line breathe: 5 to 6 (a card or a long push). A still may stay at most 6 seconds on screen.
// RULE: a picture must show what the line says. No free photo of that moment? Show an object, a place or a document
// from the story, or a type card. Never a later photo of a person passed off as the moment. Never invented documents.

export const SHOTS = [
  { n: 1, at: '#s1', file: 'shot01', query: 'Steve Jobs and Macintosh computer, January 1984', motion: 'push', focus: [0.5, 0.35] },
  { n: 2, at: '#s2', file: 'shot02', query: 'Apple Computer Mariani Avenue Cupertino headquarters', motion: 'push' },
  { n: 3, at: '#s3', file: 'shot03', query: 'Steve Jobs and Steve Wozniak 1976', motion: 'push', alt: ['Steve Wozniak and Steve Jobs Apple'], avoid: ['internet', 'layers'], focus: [0.5, 0.35] },
  { n: 4, at: '#s4', file: 'shot04', query: 'Steve Wozniak by Gage Skidmore', motion: 'push', focus: [0.5, 0.33], caps: true },
  { n: 5, at: '#s5', file: 'shot05', query: 'Jobs family home garage Los Altos Crist Drive', motion: 'pull' },
  { n: 6, at: '#s6', file: 'shot06', kind: 'wide', query: 'Apple Computer 1 (Apple I) Smithsonian', motion: 'push' },
  { n: 7, at: '#s7', file: 'shot07', query: 'Byte Shop Mountain View Paul Terrell', motion: 'pull', alt: ['Homebrew Computer Club'], avoid: ['northwest'], sfx: 'click' },
  { n: 8, at: '#s8', file: 'shot08', kind: 'wide', query: 'Macintosh 128k computer January 1984 Bernard Gotfryd', motion: 'pull' },
  { n: 9, at: '#s9', kind: 'card', bg: 'white', headline: '1985', ink: 'red' },
  { n: 10, at: '#s10', file: 'shot10', query: 'John Sculley President of PepsiCo Gotfryd', motion: 'push', focus: [0.5, 0.3], caps: true },
  { n: 11, at: '#s11', file: 'shot11', query: 'John Sculley and Steve Jobs 1984', motion: 'push', focus: [0.5, 0.35] },
  { n: 12, at: '#s12', file: 'shot12', query: 'Apple Computer Bandley Drive Cupertino building', motion: 'pull' },
  { n: 13, at: '#s13', file: 'shot13', query: 'Steve Jobs 1985 portrait', motion: 'pull', focus: [0.5, 0.35] },
  { n: 14, at: '#s14', file: 'shot14', kind: 'wide', query: 'NeXTcube computer 1990 Computer History Museum', motion: 'push' },
  { n: 15, at: '#s15', file: 'shot15', query: 'Pixar Animation Studios Atrium', motion: 'push' },
  { n: 16, at: '#s16', file: 'shot16', query: 'Pixar Emeryville campus aerial', motion: 'pull', caps: true },
  { n: 17, at: '#s17', file: 'shot17', query: 'John Lasseter Buzz Lightyear', motion: 'pull', focus: [0.5, 0.5] },
  { n: 18, at: '#s18', file: 'shot18', kind: 'wide', query: 'Buzz Lightyear and Woody toys', motion: 'push' },
  { n: 19, at: '#s19', kind: 'card', bg: 'black' },
  { n: 20, at: '#s20', file: 'shot20', query: 'Apple Infinite Loop aerial Cupertino', motion: 'pull' },
  { n: 21, at: '#s21', file: 'shot21', query: 'Infinite Loop 1 Michael Fonfara', motion: 'still', alt: ['Apple Headquarters in Cupertino'], focus: [0.4, 0.5] },
  { n: 22, at: '#s22', file: 'shot22', kind: 'wide', query: 'NeXTSTEP desktop screenshot', motion: 'push' },
  { n: 23, at: '#s23', file: 'shot23', kind: 'wide', query: 'IMac G3', motion: 'push' },
  { n: 24, at: '#s24', file: 'shot24', kind: 'wide', query: 'IPod 1Gen', motion: 'push' },
  { n: 25, at: '#s25', file: 'shot25', query: 'First iPhone Macworld 2007', motion: 'push' },
  { n: 26, at: '#s26', file: 'shot26', query: 'Steve Jobs Headshot 2010', motion: 'pull', focus: [0.5, 0.35] },
  { n: 27, at: '#s27', kind: 'card', bg: 'white', ink: 'red' },
  { n: 28, at: '#s28', kind: 'card', bg: 'red', ink: 'white' },
];

// One big number in italic serif over dimmed footage: { at, out, value, unit, color }
export const STATS = [
  { at: '#s21', out: '#s22', value: '$429', unit: 'million' },
];

// Words that get a different treatment in the caption (matched without punctuation, any case).
//   serif: italic serif (a quiet aside, a place, a "that is where")  | red: red (the number or word the whole story turns on)
//   caps:  bold capitals (a name, a verdict)
export const EMPHASIS = {
  serif: ['earlier', 'meanwhile', 'then'],
  red: ['429', 'fired'],
  caps: ['pixar', 'neXT'],
};

// The shot list for the founder-story template (sample: Steve Jobs). One line per photograph.
// script.md has a [#s1], [#s2] ... marker where each shot starts; a shot lasts until the next marker.
//
//   node scripts/find-photos.mjs <project>      finds an openly licensed photo for each `query` on Wikimedia Commons
//                                               and saves it as assets/<file>.jpg (the credits are written for you)
//
// n:      the shot number (find-photos --only 3, --pick 3=2)
// at:     the marker where the shot starts
// file:   the name in assets/ (shot01.jpg). A short clip (shot01.mp4) works too; it plays as it is.
// query:  what to search for on Commons: the NAME of the person, place or object plus a few facts ("Apple I computer").
//         `alt` is a list of other searches to try if the first finds nothing.
// motion: push | pull | panLeft | panRight | rise | still   (slow: the picture never moves more than about 9%)
// focus:  [x, y] from 0 to 1: where the face or subject is in the photo. A landscape photo is cropped around it.
// fit:    'cover' (default, fills the frame) | 'fit' (the whole photo on a blurred copy of itself: wide group shots, objects)
// sweep:  'right' | 'left': a very wide photo (a panorama) pans slowly across the frame
// avoid:  words that mark the wrong picture ('Bing Gordon'): candidates with them in the title or description are skipped
//
// RULE: a photograph stays on screen 4 seconds at most (photos() in lib/story.js stops with a list of the shots that run
// longer), so put a [#marker] and a shot about every 8 spoken words (this voice says about 2 words a second).
// RULE: a photo must show what the line says. If no free photo of that moment exists, show an object, a place or a
// document from the story, or the person at another time with the year on a plate. Never pass a later photo of a
// person off as the moment itself.

export const HOOK = { text: 'At thirty, he was fired from the company he started', out: '#s3' };

export const SHOTS = [
  { n: 1, at: '#s1', file: 'shot01', query: 'Steve Jobs and Macintosh computer, January 1984', motion: 'push', focus: [0.5, 0.35] },
  { n: 2, at: '#s2', file: 'shot02', query: 'Apple II computer 1977 Computer History Museum', motion: 'panRight', fit: 'fit' },
  { n: 3, at: '#s3', file: 'shot03', query: 'Steve Jobs and Steve Wozniak 1976', motion: 'push', alt: ['Steve Wozniak and Steve Jobs Apple'], focus: [0.5, 0.35] },
  { n: 4, at: '#s4', file: 'shot04', query: 'Steve Wozniak by Gage Skidmore', motion: 'push', focus: [0.5, 0.33] },
  { n: 5, at: '#s5', file: 'shot05', query: 'Jobs family home garage Los Altos Crist Drive', motion: 'pull' },
  { n: 6, at: '#s6', file: 'shot06', query: 'Apple Computer 1 (Apple I) Smithsonian', motion: 'panRight', fit: 'fit' },
  { n: 7, at: '#s7', file: 'shot07', query: 'Byte Shop Mountain View Paul Terrell', motion: 'pull', alt: ['Homebrew Computer Club'] },
  { n: 8, at: '#s8', file: 'shot08', query: 'Macintosh 128k computer January 1984 Bernard Gotfryd', motion: 'pull', fit: 'fit' },
  { n: 9, at: '#s9', file: 'shot09', query: 'Apple Computer Bandley Drive Cupertino building', motion: 'pull' },
  { n: 10, at: '#s10', file: 'shot10', query: 'John Sculley President of PepsiCo Gotfryd', motion: 'push', focus: [0.5, 0.3] },
  { n: 11, at: '#s11', file: 'shot11', query: 'John Sculley and Steve Jobs 1984', motion: 'push', focus: [0.5, 0.35] },
  { n: 12, at: '#s12', file: 'shot12', query: 'Apple Computer Mariani Avenue Cupertino headquarters', motion: 'push' },
  { n: 13, at: '#s13', file: 'shot13', query: 'Steve Jobs 1985 portrait', motion: 'pull', focus: [0.5, 0.35] },
  { n: 14, at: '#s14', file: 'shot14', query: 'NeXTcube computer 1990 Computer History Museum', motion: 'panLeft', fit: 'fit' },
  { n: 15, at: '#s15', file: 'shot15', query: 'Pixar Animation Studios Atrium', motion: 'push' },
  { n: 16, at: '#s16', file: 'shot16', query: 'Pixar Emeryville campus aerial', motion: 'pull' },
  { n: 17, at: '#s17', file: 'shot17', query: 'John Lasseter Buzz Lightyear', motion: 'pull', focus: [0.5, 0.5] },
  { n: 18, at: '#s18', file: 'shot18', query: 'Buzz Lightyear and Woody toys', motion: 'push', fit: 'fit' },
  { n: 19, at: '#s19', file: 'shot19', query: 'Apple Campus One Infinite Loop sign', motion: 'push' },
  { n: 20, at: '#s20', file: 'shot20', query: 'Apple Infinite Loop aerial Cupertino', motion: 'pull' },
  { n: 21, at: '#s21', file: 'shot21', query: 'Infinite Loop 1 Michael Fonfara', motion: 'still', alt: ['Apple Headquarters in Cupertino'], sweep: 'right', focus: [0.4, 0.5] },
  { n: 22, at: '#s22', file: 'shot22', query: 'NeXTSTEP desktop screenshot', motion: 'push', fit: 'fit' },
  { n: 23, at: '#s23', file: 'shot23', query: 'Apple Think Different advertisement 1997', motion: 'pull', fit: 'fit' },
  { n: 24, at: '#s24', file: 'shot24', query: 'IMac G3', motion: 'push', fit: 'fit' },
  { n: 25, at: '#s25', file: 'shot25', query: 'IPod 1Gen', motion: 'push', fit: 'fit' },
  { n: 26, at: '#s26', file: 'shot26', query: 'First iPhone Macworld 2007', motion: 'push' },
  { n: 27, at: '#s27', file: 'shot27', query: 'Steve Jobs 2007 Ben Stanfield keynote WWDC', motion: 'push', avoid: ['Bing Gordon'], focus: [0.5, 0.35] },
  { n: 28, at: '#s28', file: 'shot28', query: 'Steve Jobs Stanford commencement 2005', motion: 'pull', alt: ['Stanford Memorial Church'], focus: [0.5, 0.35] },
  { n: 29, at: '#s29', file: 'shot29', query: 'Steve Jobs Headshot 2010', motion: 'pull', focus: [0.5, 0.35] },
  { n: 30, at: '#s30', file: 'shot30', query: 'Steve Jobs memorial Apple Store 2011 tributes', motion: 'push' },
  { n: 31, at: '#s31', file: 'shot31', query: 'Apple Park Cupertino aerial', motion: 'pull' },
];

// Plates at the top left: a small gold kicker (a year, a role) over a name or a place in the serif. Keep them few.
export const LABELS = [
  { at: '#s3', out: '#s4', kicker: '1976', text: 'Apple begins' },
  { at: '#s4', out: '#s5', kicker: 'Co-founder', text: 'Steve Wozniak' },
  { at: '#s8', out: '#s9', kicker: '1984', text: 'The Macintosh' },
  { at: '#s10', out: '#s12', kicker: 'The CEO he hired', text: 'John Sculley' },
  { at: '#s14', out: '#s15', kicker: '1985', text: 'NeXT is founded' },
  { at: '#s17', out: '#s18', kicker: '1995', text: 'Toy Story' },
  { at: '#s29', kicker: '1955 to 2011', text: 'Steve Jobs' },
];

// A big number with a line under it, over the dimmed photograph.
export const STATS = [
  { at: '#s21', out: '#s22', value: '$429 million', label: 'Apple buys NeXT, December 1996' },
];

// The founder's own words, only when you have them word for word from a reliable source.
export const QUOTES = [
  { at: '#s27', out: '#s29', text: 'I didn\u2019t see it then, but it turned out that getting fired from Apple was the best thing that could\u2019ve ever happened to me.', by: 'Steve Jobs, Stanford, 2005' },
];

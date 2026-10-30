// The shot list for the man-motivation video. A short on a black screen: grids of four warm sepia portraits with a thin line
// of text on the seam, one gold line alone ("And yet"), then the last grid. Music carries it; the voice reads the same lines.
//
// script.md has a marker where each grid or center line starts ([#g1] [#g2] ... [#y] [#c]); a grid lasts until `out`.
// SHOTS is the list of photographs (all of them, in one flat list). GRIDS says which four go together.
//
//   node scripts/find-photos.mjs <project>      finds an openly licensed photo for each `query` on Wikimedia Commons
//                                               and saves it as assets/<file>.jpg (credits.md is written for you)
//
// n:      the shot number (find-photos --only 3, --pick 3=2)
// file:   the name in assets/ (shot01.jpg). You can drop in your own photo with that name; PNG and WebP work too.
// query:  what to search for on Commons: the NAME of the person or thing plus a few words ("Usain Bolt 2012 Olympics").
//         `alt` is a list of other searches to try if the first finds nothing; `avoid` lists words that mark a wrong picture.
// focus:  [x, y] from 0 to 1: where the face is in the photo (default [0.5, 0.3]); the cell is cropped around it.
//
// RULE: the grade makes any photo warm and dark, so the photos need not match in color, but each must be a clear portrait
// (face or body) at least 1000 pixels wide. Look at every one before you render.
// RULE: the line on the seam is a general truth ("The body a man can build"). It must not claim anything about a named person
// that you cannot check. Showing a person is not a statement about them; a caption that is one is.
// RULE: the last grid before the turn shows what is wasted (phone, drink, junk food): objects and scenes, not named people.

export const SHOTS = [
  // grid 1: the body
  { n: 1, file: 'shot01', query: 'Arnold Schwarzenegger', alt: ['Arnold Schwarzenegger bodybuilder'], focus: [0.5, 0.28] },
  { n: 2, file: 'shot02', query: 'Usain Bolt 2012 Olympics 100m', focus: [0.5, 0.3] },
  { n: 3, file: 'shot03', query: 'Dwayne Johnson', alt: ['Dwayne The Rock Johnson'], focus: [0.5, 0.28] },
  { n: 4, file: 'shot04', query: 'Lionel Messi 2018 World Cup', focus: [0.5, 0.28] },
  // grid 2: the wealth
  { n: 5, file: 'shot05', query: 'Jeff Bezos', alt: ['Jeff Bezos Amazon founder'], focus: [0.5, 0.3] },
  { n: 6, file: 'shot06', query: 'Mark Zuckerberg 2019 portrait', focus: [0.5, 0.3] },
  { n: 7, file: 'shot07', query: 'Elon Musk', alt: ['Elon Musk SpaceX'], focus: [0.5, 0.3] },
  { n: 8, file: 'shot08', query: 'Warren Buffett', alt: ['Warren Buffett Berkshire'], focus: [0.5, 0.3] },
  // grid 3: the mind
  { n: 9, file: 'shot09', query: 'Garry Kasparov 2007 portrait', focus: [0.5, 0.3] },
  { n: 10, file: 'shot10', query: 'Magnus Carlsen', alt: ['Magnus Carlsen chess'], focus: [0.5, 0.3] },
  { n: 11, file: 'shot11', query: 'Stephen Hawking', alt: ['Stephen Hawking NASA'], focus: [0.5, 0.3] },
  { n: 12, file: 'shot12', query: 'Muhammad Ali portrait boxer', focus: [0.5, 0.3] },
  // grid 4: what is chosen instead (objects and scenes)
  { n: 13, file: 'shot13', query: 'person using smartphone in bed at night', focus: [0.5, 0.4] },
  { n: 14, file: 'shot14', query: 'whisky glass', alt: ['whiskey bottle', 'bar bottles glasses'], focus: [0.5, 0.5] },
  { n: 15, file: 'shot15', query: 'fast food burgers and fries tray', focus: [0.5, 0.5] },
  { n: 16, file: 'shot16', query: 'playing video games', alt: ['video game controller', 'gamer playing console'], focus: [0.5, 0.4] },
];

// at/out: markers in script.md. photos: four shot numbers (top left, top right, bottom left, bottom right).
// line: the text on the seam; add color: 'gold' to make it gold.
export const GRIDS = [
  { at: '#g1', out: '#g2', photos: [1, 2, 3, 4], line: 'The body a man can build' },
  { at: '#g2', out: '#g3', photos: [5, 6, 7, 8], line: 'The wealth a man can earn' },
  { at: '#g3', out: '#y', photos: [9, 10, 11, 12], line: 'The mind a man can master' },
  { at: '#g4', out: '#c', photos: [13, 14, 15, 16], line: 'You choose this' },
];

// A line alone on black. color: 'gold' | 'white'. The last one carries the call to action: `sub` ("Follow for more") appears under it at the marker `subAt`.
export const CENTERS = [
  { at: '#y', out: '#g4', text: 'And yet', color: 'gold' },
  { at: '#c', text: 'Choose the work', color: 'gold', sub: 'Follow for more', subAt: '#f' },
];

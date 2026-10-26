// The picture list for "What is a REST API?". One line per picture. scenes.js shows each one by its `file` name.
// Finished pictures go in assets/ named after `file` (server.jpg). The picture is cut out of its plain white
// background and given a white die-cut edge when the video is drawn, so every prompt must describe ONE object
// (STYLE already asks for the plain white background). Keep the objects colorful: a white object on the
// white background is cut away with it, so avoid white or very pale things.
//
// Make them with:  node scripts/shot-images.mjs <project-folder> --both [--only 11,12]
// then open every picture: models draw gibberish text on screens and labels. Remake any that are wrong
// (delete the file, run again with --only <n>).

// Added to the end of every prompt so the whole set shares one look.
export const STYLE = 'glossy 3D rendered icon, soft clay render style, bright vibrant colors, object fills most of the frame, centered, whole object visible, isolated on a plain pure white background, no shadow, no text, no letters, no numbers, no logos';

// Square pictures.
export const ASPECT = '1:1';

export const SHOTS = [
  // 1 to 8 came with the template and are reused as they are.
  { n: 1, file: 'phone', prompt: 'A single modern black smartphone standing upright, seen straight from the front, the whole screen glowing with a simple blue sky and a yellow sun' },
  { n: 2, file: 'server', prompt: 'A single server rack with two stacked units and small green status lights' },
  { n: 5, file: 'envelope', prompt: 'A single sealed blue envelope with a small orange paper airplane flying out of it' },
  { n: 7, file: 'package', prompt: 'A single plain brown cardboard box with nothing printed on it, its flaps open and colorful glowing cubes inside' },
  { n: 8, file: 'check', prompt: 'A single round green badge with a big white check mark' },
  { n: 9, file: 'notfound', prompt: 'A single magnifying glass over an empty open folder, with a small red question mark floating above it' },
  // New for this video.
  { n: 11, file: 'pin', prompt: 'A single glossy red map pin marker with a round head and a pointed tip, standing upright' },
  { n: 12, file: 'book', prompt: 'A single thick closed hardcover book with a dark blue cover and golden page edges, standing upright, nothing printed on it' },
];

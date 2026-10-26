// The picture list for the tech-explainer template (sample: an API call).
// One line per picture. scenes.js shows each one by its `file` name: k.pic('server', ...).
// Finished pictures go in assets/ named after `file` (server.jpg). The picture is cut out of its plain white
// background and given a white die-cut edge when the video is drawn, so every prompt must describe ONE object
// (STYLE already asks for the plain white background). Keep the objects colorful: a white object on the
// white background is cut away with it, so avoid white or very pale things.
//
// Make them with:  node scripts/shot-images.mjs <project-folder> --cloudflare   (or --pollinations, --local)
// then open every picture: models draw gibberish text on screens and labels. Remake any that are wrong
// (delete the file, run again with --only <n>).

// Added to the end of every prompt so the whole set shares one look.
export const STYLE = 'glossy 3D rendered icon, soft clay render style, bright vibrant colors, object fills most of the frame, centered, whole object visible, isolated on a plain pure white background, no shadow, no text, no letters, no numbers, no logos';

// Square pictures.
export const ASPECT = '1:1';

export const SHOTS = [
  { n: 1, file: 'phone', prompt: 'A single modern black smartphone standing upright, seen straight from the front, the whole screen glowing with a simple blue sky and a yellow sun' },
  { n: 2, file: 'server', prompt: 'A single server rack with two stacked units and small green status lights' },
  { n: 3, file: 'database', prompt: 'A single database icon made of three stacked cylinder disks in saturated blue and purple, no white parts' },
  { n: 4, file: 'menu', prompt: 'A single open restaurant menu with a dark red leather cover and cream pages with gray lines instead of words, seen from the front' },
  { n: 5, file: 'envelope', prompt: 'A single sealed blue envelope with a small orange paper airplane flying out of it' },
  { n: 6, file: 'shield', prompt: 'A single shiny blue shield with a golden padlock on the front' },
  { n: 7, file: 'package', prompt: 'A single plain brown cardboard box with nothing printed on it, its flaps open and colorful glowing cubes inside' },
  { n: 8, file: 'check', prompt: 'A single round green badge with a big white check mark' },
  { n: 9, file: 'notfound', prompt: 'A single magnifying glass over an empty open folder, with a small red question mark floating above it' },
  { n: 10, file: 'weather', prompt: 'A single weather icon: a bright orange-yellow sun partly behind a soft light-blue cloud with blue shading' },
];

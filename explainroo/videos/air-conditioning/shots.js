// The shot list for "The air conditioner that was built for paper". One line per picture or clip.
// The script (script.md) has a [#s1], [#s2] ... marker where each shot should start; a shot lasts
// until the next marker. Finished files go in assets/ named after `file`:
// shot01.png / .jpg / .webp for a picture (it gets the camera move below),
// or shot01.mp4 / .mov / .webm for a clip (it plays as it is).
//
// motion: push | pull | panLeft | panRight | rise | still   (pictures only)

// Added to the end of every prompt so all the pictures share one look.
// (Keep text and logos out: picture models get letters wrong. Draw facts with compare().)
export const STYLE = 'handcrafted claymation miniature diorama, hand-sculpted clay figures with visible fingerprints, warm cinematic lighting, shallow depth of field, rich textures, early 1900s America, vertical 9:16, no text, no letters, no signs, no logos';

// The recurring person, described the same way every time (these picture models take no reference images).
const CARRIER = 'a young clean-shaven engineer with slicked dark hair, round wire spectacles, a high white collar and a dark vest';

export const HOOK = { text: 'THE FIRST *AIR CONDITIONER* WAS NOT BUILT FOR PEOPLE.', at: 0.2, out: '#s3' };

export const SHOTS = [
  { n: 1, at: '#s1', file: 'shot01', motion: 'push', prompt: 'A brick printing plant in Brooklyn on a hot hazy summer day, tall windows open, heat shimmer above the street, a horse-drawn cart outside' },
  { n: 2, at: '#s2', file: 'shot02', motion: 'push', prompt: 'Close-up of damp, wavy, curled sheets of blank paper on a printing press table, soft overlapping washes of red, blue and yellow ink slightly out of line, ink-stained rollers, no letters, no words' },
  { n: 3, at: '#s3', file: 'shot03', motion: 'panRight', prompt: `${CARRIER} walking into a busy printing hall holding a rolled blueprint, pressmen in ink-stained aprons turning to look at him` },
  { n: 4, at: '#s4', file: 'shot04', motion: 'push', prompt: `${CARRIER} leaning over a workbench studying a glass hygrometer and two thermometers, a notebook and a warm lamp beside him` },
  { n: 5, at: '#s5', file: 'shot05', motion: 'pull', prompt: 'A glass bell jar holding a cloud of fine mist, a small round hygrometer dial beside it, warm lamp light, dark workshop background' },
  { n: 6, at: '#s6', file: 'shot06', motion: 'panLeft', prompt: 'A big coil of copper pipes with cold water running through it and a large fan blowing air across the coils, in a brick factory basement' },
  { n: 7, at: '#s7', file: 'shot07', motion: 'push', prompt: 'Close-up of beads of water condensing on cold copper pipes and dripping into a metal tray, cool blue light' },
  { n: 8, at: '#s8', file: 'shot08', motion: 'pull', prompt: `A neat stack of perfectly flat, crisp printed color pages in a calm pressroom, ${CARRIER} standing proudly beside a new machine of pipes and fans` },
  { n: 9, at: '#s9', file: 'shot09', motion: 'rise', prompt: 'A grand 1920s theater full of people in their seats looking relaxed and happy, cool blue air glowing from vents above them' },
  { n: 10, at: '#s10', file: 'shot10', motion: 'push', prompt: 'A suburban living room on a hot day with a window air conditioner humming in the wall, a family relaxed on a couch, curtains moving gently' },
  { n: 11, at: '#s11', file: 'shot11', motion: 'pull', prompt: 'A sunny Southern boomtown street with new houses, palm trees, moving trucks and cranes building, a hot orange sky' },
  { n: 12, at: '#s12', file: 'shot12', motion: 'rise', prompt: 'Aerial view of a huge sprawling desert city of new houses and highways at sunset, glowing windows, heat shimmer above the ground' },
];

// Number boards drawn on top of a shot (see compare() in lib/shots.js).
export const BOARDS = [
  { at: '#s10', out: '#s11', title: 'US homes with air conditioning', a: { label: '1980', value: '58%' }, b: { label: '2020', value: '88%' }, strike: false },
];

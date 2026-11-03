// The shot list for the myth-facts template (sample: how Hanuman got his name, from the Valmiki Ramayana).
// One line per picture or clip. script.md has a [#s1], [#s2] ... marker where each shot starts;
// a shot lasts until the next marker. Finished files go in assets/ named after `file`:
// shot01.png / .jpg / .webp for a picture (it gets the camera move below),
// or shot01.mp4 / .mov / .webm for a clip (it plays as it is).
//
// motion: push | pull | panLeft | panRight | rise | still   (pictures only)
// embers: 0 to 1, how many drifting golden sparks and how much the lamp light flickers (default 0.5)
// hit:    how strong the deep thud on the cut is (default 1; 0 for none; 1.4 and up also flashes the frame)
// fog:    0 to 1, incense smoke drifting through the frame (default 0.55)   dust: 0 to 1, floating gold motes (0.3)
// ash:    0 to 1, falling ash, for burnt or destroyed places (0)           shake: 0 to 2, hand-held camera shake (0.45; 0 for a tripod)
// depth:  0 to 2, how much the picture has depth when the camera moves (1; needs assets/<file>.depth.png for real layers)
// ease:   'inOut' (default) | 'out' (fast start, slow end) | 'linear'        flash: 0 to 1, a bright flash on the cut
//
// Myth pacing: slow pushes and rises make gods and mountains feel huge, `pull` reveals scale, `still` with shake 0 is the
// held breath before the key moment. Save hits above 1.3 for the two or three big moments (the thunderbolt, the turn).

// Added to the end of every prompt so all the pictures share one look.
// (Keep text and logos out: picture models get letters wrong.)
export const STYLE = 'Indian temple mural and classical oil painting, rich saffron, deep crimson and gold on near-black shadows, glowing lamp light, drifting incense smoke, ornate detail, dramatic mythic atmosphere, cinematic, highly detailed, vertical 9:16, no text, no letters, no writing, no logos';

export const ASPECT = '9:16';

// The recurring characters, described the same way every time (these picture models take no reference images).
// Gods are shown as respectful traditional paintings, never as cartoons or jokes.
const BOY = 'a young Hanuman as a divine monkey child with golden-orange fur, bright eyes and a small gold crown';
const INDRA = 'Indra, king of the gods, a regal four-armed figure with a gold crown, riding a white elephant, holding a glowing thunderbolt';
const VAYU = 'Vayu, the god of wind, a calm blue-skinned deity with a gold crown and flowing saffron cloth, wind swirling around him';

// The opening line near the top of the first shot; it fades at `out`.
export const HOOK = { text: 'How did Hanuman get his name?', out: '#s2' };

export const SHOTS = [
  { n: 1, at: '#s1', file: 'shot01', motion: 'push', embers: 0.5, hit: 1.4, fog: 0.5, prompt: `${BOY}, glowing in golden light against a dark sky, close portrait, reverent and powerful` },
  { n: 2, at: '#s2', file: 'shot02', motion: 'pull', embers: 0.3, hit: 1, prompt: 'A huge glowing sun over misty mountains, the sky blazing orange and gold' },
  { n: 3, at: '#s3', file: 'shot03', motion: 'push', embers: 0.4, hit: 0.8, prompt: `${BOY}, looking up wide-eyed at the glowing sun as if it were a golden fruit, seen from behind on a mountain peak` },
  { n: 4, at: '#s4', file: 'shot04', motion: 'rise', embers: 0.8, hit: 1.1, prompt: `${BOY}, leaping high into the sky toward the sun with arms stretched out, clouds below, dynamic` },
  { n: 5, at: '#s5', file: 'shot05', motion: 'pull', embers: 0.5, hit: 1, prompt: INDRA },
  { n: 6, at: '#s6', file: 'shot06', motion: 'still', embers: 0.9, hit: 1.8, flash: 0.6, shake: 1, prompt: 'A blinding golden thunderbolt streaking across a dark stormy sky, crackling lightning, dramatic' },
  { n: 7, at: '#s7', file: 'shot07', motion: 'rise', embers: 0.6, hit: 1.2, prompt: `${BOY}, falling through the clouds toward a mountain, eyes closed, trailing light` },
  { n: 8, at: '#s8', file: 'shot08', motion: 'push', embers: 0.2, hit: 0.8, shake: 0.2, prompt: 'An old palm-leaf manuscript lying beside a glowing brass lamp, ornate border, no readable writing, warm light' },
  { n: 9, at: '#s9', file: 'shot09', motion: 'push', embers: 0.4, hit: 1, prompt: VAYU },
  { n: 10, at: '#s10', file: 'shot10', motion: 'pull', embers: 0.7, hit: 1.3, fog: 0.9, prompt: 'Vayu the wind god carrying his injured golden monkey child into a dark mountain cave, wind and clouds swirling behind him' },
  { n: 11, at: '#s11', file: 'shot11', motion: 'still', embers: 0.1, hit: 0.8, shake: 0, fog: 0.7, ash: 0.3, prompt: 'A silent still village at dusk with dim lamps, people sitting motionless, a single cow lying down, heavy stillness, no wind' },
  { n: 12, at: '#s12', file: 'shot12', motion: 'push', embers: 0.5, hit: 1, prompt: 'Many gods with folded hands bowing before four-faced Brahma on a lotus, humble, golden light on their faces' },
  { n: 13, at: '#s13', file: 'shot13', motion: 'panRight', embers: 0.8, hit: 1.1, prompt: `${BOY}, waking in a cave, surrounded by gods placing glowing blessings of light into his hands` },
  { n: 14, at: '#s14', file: 'shot14', motion: 'pull', embers: 0.9, hit: 1.6, dust: 0.5, prompt: `${BOY}, grown into mighty Hanuman holding a golden mace, standing tall on a mountain peak against a huge glowing sun, heroic low angle` },
];

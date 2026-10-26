// The shot list for "The battle fought without a single bullet" (the Galwan Valley clash, 15 June 2020).
// One line per picture. script.md has a [#s1], [#s2] ... marker where each shot starts;
// a shot lasts until the next marker. Finished files go in assets/ named after `file`:
// shot01.png / .jpg / .webp for a picture (it gets the camera move below).
//
// motion: push | pull | panLeft | panRight | rise | still   (pictures only)
// embers: 0 to 1, how many drifting sparks and how much fire flicker (default 0.5; 0 for calm shots)
// hit:    how strong the thud on the cut is (default 1; 0 for none)

// Added to the end of every prompt so all the pictures share one look.
// (Keep text and logos out: picture models get letters wrong.)
export const STYLE = 'dark dramatic oil painting, thick visible brushstrokes, strong chiaroscuro, cold blue moonlight and faint orange flare light against a deep blue-black night, snow-dusted Himalayan mountains, very dark moody atmosphere, cinematic, highly detailed, vertical 9:16, no text, no letters, no signs, no logos, no flags';

export const ASPECT = '9:16';

// The recurring people, described the same way every time (these picture models take no reference images).
const INDIAN = 'modern Indian Army soldiers in olive green winter combat uniforms, helmets and thick jackets';
const CHINESE = 'modern Chinese soldiers in dark green winter camouflage uniforms and helmets';
const COLONEL = 'a resolute Indian Army colonel in his thirties with a thick dark moustache, a plain olive green winter field jacket with no epaulettes, no medals and no insignia, a dark woollen cap';

// The opening line near the top of the first shot; it fades at `out`.
export const HOOK = { text: 'A battle fought without a single bullet', out: '#s2' };

export const SHOTS = [
  { n: 1, at: '#s1', file: 'shot01', motion: 'push', embers: 0.2, hit: 1.2, prompt: 'A vast dark Himalayan valley at night, a pale river winding between steep black ridges, snow peaks under a cold moon, storm clouds, wide shot from above, no people' },
  { n: 2, at: '#s2', file: 'shot02', motion: 'panLeft', embers: 0.3, hit: 1, prompt: `Wide shot of two large groups of soldiers facing each other on a snowy mountain ridge at dusk, a crowd of ${INDIAN} on the left side and a crowd of ${CHINESE} on the right side, a narrow gap between them, tense standoff, seen from a distance so the faces are small, mist` },
  { n: 3, at: '#s3', file: 'shot03', motion: 'push', embers: 0.2, hit: 1, prompt: 'Close-up of a rack of modern military rifles locked away behind a chain inside a dark army tent, a single oil lantern glowing on a crate, nobody present, the weapons clearly untouched, cold night' },
  { n: 4, at: '#s4', file: 'shot04', motion: 'push', embers: 0.2, hit: 1, prompt: `Waist-up portrait of one of the ${INDIAN}, a well-fitting combat helmet, both bare hands raised and open in front of his chest showing empty palms, no weapon, breath steaming in the freezing air, grim face lit by moonlight, dark ridge behind` },
  { n: 5, at: '#s5', file: 'shot05', motion: 'pull', embers: 0.5, hit: 1.3, prompt: 'Extreme close-up still life filling the frame: a pile of rough grey river stones, rusted iron rods and crude wooden clubs with long nails hammered through them, lying on frozen rocky ground, lit from one side by a flickering orange flare, dark background' },
  { n: 6, at: '#s6', file: 'shot06', motion: 'push', embers: 0.3, hit: 1.1, prompt: 'An Indian Army officer seen from behind and slightly from the side, in a plain olive green winter field jacket and a dark woollen cap with no insignia, no badges and no epaulettes, standing in front of the dark silhouettes of his men lined up in the snow, faint orange flare light on one side, snow falling, his face not visible' },
  { n: 7, at: '#s7', file: 'shot07', motion: 'rise', embers: 0.6, hit: 1.4, prompt: 'A sheer black cliff edge above a rushing icy river at night, dark silhouettes of soldiers struggling on the ridge in heavy smoke, spray and mist rising from the water, no faces visible' },
  { n: 8, at: '#s8', file: 'shot08', motion: 'push', embers: 0.1, hit: 1.3, prompt: `Ground-level close-up of a long row of modern combat helmets resting upside down on the snow with small candles burning beside them, the blurred boots and legs of ${INDIAN} standing behind in a line, grey dawn, mountains in mist, mourning` },
  { n: 9, at: '#s9', file: 'shot09', motion: 'pull', embers: 0.2, hit: 0.9, prompt: `A single one of the ${CHINESE} seen from behind, standing guard alone on a snowy ridge, facing a vast empty dark valley, the moon hidden behind clouds, silence` },
  { n: 10, at: '#s10', file: 'shot10', motion: 'push', embers: 0.1, hit: 1.1, prompt: `One of the ${CHINESE} seen from behind, kneeling on one knee and placing a single white flower on the snow at grey dawn, head bowed, a lone small cairn of stones in front of him, misty mountains behind, quiet grief` },
  { n: 11, at: '#s11', file: 'shot11', motion: 'panRight', embers: 0.3, hit: 1, prompt: 'The frozen Himalayan valley at night, the faint lights of two small army camps on opposite banks of a dark river far apart, snow peaks, a cold moon, wide shot' },
  { n: 12, at: '#s12', file: 'shot12', motion: 'pull', embers: 0.4, hit: 1.2, prompt: 'Close-up of a wooden club studded with nails and a river stone lying abandoned in the snow beside a single boot print, moonlight, thin smoke drifting across, hopeless mood' },
];

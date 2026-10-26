// The shot list for the dark-history template (sample: the Battle of Nicopolis, 1396).
// One line per picture or clip. script.md has a [#s1], [#s2] ... marker where each shot starts;
// a shot lasts until the next marker. Finished files go in assets/ named after `file`:
// shot01.png / .jpg / .webp for a picture (it gets the camera move below),
// or shot01.mp4 / .mov / .webm for a clip (it plays as it is).
//
// motion: push | pull | panLeft | panRight | rise | still   (pictures only)
// embers: 0 to 1, how many drifting sparks and how much fire flicker (default 0.5; 0 for calm indoor shots)
// hit:    how strong the thud on the cut is (default 1; 0 for none)

// Added to the end of every prompt so all the pictures share one look.
// (Keep text and logos out: picture models get letters wrong.)
export const STYLE = 'dark dramatic oil painting, thick visible brushstrokes, strong chiaroscuro, glowing golden-orange firelight and smoke against a deep blue-black night, 19th century romantic history painting, cinematic, highly detailed faces, vertical 9:16, no text, no letters, no signs, no logos';

export const ASPECT = '9:16';

// The recurring people, described the same way every time (these picture models take no reference images).
const SIGISMUND = 'a stern bearded middle-aged king in a heavy brown fur-trimmed cloak with a gold chain collar over plate armor';
const SULTAN = 'a fierce bearded sultan in a red and gold embroidered silk robe and a tall jeweled turban';
const FRENCH = 'French knights in polished plate armor with blue and gold heraldic surcoats';

// The opening line near the top of the first shot; it fades at `out`.
export const HOOK = { text: 'The crusade destroyed by its own arrogance', out: '#s1c' };

export const SHOTS = [
  { n: 1, at: '#s1', file: 'shot01', motion: 'push', embers: 0.7, hit: 1.2, prompt: 'A vast army of armored knights marching east along a muddy road at dusk, tall banners with golden crosses, orange smoke and fire clouds behind them, low angle' },
  { n: 16, at: '#s1b', file: 'shot01b', motion: 'panLeft', embers: 0.7, hit: 1, prompt: 'Close low-angle view of marching armored knights in the foreground, spears and golden-cross banners above them, glowing orange smoke behind, muddy road' },
  { n: 17, at: '#s1c', file: 'shot01c', motion: 'pull', embers: 0.6, hit: 1, prompt: 'A distant enemy army camp with crescent moon banners and tents glowing in orange firelight on a river plain at dusk, smoke rising into a dark sky' },
  { n: 2, at: '#s2', file: 'shot02', motion: 'push', embers: 0.2, prompt: `${SIGISMUND}, standing in a dark war tent among his armored captains, waist-up portrait, torchlight` },
  { n: 3, at: '#s3', file: 'shot03', motion: 'push', embers: 0.3, prompt: `${SULTAN}, standing with crossed arms, lightning flashing in a stormy sky behind him, waist-up portrait` },
  { n: 4, at: '#s4', file: 'shot04', motion: 'panRight', embers: 0.4, prompt: `${SIGISMUND}, pleading with open hands before ${FRENCH}, a burning torch on a pole, dark camp at night` },
  { n: 5, at: '#s5', file: 'shot05', motion: 'push', embers: 0.3, prompt: `${FRENCH}, laughing and jeering with raised fists, arrogant faces lit by firelight` },
  { n: 6, at: '#s6', file: 'shot06', motion: 'rise', embers: 0.2, prompt: 'A proud young French knight in splendid heraldic armor standing in a tent, a shaft of golden light falling on him, smoke in the air, heroic pose' },
  { n: 7, at: '#s7', file: 'shot07', motion: 'push', embers: 0.8, hit: 1.4, prompt: `A cavalry charge of ${FRENCH} on galloping horses with lances, banners flying, dust and smoke, seen from the front` },
  { n: 8, at: '#s8', file: 'shot08', motion: 'pull', embers: 0.8, prompt: `${FRENCH} riding triumphantly with swords raised and a flag, drunk on victory, golden smoke behind them` },
  { n: 9, at: '#s9', file: 'shot09', motion: 'pull', embers: 0.7, prompt: 'A dark hillside covered with rows of sharpened wooden stakes, a lone mounted horseman silhouetted on the crest, orange sky and smoke' },
  { n: 10, at: '#s10', file: 'shot10', motion: 'panLeft', embers: 1, hit: 1.6, prompt: `A chaotic battle: ${FRENCH} on horses crashing into sharpened stakes while turbaned cavalry swarm down the hill, fire and smoke` },
  { n: 11, at: '#s11', file: 'shot11', motion: 'push', embers: 0.9, hit: 1.3, prompt: `${FRENCH} fighting back to back, surrounded by a ring of enemy soldiers, banners falling, smoke and sparks` },
  { n: 12, at: '#s12', file: 'shot12', motion: 'pull', embers: 0.8, hit: 0.8, prompt: `${SIGISMUND} and one companion in a small rowing boat on a dark wide river at night, the burning shore and black smoke behind them, mist on the water` },
  { n: 13, at: '#s13', file: 'shot13', motion: 'push', embers: 0.5, hit: 1.2, prompt: `${SULTAN}, standing on a hill with arms crossed, in front of rows of kneeling captured knights with bowed heads, guards with swords, dusk` },
  { n: 14, at: '#s14', file: 'shot14', motion: 'push', embers: 0.5, hit: 1, prompt: 'A silent battlefield at dusk covered with fallen armor and broken weapons, a torn banner with a golden cross stuck in the mud, low mist' },
  { n: 15, at: '#s15', file: 'shot15', motion: 'pull', embers: 0.6, hit: 0.7, prompt: 'The same dark battlefield at night, a torn banner in the mud and small fires burning on the ground, heavy smoke, hopeless mood' },
];

// The shot list for the Battle of the Somme (1916).
// One line per picture. script.md has a [#s1], [#s2] ... marker where each shot starts;
// a shot lasts until the next marker. Finished files go in assets/ named after `file`.
//
// motion: push | pull | panLeft | panRight | rise | still
// embers: 0 to 1, how many drifting sparks and how much fire flicker (0 for calm shots)
// hit:    how strong the thud on the cut is (default 1; 0 for none)

// Added to the end of every prompt so all the pictures share one look.
export const STYLE = 'dark dramatic oil painting, thick visible brushstrokes, strong chiaroscuro, glowing golden-orange firelight and smoke against a deep blue-black night, 19th century romantic history painting, cinematic, highly detailed faces, vertical 9:16, no text, no letters, no signs, no logos';

export const ASPECT = '9:16';

// The recurring people, described the same way every time.
const HAIG = 'a stern British general with a thick grey moustache, in a khaki First World War officer uniform with red collar tabs, medal ribbons and a peaked cap';
const TOMMIES = 'British soldiers of 1916 in khaki uniforms and round steel Brodie helmets, carrying rifles with fixed bayonets and heavy packs';
const GERMANS = 'German soldiers of 1916 in field-grey uniforms and steel helmets';

// The opening line near the top of the first shot; it fades at `out`.
export const HOOK = { text: 'Seven days of shells, and the wire still stood', out: '#s2' };

export const SHOTS = [
  { n: 1, at: '#s1', file: 'shot01', motion: 'push', embers: 0.4, hit: 1.2, prompt: 'A wide view of rolling chalk farmland in northern France at dusk, a slow river winding through flooded marshes, long lines of trenches and shell craters scarring the fields, distant flashes of gunfire under a dark sky' },
  { n: 2, at: '#s2', file: 'shot02', motion: 'panLeft', embers: 0.8, hit: 1.2, prompt: 'A long row of First World War heavy howitzers firing at night, huge muzzle flashes lighting the smoke, British gunners in khaki straining with shells, wide shot' },
  { n: 3, at: '#s2b', file: 'shot03', motion: 'push', embers: 0.6, hit: 1, prompt: 'A mountain of brass artillery shells stacked in rows in a muddy field at night, two British gunners in khaki carrying a shell between them, lit by the orange glow of distant gunfire, close view' },
  { n: 4, at: '#s3', file: 'shot04', motion: 'push', embers: 0.2, hit: 1, prompt: `${HAIG}, standing confidently with hands behind his back in a candlelit chateau headquarters room, a large map on the table, waist-up portrait` },
  { n: 5, at: '#s4', file: 'shot05', motion: 'panRight', embers: 0.3, hit: 1, prompt: `${GERMANS}, sitting on wooden bunks in a deep underground dugout cut into white chalk, wooden beams overhead, a single candle lantern, dust falling from the ceiling` },
  { n: 6, at: '#s5', file: 'shot06', motion: 'pull', embers: 0.4, hit: 1, prompt: 'Thick tangles of rusty barbed wire on wooden stakes stretching across a shell-cratered field at dawn, completely intact, orange light on the horizon, mist in the craters' },
  { n: 7, at: '#s6', file: 'shot07', motion: 'rise', embers: 1, hit: 1.6, prompt: 'A gigantic explosion throwing a whole hilltop of white chalk and earth hundreds of feet into the air, a towering column of smoke and debris, tiny soldiers watching from a trench below, wide shot' },
  { n: 8, at: '#s7', file: 'shot08', motion: 'panLeft', embers: 0.6, hit: 1.3, prompt: `${GERMANS}, running up a trench ladder and dragging a heavy machine gun into position on the parapet, urgent faces, smoke and dust in the air` },
  { n: 9, at: '#s8', file: 'shot09', motion: 'push', embers: 0.4, hit: 1.4, prompt: `A British officer in khaki standing on a trench ladder blowing a whistle, ${TOMMIES} climbing out of the trench behind him into pale morning light, waist-up, dramatic` },
  { n: 10, at: '#s9', file: 'shot10', motion: 'panRight', embers: 0.7, hit: 1.5, prompt: `A long line of ${TOMMIES} walking slowly in a row across a cratered no man's land toward a smoky ridge, seen from behind, shell bursts and dust ahead of them, wide shot` },
  { n: 11, at: '#s10', file: 'shot11', motion: 'pull', embers: 0.5, hit: 1.3, prompt: 'A silent battlefield at sunset, helmets, rifles and packs scattered across the mud among shell craters, torn barbed wire, low mist and smoke drifting over the ground, no figures' },
  { n: 12, at: '#s10b', file: 'shot12', motion: 'panLeft', embers: 0.4, hit: 1, prompt: 'Silhouettes of two stretcher bearers in khaki carrying a stretcher through mud at dusk, a long line of walking wounded with bandaged heads behind them, orange sky, smoke' },
  { n: 13, at: '#s11', file: 'shot13', motion: 'push', embers: 0.3, hit: 1.2, prompt: `${HAIG}, alone at night reading a paper report by lamplight in a chateau room, grim face, deep shadows, waist-up portrait` },
  { n: 14, at: '#s12', file: 'shot14', motion: 'pull', embers: 0.5, hit: 1.2, prompt: 'A vast landscape of mud, shattered tree stumps and water-filled craters stretching to the horizon under a dark rainy autumn sky, small fires burning, a few wooden crosses in the foreground, wide shot' },
  { n: 15, at: '#s14', file: 'shot15', motion: 'push', embers: 0.4, hit: 1, prompt: 'A single steel Brodie helmet hanging on a line of intact barbed wire at dusk, orange sky behind, a field of craters below, close view' },
];

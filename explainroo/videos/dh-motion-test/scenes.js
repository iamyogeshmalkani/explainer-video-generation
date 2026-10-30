// Dark-history template. Normally you only edit script.md and shots.js.
// scenes.js turns the shot list into the video: paintings that move, atmosphere, embers, grain, the hook line, the captions.
import { SHOTS, HOOK } from './shots.js';
import { shots, atmosphere, embers, flashes, vignette, grain, hook, captions } from './lib/epic.js';

export default {
  story(s) {
    shots(s, SHOTS);       // the paintings: eased, hand-held camera, depth, thud and punch at each cut
    atmosphere(s, SHOTS);  // mist, dust and ash drifting through the frame
    embers(s, SHOTS);      // sparks and a flickering fire glow
    flashes(s, SHOTS);     // a bright flash on the hardest cuts
    vignette(s);
    grain(s);
    if (HOOK) hook(s, HOOK.text, { ...HOOK, out: HOOK.out === undefined ? undefined : s.time(HOOK.out) });
    captions(s);
  },
};

// Dark-history template. Normally you only edit script.md and shots.js.
// scenes.js turns the shot list into the video: paintings, embers, the hook line, the captions.
import { SHOTS, HOOK } from './shots.js';
import { shots, embers, vignette, hook, captions } from './lib/epic.js';

export default {
  story(s) {
    shots(s, SHOTS);
    embers(s, SHOTS);
    vignette(s);
    if (HOOK) hook(s, HOOK.text, { ...HOOK, out: HOOK.out === undefined ? undefined : s.time(HOOK.out) });
    captions(s);
  },
};

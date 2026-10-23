// Story-shots template. Normally you only edit script.md and shots.js.
// scenes.js turns the shot list into a continuous storyboard.
import { SHOTS, HOOK, BOARDS } from './shots.js';
import { shots, vignette, hook, compare, captions } from './lib/shots.js';

export default {
  story(s) {
    shots(s, SHOTS);
    vignette(s);
    if (HOOK) hook(s, HOOK.text, { at: HOOK.at, out: HOOK.out === undefined ? undefined : s.time(HOOK.out) });
    for (const b of BOARDS) compare(s, { ...b, at: s.time(b.at), out: b.out === undefined ? undefined : s.time(b.out) });
    captions(s);
  },
};

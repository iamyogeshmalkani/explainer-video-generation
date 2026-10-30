// Illustrated-explainer template. Normally you only edit script.md and shots.js.
// scenes.js turns the shot list into the video: pictures, then the grade, the title card,
// the tags and number callouts, and the caption pill on top.
import { SHOTS, HOOK, OVERLAYS } from './shots.js';
import { shots, grade, titleCard, tag, stat, captions } from './lib/illustrated.js';

export default {
  story(s) {
    shots(s, SHOTS);
    grade(s);
    if (HOOK) titleCard(s, { ...HOOK, at: HOOK.at ?? 0.2, out: HOOK.out === undefined ? undefined : s.time(HOOK.out) });
    for (const o of OVERLAYS) {
      const when = { at: s.time(o.at), out: o.out === undefined ? undefined : s.time(o.out) };
      if (o.type === 'stat') stat(s, { ...o, ...when });
      else tag(s, { ...o, ...when });
    }
    captions(s);
  },
};

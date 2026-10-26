// dark-history-hindi template. Normally you only edit script.md and shots.js
// (or, for many videos at once, series.md and `node scripts/series.mjs`, see README.md).
// scenes.js turns the shot list into the video: paintings, embers, the hook line, the captions.
import { SHOTS, HOOK } from './shots.js';
import { shots, embers, vignette, hook, captions } from './lib/epic.js';

export default {
  story(s) {
    shots(s, SHOTS);
    embers(s, SHOTS);
    vignette(s);
    if (HOOK) hook(s, HOOK.text, { size: 0.07, ...HOOK, out: HOOK.out === undefined ? undefined : s.time(HOOK.out) });
    captions(s, { size: 0.072, maxChars: 16 });
  },
};

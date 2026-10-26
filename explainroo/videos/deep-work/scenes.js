// Book-summary template. Normally you only edit script.md and shots.js.
// scenes.js turns the shot list into the video: pictures, the cover card, the takeaways.
import { SHOTS, COVER, TAKEAWAYS, CAPTIONS } from './shots.js';
import { shots, vignette, captions } from './lib/shots.js';
import { cover, takeaway } from './lib/book.js';

export default {
  story(s) {
    shots(s, SHOTS);
    vignette(s);
    if (COVER) cover(s, { ...COVER, out: COVER.out === undefined ? undefined : s.time(COVER.out) });
    for (const t of TAKEAWAYS) takeaway(s, { ...t, at: s.time(t.at), out: t.out === undefined ? undefined : s.time(t.out) });
    // the takeaways already show the narration, so the captions stop where they start
    // y: 0.76 keeps them below the cover card's subtitle
    if (CAPTIONS) captions(s, { y: 0.76, ...(TAKEAWAYS.length ? { until: s.time(TAKEAWAYS[0].at) - 0.05 } : {}) });
  },
};

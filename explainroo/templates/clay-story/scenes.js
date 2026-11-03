// clay-story: normally you only edit script.md, shots.js (CAST, SETS, SHOTS) and video.json. This file turns the shot list into the video.
// The narration is ONE scene called "story" (the shots are cut from its words, so no markers are needed). The kit is in lib/clay.js.
import { SHOTS, LAYOUT, TITLE, CAPTIONS, CAPTIONS_FULL } from './shots.js';
import { shots, grade, barTitle, captions } from './lib/clay.js';

export default {
  story(s) {
    if (LAYOUT === 'full') {
      shots(s, SHOTS, { amount: 0.8 });                                  // full-screen pictures, gentle slow moves, hard cuts
      grade(s);                                                           // a soft vignette and a darker foot so the captions read on any picture
      captions(s, CAPTIONS_FULL);                                         // big capitals in the lower middle, the spoken word lit
      return;
    }
    // letterbox: a square picture between black bars, a title above, phrase captions below (1080 x 1920)
    const frame = { x: 0, y: Math.round(s.H * 0.2188), w: s.W, h: s.W };
    shots(s, SHOTS, { frame, amount: 0.55 });
    if (TITLE) barTitle(s, { ...TITLE, y: s.H * 0.143, size: s.W * 0.068, gap: 1.25 });
    captions(s, CAPTIONS);
  },
};

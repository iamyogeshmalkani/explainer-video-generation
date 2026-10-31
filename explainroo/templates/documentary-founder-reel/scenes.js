// Documentary Mini Founder Reel. Normally you only edit script.md and shots.js.
// scenes.js turns the shot list into the video: hard-cut pictures, a light grade, stats and word-by-word captions.
import { SHOTS, STATS, EMPHASIS } from './shots.js';
import CREDITS from './credits.js';
import { shots, grade, stats, captions, creditsCard } from './lib/reel.js';

export default {
  story(s) {
    shots(s, SHOTS);
    grade(s, SHOTS);
    stats(s, STATS);
    captions(s, SHOTS, EMPHASIS);
    creditsCard(s, CREDITS);
  },
};

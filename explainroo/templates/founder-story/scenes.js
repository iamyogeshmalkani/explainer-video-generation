// Founder-story template. Normally you only edit script.md and shots.js.
// scenes.js turns the shot list into the video: photographs, plates, stats, quotes, captions and the credits.
import { SHOTS, HOOK, LABELS, STATS, QUOTES } from './shots.js';
import CREDITS from './credits.js';
import { photos, grade, hook, labels, stats, quotes, captions, creditsCard } from './lib/story.js';

export default {
  story(s) {
    photos(s, SHOTS);
    grade(s);
    if (HOOK) hook(s, HOOK.text, { out: HOOK.out });
    labels(s, LABELS);
    stats(s, STATS);
    quotes(s, QUOTES);
    captions(s);
    creditsCard(s, CREDITS);
  },
};

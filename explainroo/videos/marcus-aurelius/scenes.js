// Motivation template. Normally you only edit script.md and shots.js.
// scenes.js turns them into the video: quote cards, the painting band, the one-word captions.
import { SHOTS, CARDS, CAPTIONS_FROM } from './shots.js';
import { band, quoteCard, wordCaptions } from './lib/motivation.js';

export default {
  story(s) {
    band(s, SHOTS, { aspect: 1.5 });
    for (const c of CARDS) quoteCard(s, c);
    wordCaptions(s, { from: CAPTIONS_FROM });
  },
};

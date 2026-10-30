// Man-motivation template. Normally you only edit script.md and shots.js.
// scenes.js turns them into the video: portrait grids with a line on the seam, and the lines alone on black.
import { SHOTS, GRIDS, CENTERS } from './shots.js';
import { grid, center } from './lib/grid.js';

export default {
  story(s) {
    grid(s, GRIDS, SHOTS);
    center(s, CENTERS);
  },
};

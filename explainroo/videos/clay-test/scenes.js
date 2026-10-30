// Clay-stopmotion template. Normally you edit script.md, shots.js and the CAST below.
// The kit is in lib/clay.js; its header lists every call.
import { SHOTS, HOOK, BOARDS } from './shots.js';
import { backdrops, grain, puppets, title, board, captions } from './lib/clay.js';

// Who is on screen, and when. x, y is where the FEET stand (fractions of the frame); w is the width.
//   enter: pop | slide | drop | rise | none     idle: breathe (default) | hop | none
//   at: a marker or seconds; delay adds seconds; out: when it leaves (leave out to stay to the end)
const CAST = [
  { file: 'yeast', at: '#s2', delay: 0.5, out: '#s5', x: 0.5, y: 0.7, w: 0.44, enter: 'pop', idle: 'hop' },
  { file: 'sugar', at: '#s3', delay: 0.9, out: '#s4', x: 0.75, y: 0.72, w: 0.26, enter: 'drop' },
  { file: 'yeast', at: '#s3', out: '#s4', x: 0.3, y: 0.7, w: 0.36, enter: 'slide', from: 'left', idle: 'hop' },
  { file: 'bubble', at: '#s4', delay: 0.7, out: '#s5', x: 0.7, y: 0.4, w: 0.2, enter: 'rise', idle: 'breathe' },
  { file: 'dough', at: '#s5', x: 0.5, y: 0.7, w: 0.55, enter: 'pop' },
  { file: 'bubble', at: '#s5', delay: 0.9, out: '#s7', x: 0.3, y: 0.46, w: 0.16, enter: 'pop' },
  { file: 'bubble', at: '#s5', delay: 1.4, out: '#s7', x: 0.72, y: 0.5, w: 0.14, enter: 'pop' },
  { file: 'loaf', at: '#s8', delay: 0.6, x: 0.5, y: 0.7, w: 0.6, enter: 'drop' },
];

export default {
  story(s) {
    backdrops(s, SHOTS);                  // 1. the full-frame clay scenes
    grain(s);                             // 2. specks and a flickering lamp
    puppets(s, CAST.map((c) => ({ ...c })));  // 3. clay characters and props
    if (HOOK) title(s, HOOK.text, { at: HOOK.at, out: HOOK.out === undefined ? undefined : s.time(HOOK.out) });
    for (const b of BOARDS) board(s, { ...b, at: s.time(b.at), out: b.out === undefined ? undefined : s.time(b.out) });
    captions(s);                          // 4. last: on top of everything
  },
};

// Clay-stopmotion template. Normally you edit script.md, shots.js and the CAST below.
// The kit is in lib/clay.js; its header lists every call.
import { SHOTS, HOOK, BOARDS } from './shots.js';
import { backdrops, grain, puppets, title, board, captions } from './lib/clay.js';

// Who is on screen, and when. x, y is where the FEET stand (fractions of the frame); w is the width.
//   enter: pop | slide | drop | rise | none     idle: breathe (default) | hop | none
//   at: a marker or seconds; delay adds seconds; out: when it leaves (leave out to stay to the end)
const CAST = [
  { file: 'baker', at: '#s3', delay: 0.2, out: '#s4', x: 0.38, y: 0.7, w: 0.42, enter: 'slide', from: 'left', idle: 'hop' },
  { file: 'flame', at: '#s3', delay: 2.4, out: '#s4', x: 0.72, y: 0.72, w: 0.2, enter: 'drop' },
  { file: 'house', at: '#s4', delay: 0.3, out: '#s5', x: 0.3, y: 0.7, w: 0.34, enter: 'pop' },
  { file: 'house', at: '#s4', delay: 0.9, out: '#s5', x: 0.7, y: 0.7, w: 0.34, enter: 'pop', flip: true },
  { file: 'flame', at: '#s6', out: '#s7', x: 0.5, y: 0.72, w: 0.5, enter: 'rise', idle: 'hop' },
  { file: 'pepys', at: '#s7', delay: 0.2, out: '#s8', x: 0.5, y: 0.72, w: 0.4, enter: 'slide', from: 'left', idle: 'breathe' },
  { file: 'duke', at: '#s8', delay: 0.2, out: '#s9', x: 0.5, y: 0.72, w: 0.42, enter: 'slide', from: 'right', idle: 'breathe' },
  { file: 'bricks', at: '#s12', delay: 0.5, x: 0.5, y: 0.72, w: 0.42, enter: 'drop' },
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

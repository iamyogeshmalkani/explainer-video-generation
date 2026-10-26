// How a hash table works. The kit is in lib/kit.js; its header lists every call.
// Keep the content in the upper two thirds: the bottom stays free for app buttons.
import { kit } from './lib/kit.js';

export default {
  story(s) {
    const k = kit(s);
    const t = (m, d = 0) => k.T(m, d);
    const o = (m) => k.T(m, -0.3); // a screen leaves just before the next idea pops in

    // A row of five array slots. `hot` is the index drawn as a solid block. Ids: `${prefix}${i}`.
    const slots = (prefix, hot, o) => {
      for (let i = 0; i < 5; i++) {
        k.tag(i === hot ? `[${i}]` : `${i}`, {
          id: `${prefix}${i}`, x: 0.1 + i * 0.2, y: o.y, w: 0.17, size: 5.5,
          at: o.at, out: o.out, sfx: i === 0 ? undefined : false,
        });
      }
    };

    // 1. The title, then a key and a value, then an example pair (s1 to s2)
    k.title('Hash', { y: 0.1, size: 18, out: o('#s3') });
    k.title('table', { y: 0.26, size: 18, out: o('#s3') });
    k.tag('[Key]', { id: 'key', x: 0.27, y: 0.5, at: '#s1', out: o('#s3') });
    k.tag('Value', { id: 'val', x: 0.73, y: 0.5, at: t('#s1', 0.5), out: o('#s3') });
    k.link('key', 'val', { at: t('#s1', 0.9), out: o('#s3') });
    k.code([{ text: '"key": "Ada"', at: '#s2' }, { text: '"value": "555-0142"', at: '#phone' }],
      { x: 0.5, y: 0.76, w: 0.92, size: 4.6, at: '#s2', out: o('#s3') });

    // 2. The hash function turns the key into a number, the number picks a slot (s3 to s4).
    //    The key and the hash function stay for the lookup in step 3.
    k.tag('"Ada"', { id: 'k2', x: 0.5, y: 0.07, caps: false, at: '#s3', out: o('#s7') });
    k.tag('Hash function', { id: 'hash2', icon: 'bolt', x: 0.5, y: 0.3, size: 7, at: t('#s3', 0.4), out: o('#s7') });
    k.link('k2', 'hash2', { at: t('#s3', 0.7), out: o('#s5') });
    k.tag('[3]', { id: 'num2', x: 0.5, y: 0.53, at: '#number', out: o('#s5') });
    k.link('hash2', 'num2', { at: t('#number', 0.2), out: o('#s5') });
    slots('a', 3, { y: 0.8, at: '#s4', out: o('#s5') });
    k.link('num2', 'a3', { at: t('#s4', 0.5), out: o('#s5') });

    // 3. A lookup takes the same path: the same key flows into the hash again (s5 to s6)
    k.link('k2', 'hash2', { at: '#s5', out: o('#s7') });
    slots('b', 3, { y: 0.55, at: t('#s5', 0.6), out: o('#s7') });
    k.link('hash2', 'b3', { at: '#s6', out: o('#s7') });
    k.tag('"555-0142"', { id: 'v3', x: 0.5, y: 0.82, caps: false, at: t('#s6', 0.9), out: o('#s7') });
    k.link('b3', 'v3', { at: t('#s6', 0.7), out: o('#s7') });

    // 4. Same time at any size (s7)
    k.tag('Same time', { icon: 'bolt', x: 0.5, y: 0.14, at: '#s7', out: o('#s8') });
    k.tag('[10] items', { x: 0.5, y: 0.4, at: '#ten', out: o('#s8') });
    k.tag('[10,000,000] items', { x: 0.5, y: 0.64, at: '#million', out: o('#s8') });

    // 5. A collision and the fix (s8 to s10)
    k.tag('"Ada"', { id: 'ka', x: 0.26, y: 0.07, caps: false, size: 7, at: '#s8', out: o('#s11') });
    k.tag('"Bob"', { id: 'kb', x: 0.74, y: 0.07, caps: false, size: 7, at: t('#s8', 0.4), out: o('#s11') });
    k.tag('Hash function', { id: 'hash5', icon: 'bolt', x: 0.5, y: 0.28, size: 7, at: t('#s8', 0.6), out: o('#s11') });
    k.link('ka', 'hash5', { at: t('#s8', 0.9), out: o('#s11') });
    k.link('kb', 'hash5', { at: t('#s8', 1.0), out: o('#s11'), sfx: false });
    slots('c', 3, { y: 0.5, at: t('#s8', 1.2), out: o('#s11') });
    k.link('hash5', 'c3', { at: t('#s8', 1.5), out: o('#s11') });
    k.tag('[Collision]', { x: 0.5, y: 0.76, at: '#s9', out: o('#s10') });
    k.code(['"Ada": "555-0142"', '"Bob": "555-0199"'],
      { id: 'list', title: 'slot 3', x: 0.5, y: 0.78, w: 0.92, size: 4.6, at: '#s10', out: o('#s11') });

    // 6. The whole path (s11 to the end)
    k.tag('[1] Key', { id: 'l1', x: 0.5, y: 0.08, at: '#s11' });
    k.tag('[2] Hash', { id: 'l2', icon: 'bolt', x: 0.5, y: 0.29, at: '#h' });
    k.tag('[3] Slot', { id: 'l3', x: 0.5, y: 0.5, at: '#sl' });
    k.tag('[4] Value', { id: 'l4', icon: 'check', x: 0.5, y: 0.71, at: '#v' });
    k.link('l1', 'l2', { at: t('#h', 0.2) });
    k.link('l2', 'l3', { at: t('#sl', 0.2) });
    k.link('l3', 'l4', { at: t('#v', 0.2) });
    k.lines(['finds things *fast*'], { y: 0.9, size: 7.5, at: '#end' });
  },
};

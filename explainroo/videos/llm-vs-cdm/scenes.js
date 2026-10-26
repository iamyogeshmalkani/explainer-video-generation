// LLM vs CDM. Built from the tech-explainer template: edit script.md and this file.
import { kit } from './lib/kit.js';

export default {
  story(s) {
    const k = kit(s);
    const t = (m, d = 0) => k.T(m, d);

    // 1. An LLM writes one token at a time (s1 to s2)
    k.title('LLM', { y: 0.1, size: 20, out: '#s3' });
    k.tag('The', { id: 'tok1', x: 0.17, y: 0.34, size: 5.2, white: true, at: t('#s1', 1.2), out: '#s3' });
    k.tag('cat', { id: 'tok2', x: 0.5, y: 0.34, size: 5.2, white: true, at: t('#s1', 2.1), out: '#s3' });
    k.tag('sat', { id: 'tok3', x: 0.83, y: 0.34, size: 5.2, white: true, at: t('#s1', 3.0), out: '#s3' });
    k.link('tok1', 'tok2', { at: t('#s1', 1.7), out: '#s3' });
    k.link('tok2', 'tok3', { at: t('#s1', 2.6), out: '#s3' });
    k.tag('Flexible', { icon: 'check', x: 0.5, y: 0.56, at: t('#s2', 0.4), out: '#s3' });
    k.tag('Slow & costly', { icon: 'bolt', x: 0.5, y: 0.72, at: t('#s2', 2.0), out: '#s3' });

    // 2. A new kind of model: the CDM (s3 to s4)
    k.title('CDM', { y: 0.1, size: 20, at: '#s3', out: '#s5' });
    k.lines(['[C]onstrained', '[D]ecoding', '[M]odel'], { y: 0.3, gap: 0.1, size: 8.5, stagger: 0.5, at: '#s4', out: '#s5' });
    k.tag('ScaleDown', { icon: 'cloud', x: 0.5, y: 0.7, at: t('#s4', 0.2), out: '#s5' });

    // 3. It reads the input once (s5)
    k.tag('Input', { id: 'in', icon: 'user', x: 0.5, y: 0.1, at: '#s5', out: '#s6' });
    k.tag('CDM', { id: 'cdm', icon: 'bolt', x: 0.5, y: 0.3, at: t('#s5', 0.8), out: '#s6' });
    k.code(['{', '  "label": "refund",', '  "confidence": 0.93', '}'],
      { id: 'out', title: 'example output', x: 0.5, y: 0.55, w: 0.9, size: 4.2, at: t('#s5', 2.2), out: '#s6' });
    k.link('in', 'cdm', { at: t('#s5', 0.5), out: '#s6' });
    k.link('cdm', 'out', { at: t('#s5', 2.0), out: '#s6' });

    // 4. Three models (s6 to s8)
    k.tag('[1] Classify', { x: 0.5, y: 0.1, at: '#classify', out: '#s9' });
    k.tag('[2] Extract', { x: 0.5, y: 0.34, at: '#extract', out: '#s9' });
    k.tag('[3] Summarize', { x: 0.5, y: 0.58, at: '#summarize', out: '#s9' });
    k.lines(['picks from your labels'], { y: 0.2, size: 5, at: '#s7', out: '#s9' });
    k.lines(['returns clean JSON'], { y: 0.44, size: 5, at: '#s8', out: '#s9' });

    // 5. The vendor's numbers (s9)
    k.tag('says ScaleDown', { icon: 'cloud', x: 0.5, y: 0.14, size: 6, at: '#s9', out: '#s10' });
    k.tag('[200x] faster', { x: 0.5, y: 0.36, size: 9, at: t('#s9', 1.0), out: '#s10' });
    k.tag('[467x] cheaper', { x: 0.5, y: 0.58, size: 9, at: t('#s9', 2.4), out: '#s10' });

    // 6. Caveats: their own numbers, and critics (s10 to s11)
    k.tag('Their own numbers', { icon: 'cloud', x: 0.5, y: 0.14, at: '#s10', out: '#s11' });
    k.tag('Critics', { icon: 'user', x: 0.5, y: 0.36, at: '#idea', out: '#s11' });
    k.tag('Not a new idea', { x: 0.5, y: 0.58, at: t('#idea', 1.4), out: '#s11' });
    k.tag('[VALID] format', { icon: 'check', x: 0.5, y: 0.2, at: '#s11', out: '#s12' });
    k.tag('[?] Correct answer', { x: 0.5, y: 0.44, at: t('#wrong', -0.6), out: '#s12' });

    // 7. When to use which (s12)
    k.tag('[CDM] narrow tasks', { icon: 'bolt', x: 0.5, y: 0.2, at: '#s12' });
    k.tag('[LLM] open tasks', { icon: 'cloud', x: 0.5, y: 0.44, at: '#llm' });
  },
};

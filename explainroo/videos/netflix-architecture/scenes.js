// Netflix architecture, in the tech-explainer style. Netflix colors: red #E50914 on near-black,
// white text, and Netflix's UI gray #B3B3B3 for the keys in code cards.
// Keep the content in the upper two thirds: the bottom stays free for app buttons.
import { kit } from './lib/kit.js';

export default {
  story(s) {
    const k = kit(s, { palette: { accent: '#e50914', key: '#b3b3b3' } });
    const t = (m, d = 0) => k.T(m, d);

    // 1. Hook: the title, a play button, and the question (s1 to s2)
    k.title('NETFLIX', { y: 0.15, size: 16, at: 0, out: '#s3' });
    k.lines(['the whole', '*architecture*'], { y: 0.3, size: 8, at: 0.3, out: '#s3' });
    k.sticker('play', { x: 0.42, y: 0.6, size: 20, color: 'white', rotate: -5, at: '#play', out: '#s3' });
    k.tap({ x: 0.44, y: 0.62, at: t('#play', 0.15), out: '#s3' });
    k.tag('Not from the [cloud]', { icon: 'cloud', x: 0.5, y: 0.84, size: 6.5, at: 'cloud', out: '#s3' });
    k.sticker(null, { label: 'where?', shape: 'burst', color: 'accent', x: 0.82, y: 0.62, size: 20, rotate: 10, from: 'slap', at: '#s2', out: '#s3' });

    // 2. The app talks to AWS (s3 to s4)
    k.phone({ id: 'app', x: 0.5, y: 0.26, w: 0.78, app: 'Netflix', at: '#s3', out: '#s5',
      rows: [
        { text: 'Your phone or TV', at: 'phone' },
        { text: 'Sign in', at: '#s4' },
        { text: 'Home screen', at: t('#s4', 0.7) },
        { text: 'Recommendations', at: t('#s4', 1.4) },
        { text: 'Search', at: t('#s4', 2.1) },
      ] });
    k.tag('[AWS] cloud', { id: 'aws', icon: 'cloud', x: 0.5, y: 0.74, at: 'talks', out: '#s5' });
    k.link('app', 'aws', { pair: true, at: t('talks', 0.4), out: '#s5' });
    k.sticker('log-in', { x: 0.87, y: 0.54, size: 14, color: 'white', rotate: 9, at: '#s4', out: '#s5' });

    // 3. Hundreds of services behind a gateway (s5 to s7)
    k.tag('[AWS]', { id: 'aws2', icon: 'cloud', x: 0.5, y: 0.07, at: '#s5', out: '#s8' });
    k.sticker(null, { label: 'hundreds', shape: 'pill', color: 'white', x: 0.74, y: 0.2, size: 12, rotate: 8, at: t('#s5', 0.9), out: '#s8' });
    k.tag('Zuul gateway', { id: 'zuul', x: 0.5, y: 0.33, at: '#s6', out: '#s8' });
    k.link('aws2', 'zuul', { at: t('#s6', 0.4), out: '#s8' });
    ['Play', 'Search', 'Profiles'].forEach((label, i) => {
      const id = `svc${i}`;
      k.tag(label, { id, x: [0.18, 0.5, 0.82][i], y: 0.6, size: 5, at: t('#s7', i * 0.25), out: '#s8' });
      k.link('zuul', id, { at: t('#s7', 0.2 + i * 0.25), out: '#s8' });
    });

    // 4. Data: Cassandra and EVCache (s8)
    k.tag('Cassandra', { id: 'cass', icon: 'db', x: 0.5, y: 0.1, at: t('#s8', 0.6), out: '#s9' });
    k.tag('Services', { id: 'svc', x: 0.5, y: 0.38, at: t('#s8', 0.3), out: '#s9' });
    k.tag('EVCache', { id: 'ev', icon: 'bolt', x: 0.5, y: 0.66, at: 'hot', out: '#s9' });
    k.link('svc', 'cass', { pair: true, at: t('#s8', 0.9), out: '#s9' });
    k.link('svc', 'ev', { pair: true, at: t('hot', 0.3), out: '#s9' });
    k.sticker('flame', { label: 'hot', x: 0.85, y: 0.85, size: 14, color: 'accent', rotate: 9, at: t('hot', 0.5), out: '#s9' });

    // 5. The move to the cloud (s9 to s10)
    k.tag('Data center', { id: 'dc', icon: 'server', x: 0.5, y: 0.1, at: '#s9', out: '#s11' });
    k.tag('[AWS] cloud', { id: 'aws3', icon: 'cloud', x: 0.5, y: 0.48, at: t('#s9', 0.8), out: '#s11' });
    k.link('dc', 'aws3', { label: '7 years', at: t('#s9', 1.2), out: '#s11' });
    k.sticker('calendar-check', { label: 'Jan 2016', x: 0.5, y: 0.8, size: 20, color: 'white', rotate: -6, from: 'slap', at: '#s10', out: '#s11' });

    // 6. Press play: AWS picks a server, Open Connect streams (s11 to s14)
    k.tag('App', { id: 'app2', icon: 'phone', x: 0.27, y: 0.08, at: '#s11', out: '#s15' });
    k.sticker('cloud-off', { x: 0.75, y: 0.08, size: 15, color: 'white', rotate: 8, at: t('#s11', 0.5), out: '#s15' });
    k.tag('[AWS]', { id: 'aws4', icon: 'cloud', x: 0.73, y: 0.34, at: '#s12', out: '#s15' });
    k.link('app2', 'aws4', { pair: true, at: t('#s12', 0.4), out: '#s15' });
    k.tag('Open Connect', { id: 'oca', icon: 'server', x: 0.5, y: 0.62, at: '#s13', out: '#s15' });
    k.link('aws4', 'oca', { at: t('#s13', 0.2), out: '#s15' });
    k.link('oca', 'app2', { label: 'video', at: t('#s13', 1.0), out: '#s15' });
    k.lines(['inside *your ISP*'], { y: 0.85, size: 7, at: '#s14', out: '#s15' });
    k.sticker('house', { x: 0.15, y: 0.42, size: 14, color: 'white', rotate: -8, at: t('#s14', 0.4), out: '#s15' });

    // 7. Filled at night, and the numbers (s15 to s16)
    k.tag('Open Connect', { id: 'oca2', icon: 'server', x: 0.5, y: 0.1, at: '#s15', out: '#s17' });
    k.lines(['*popular* shows'], { y: 0.26, size: 7.5, at: 'popular', out: '#s17' });
    k.sticker('moon', { label: 'at night', x: 0.5, y: 0.4, size: 20, color: 'white', rotate: -6, at: 'night', out: '#s17' });
    k.tag('[1,000] locations', { x: 0.5, y: 0.6, size: 6.5, at: '#loc', out: '#s17' });
    k.tag('[thousands] of ISPs', { x: 0.5, y: 0.73, size: 6, at: '#isps', out: '#s17' });
    k.tag('[190] countries', { x: 0.5, y: 0.86, size: 6.5, at: '#countries', out: '#s17' });

    // 8. The payoff (s17 to the end)
    k.tag('[302M] members', { x: 0.5, y: 0.12, size: 9, at: '#s17' });
    k.sticker('users', { x: 0.86, y: 0.3, size: 13, color: 'white', rotate: 8, at: t('#s17', 0.6), out: '#s18' });
    k.tag('[AWS] before play', { x: 0.5, y: 0.4, size: 6.5, at: '#s18' });
    k.tag('[Open Connect] after play', { x: 0.5, y: 0.62, size: 6.5, at: '#after' });
    k.sticker('play', { x: 0.5, y: 0.85, size: 17, color: 'accent', rotate: -5, from: 'slap', at: t('#after', 0.9) });
  },
};

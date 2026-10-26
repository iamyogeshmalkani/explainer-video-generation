// What is a REST API? Pictures pop in on the word that names them; the code draws the connections.
// Keep the content in the upper two thirds: the bottom stays free for app buttons.
import { kit } from './lib/kit.js';

export default {
  story(s) {
    const k = kit(s);
    const t = (m, d = 0) => k.T(m, d);

    // 1. The weather app asks a server (s1 to s2)
    k.pic('phone', { id: 'app', x: 0.5, y: 0.2, w: 0.4, label: 'Weather app', at: 0, out: '#s3' });
    k.sticker('badge-question-mark', { x: 0.84, y: 0.06, size: 15, color: 'yellow', rotate: 10, at: 'idea', out: '#s3' });
    k.pic('server', { id: 'srv', x: 0.5, y: 0.8, w: 0.42, label: 'Server', at: '#s2', out: '#s3' });
    k.link('app', 'srv', { pair: true, at: t('#s2', 0.4), out: '#s3' });

    // 2. The rules are called REST (s3 to s4)
    k.title('REST', { y: 0.18, wave: true, at: '#s3', out: '#s5' });
    k.lines(['Representational', 'State', 'Transfer'], { y: 0.42, gap: 0.11, size: 8.5, stagger: 0.4, at: t('#s3', 0.6), out: '#s5' });
    k.lines(['the rules for the *conversation*'], { y: 0.8, size: 6, at: t('#s3', 1.5), out: '#s5' });
    k.sticker('badge-question-mark', { x: 0.84, y: 0.6, size: 16, color: 'pink', rotate: 12, from: 'slap', at: '#s4', out: '#s5' });

    // 3. Everything gets an address (s5)
    k.lines(['[1] Address'], { y: 0.08, size: 9, at: '#s5', out: '#s6' });
    k.pic('pin', { x: 0.5, y: 0.45, w: 0.4, at: t('#s5', 0.4), out: '#s6' });
    k.lines(['*/weather/oslo*'], { y: 0.8, size: 8, at: '#addr', out: '#s6' });

    // 4. A verb says what you want (s6)
    k.lines(['[2] Verb'], { y: 0.08, size: 9, at: '#s6', out: '#s7' });
    k.sticker('zap', { x: 0.84, y: 0.2, size: 15, color: 'yellow', rotate: 10, at: t('#s6', 0.3), out: '#s7' });
    k.lines(['[GET] read'], { y: 0.3, size: 8.5, at: '#get', out: '#s7' });
    k.lines(['[POST] create'], { y: 0.45, size: 8.5, at: '#post', out: '#s7' });
    k.lines(['[PUT] change'], { y: 0.6, size: 8.5, at: '#put', out: '#s7' });
    k.lines(['[DELETE] remove'], { y: 0.75, size: 8.5, at: '#del', out: '#s7' });

    // 5. The server answers with a status code (s7)
    k.lines(['[3] Status'], { y: 0.08, size: 9, at: '#s7', out: '#s9' });
    k.pic('server', { id: 'srv2', x: 0.28, y: 0.32, w: 0.3, label: 'Server', at: '#s7', out: '#s9' });
    k.pic('package', { id: 'res', x: 0.72, y: 0.32, w: 0.32, label: 'Answer', at: t('#s7', 0.5), out: '#s9', from: 'slap' });
    k.link('srv2', 'res', { at: t('#s7', 0.3), out: '#s9' });
    k.pic('check', { x: 0.28, y: 0.74, w: 0.28, label: '[200] OK', labelSize: 5.2, at: '#ok', out: '#s9' });
    k.pic('notfound', { x: 0.72, y: 0.74, w: 0.28, label: '[404] Not found', labelSize: 5.2, at: '#nf', out: '#s9' });

    // 6. The twist: the server forgets you, so one server serves a crowd (s9 to s11)
    k.sticker(null, { label: 'the twist', shape: 'burst', color: 'pink', x: 0.5, y: 0.1, size: 20, from: 'slap', at: '#s9', out: '#s10' });
    k.pic('server', { id: 'srv3', x: 0.5, y: 0.36, w: 0.36, label: 'Server', at: t('#s9', 0.6), out: '#s12' });
    k.sticker('eraser', { label: 'forgets', x: 0.82, y: 0.2, size: 15, color: 'red', rotate: 8, at: 'forgets', out: '#s12' });
    k.pic('envelope', { id: 'req', x: 0.5, y: 0.76, w: 0.34, label: 'Everything inside', at: '#s10', out: '#s11' });
    k.link('req', 'srv3', { at: t('#s10', 0.4), out: '#s11' });
    [0.2, 0.5, 0.8].forEach((x, i) => {
      k.pic('phone', { id: `ph${i}`, x, y: 0.8, w: 0.18, at: t('#s11', i * 0.2), out: '#s12' });
      k.link(`ph${i}`, 'srv3', { at: t('#s11', 0.6), out: '#s12' });
    });

    // 7. Roy Fielding, 2000 (s12)
    k.pic('book', { x: 0.5, y: 0.42, w: 0.42, label: 'Roy Fielding', at: '#s12', out: '#s13' });
    k.sticker(null, { label: '2000', color: 'yellow', x: 0.82, y: 0.14, size: 18, rotate: 8, from: 'slap', at: '#year', out: '#s13' });
    k.sticker('graduation-cap', { x: 0.18, y: 0.14, size: 15, color: 'cyan', rotate: -10, at: '#thesis', out: '#s13' });
    k.lines(['PhD thesis, *UC Irvine*'], { y: 0.82, size: 6.5, at: '#thesis', out: '#s13' });

    // 8. The point: a shared set of rules between app and server (s13)
    k.pic('phone', { id: 'app2', x: 0.26, y: 0.24, w: 0.3, label: 'App', at: '#s13' });
    k.pic('server', { id: 'srv4', x: 0.74, y: 0.24, w: 0.34, label: 'Server', at: t('#s13', 0.3) });
    k.link('app2', 'srv4', { pair: true, label: 'REST', block: true, at: t('#s13', 0.6) });
    k.lines(['[Address]', '[Verb]', '[Status]'], { y: 0.62, gap: 0.11, size: 7, stagger: 0.35, at: t('#s13', 1.0) });
  },
};

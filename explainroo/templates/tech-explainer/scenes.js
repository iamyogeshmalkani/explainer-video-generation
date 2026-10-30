// Tech-explainer template. Normally you edit script.md (the words and the [#markers]), shots.js (the pictures)
// and this file (what appears on each marker). The kit is in lib/kit.js; its header lists every call.
// Pictures pop in on the word that names them; the code draws the connections between them.
// Keep the content in the upper two thirds: the bottom stays free for app buttons.
import { kit } from './lib/kit.js';

export default {
  story(s) {
    const k = kit(s);
    const t = (m, d = 0) => k.T(m, d);

    // 1. The topic name and what it stands for (s1 to s2)
    k.title('API', { y: 0.18, wave: true, at: 0, out: '#s3' });
    k.lines(['Application', 'Programming', 'Interface'], { y: 0.42, gap: 0.11, size: 8.5, stagger: 0.4, at: '#s2', out: '#s3' });

    // 2. An API is a menu (s3)
    k.pic('menu', { x: 0.5, y: 0.3, w: 0.64, label: '[API] menu', at: '#s3', out: '#old' });
    k.lines(['[GET] /weather', '[GET] /forecast', '[POST] /login'], { y: 0.7, gap: 0.09, size: 7, stagger: 0.6, at: t('#s3', 1), out: '#old' });

    // 2b. A little history (old, year)
    k.lines(['The idea is *old*'], { y: 0.2, size: 7.5, at: '#old', out: '#s4' });
    k.lines(['[1960s]'], { y: 0.42, size: 14, at: '#year', out: '#s4' });
    k.sticker('clock', { x: 0.82, y: 0.62, size: 17, color: 'yellow', rotate: 8, at: t('#year', 0.5), out: '#s4' });

    // 3. Today: the client sends a request to the server (s4 to s5)
    k.pic('phone', { id: 'client', x: 0.26, y: 0.2, w: 0.3, label: 'Client', at: '#s4', out: '#s6' });
    k.pic('server', { id: 'server2', x: 0.74, y: 0.2, w: 0.34, label: 'Server', at: t('#s5', 0.6), out: '#s6' });
    k.pic('envelope', { id: 'req', x: 0.5, y: 0.53, w: 0.4, label: 'Request', at: '#s5', out: '#s6', from: 'slap' });
    k.link('client', 'req', { at: t('#s5', 0.3), out: '#s6' });
    k.link('req', 'server2', { at: t('#data', 0.3), out: '#s6' });
    k.lines(['[GET]'], { y: 0.8, size: 7, at: '#method', out: '#s6' });
    k.lines(['*/weather?city=Oslo*'], { y: 0.87, size: 6.4, at: '#address', out: '#s6' });
    k.lines(['and sometimes *data*'], { y: 0.94, size: 5.6, at: '#data', out: '#s6' });

    // 4. The server checks who you are, then reads the database (s6 to s7)
    k.pic('server', { id: 'server3', x: 0.5, y: 0.2, w: 0.34, label: 'Server', at: '#s6', out: '#s8' });
    k.pic('shield', { id: 'auth', x: 0.26, y: 0.64, w: 0.34, label: '[Auth]', at: t('#s6', 0.5), out: '#s8' });
    k.pic('database', { id: 'db', x: 0.74, y: 0.64, w: 0.34, label: 'Database', at: '#s7', out: '#s8' });
    k.link('server3', 'auth', { at: t('#s6', 0.9), out: '#s8' });
    k.link('auth', 'db', { pair: true, at: t('#s7', 0.4), out: '#s8' });

    // 5. The response (s8)
    k.pic('server', { id: 'server4', x: 0.26, y: 0.2, w: 0.34, label: 'Server', at: '#s8', out: '#s9' });
    k.pic('package', { id: 'res', x: 0.74, y: 0.2, w: 0.36, label: 'Response', at: t('#s8', 0.5), out: '#s9', from: 'slap' });
    k.link('server4', 'res', { at: t('#s8', 0.3), out: '#s9' });
    k.lines(['[200] *status code*'], { y: 0.52, size: 6.6, at: '#status', out: '#s9' });
    k.pic('weather', { id: 'wx', x: 0.5, y: 0.78, w: 0.38, label: 'Oslo *18°C*', at: '#body', out: '#s9' });
    k.link('res', 'wx', { at: t('#body', 0.3), out: '#s9' });

    // 6. Status codes (s9 to s10)
    k.pic('check', { x: 0.5, y: 0.24, w: 0.44, label: '[200] OK', at: '#s9', out: '#r' });
    k.pic('notfound', { x: 0.5, y: 0.72, w: 0.44, label: '[404] Not found', at: '#s10', out: '#r' });

    // 7. The loop (s11)
    k.pic('envelope', { id: 'l1', x: 0.26, y: 0.2, w: 0.36, label: '[1] Request', at: '#r' });
    k.pic('shield', { id: 'l2', x: 0.74, y: 0.2, w: 0.36, label: '[2] Check', at: '#c' });
    k.pic('package', { id: 'l3', x: 0.5, y: 0.64, w: 0.4, label: '[3] Answer', at: '#a' });
    k.link('l1', 'l2', { at: t('#c', 0.2) });
    k.link('l2', 'l3', { at: t('#a', 0.2) });
  },
};

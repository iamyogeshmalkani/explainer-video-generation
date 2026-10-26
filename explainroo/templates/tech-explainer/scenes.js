// Tech-explainer template. Normally you edit script.md (the words and the [#markers]) and
// this file (what appears on each marker). The kit is in lib/kit.js; its header lists every call.
// Keep the content in the upper two thirds: the bottom stays free for app buttons.
import { kit } from './lib/kit.js';

export default {
  story(s) {
    const k = kit(s);
    const t = (m, d = 0) => k.T(m, d);

    // 1. An app talks to a server (s1 to s3)
    k.phone({ id: 'app', x: 0.5, y: 0.32, w: 0.8, app: 'Weather[App]', picture: true, out: '#s3',
      rows: [{ text: 'Oslo: 18°C, sunny', at: 0.3 }, { meta: 'Mon 3:00 PM', at: 0.6 }] });
    k.tag('[API]', { id: 'api', x: 0.5, y: 0.69, at: '#s2', out: '#s3' });
    k.tag('Server', { id: 'server', icon: 'server', x: 0.5, y: 0.88, at: 'server', out: '#s3' });
    k.link('app', 'api', { pair: true, at: t('#s2', 0.2), out: '#s3' });
    k.link('api', 'server', { pair: true, at: t('#s2', 0.5), out: '#s3' });

    // 2. An API is a menu (s3)
    k.tag('[API]', { id: 'menu', x: 0.5, y: 0.12, at: '#s3', out: '#s4' });
    k.tag('[GET] /weather', { x: 0.5, y: 0.3, size: 6.6, at: t('#s3', 0.7), out: '#s4' });
    k.tag('[GET] /forecast', { x: 0.5, y: 0.46, size: 6.6, at: t('#s3', 1.3), out: '#s4' });
    k.tag('[POST] /login', { x: 0.5, y: 0.62, size: 6.6, at: t('#s3', 1.9), out: '#s4' });

    // 3. The client sends a request (s4 to s5)
    k.tag('Client', { id: 'client', icon: 'phone', x: 0.5, y: 0.09, at: '#s4', out: '#s6' });
    k.code(['{', '  "method": "GET",', '  "url": "/weather?city=Oslo",', '  "body": none', '}'],
      { id: 'req', title: 'request', x: 0.5, y: 0.47, w: 0.92, size: 4.2, at: '#s5', out: '#s6' });
    k.tag('Server', { id: 'server2', icon: 'server', x: 0.5, y: 0.87, at: t('#s5', 0.4), out: '#s6' });
    k.link('client', 'req', { at: t('#s4', 0.8), out: '#s6' });
    k.link('req', 'server2', { at: t('#data', 0.4), out: '#s6' });

    // 4. The server checks who you are, then reads the database (s6 to s7)
    k.tag('Server', { id: 'server3', icon: 'server', x: 0.5, y: 0.14, at: '#s6', out: '#s8' });
    k.tag('Check [auth]', { id: 'auth', icon: 'lock', x: 0.5, y: 0.4, at: t('#s6', 0.5), out: '#s8' });
    k.tag('Database', { id: 'db', icon: 'db', x: 0.5, y: 0.66, at: '#s7', out: '#s8' });
    k.link('server3', 'auth', { at: t('#s6', 0.9), out: '#s8' });
    k.link('auth', 'db', { pair: true, at: t('#s7', 0.5), out: '#s8' });

    // 5. The response (s8)
    k.tag('Server', { id: 'server4', icon: 'server', x: 0.5, y: 0.09, at: '#s8', out: '#s9' });
    k.code(['{', { text: '  "status": 200,', at: '#status' }, { text: '  "city": "Oslo",', at: '#body' }, { text: '  "temp": "18°C"', at: t('#body', 0.5) }, '}'],
      { id: 'res', title: 'response', x: 0.5, y: 0.47, w: 0.92, size: 4.2, at: '#s8', out: '#s9' });
    k.link('server4', 'res', { at: t('#s8', 0.6), out: '#s9' });

    // 6. Status codes (s9 to s10)
    k.tag('[200] OK', { id: 'ok', icon: 'check', x: 0.5, y: 0.24, at: '#s9', out: '#r' });
    k.tag('[404] Not found', { x: 0.5, y: 0.46, at: '#s10', out: '#r' });

    // 7. The loop (s11)
    k.tag('[1] Request', { id: 'l1', x: 0.5, y: 0.14, at: '#r' });
    k.tag('[2] Check', { id: 'l2', icon: 'lock', x: 0.5, y: 0.38, at: '#c' });
    k.tag('[3] Answer', { id: 'l3', icon: 'check', x: 0.5, y: 0.62, at: '#a' });
    k.link('l1', 'l2', { at: t('#c', 0.2) });
    k.link('l2', 'l3', { at: t('#a', 0.2) });
  },
};

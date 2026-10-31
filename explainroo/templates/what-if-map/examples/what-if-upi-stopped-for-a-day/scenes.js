// What if UPI stopped working for one whole day? A phone, a shop counter, ATM queues and one map beat of payments.
import { setParallel, fly, basemap, kit } from './lib/kit.js';
import { frames } from './lib/frames.js';

setParallel(22);

export default {
  story(s) {
    const t = (m) => s.time(m);
    const MARKS = ['#billions', '#down', '#cash', '#atm', '#shops', '#bills', '#income', '#end'].map(t);
    const cam = fly(s, [{ lon: 82.5, lat: 21.5, span: 50 }], { beats: MARKS });
    const k = kit(s, cam);
    const f = frames(s, cam);

    // Map: a swarm of payments across the whole of India (official outline).
    basemap(s);
    k.fill('India', { color: '#2f9e44', alpha: 0.85, border: '#ffffff', at: t('#billions') - 0.1, out: t('#billions') + 2.8, sound: false });
    f.swarm('India', { n: 700, at: t('#billions') + 0.2, dur: 1.8, out: t('#billions') + 2.8, icon: 'coin', size: 9, color: '#ffe066', seed: 8 });

    k.grade(); k.ambient(); k.credit('@YourChannel'); k.vignette();

    const out1 = t('#billions') - 0.05, shopAt = t('#billions') + 2.7;

    // opening: a phone that says PAYMENT FAILED, and a shocked person
    f.backdrop('sky', { at: -1, out: out1, sound: false });
    f.phone({ x: 0.32, y: 0.5, h: 0.46, at: 0, out: out1, screens: [{ at: 0, kind: 'pay' }, { at: 1.5, kind: 'failed' }] });
    f.person({ x: 0.74, y: 0.84, height: 0.28, mood: 'shock', at: 0.1, from: 1.2, out: out1 });
    f.headline('WHAT IF\nUPI STOPPED?', { at: 0, out: out1 });

    // billions of payments (map), then a chai stall
    f.big('BILLIONS', { at: t('#billions') + 0.3, out: t('#billions') + 2.7, y: 0.3, size: 200, sub: 'OF PAYMENTS EVERY MONTH' });
    f.backdrop('shop', { at: shopAt, out: t('#down') - 0.05 });
    f.qr({ x: 0.3, y: 0.56, size: 330, at: shopAt + 0.1, out: t('#down') - 0.05 });
    f.emoji('☕', { x: 0.7, y: 0.5, size: 230, at: shopAt + 0.3, out: t('#down') - 0.05, bob: 6 });
    f.emoji('🛍️', { x: 0.7, y: 0.28, size: 140, at: shopAt + 1.0, out: t('#down') - 0.05, bob: 6 });
    f.headline('SHOP TO CHAI STALL', { at: shopAt + 0.1, out: t('#down') - 0.05 });

    // it goes down: the QR is crossed out, people cannot pay
    f.backdrop('shop', { at: t('#down') - 0.1, out: t('#cash') - 0.05 });
    f.qr({ x: 0.3, y: 0.56, size: 330, at: t('#down') - 0.1, out: t('#cash') - 0.05, sound: false });
    f.cross({ x: 0.3, y: 0.56, size: 300, at: t('#down') + 1.0, out: t('#cash') - 0.05 });
    f.phone({ x: 0.72, y: 0.48, h: 0.34, at: t('#down') + 0.3, out: t('#cash') - 0.05, screens: [{ at: 0, kind: 'pay' }, { at: t('#down') + 1.4, kind: 'failed' }], tilt: 5 });
    f.queue({ y: 0.8, items: ['🧍', '🧍‍♀️', '🧍‍♂️'], n: 6, at: t('#down') + 1.2, gap: 0.45, x0: 0.36, size: 170, out: t('#cash') - 0.05 });
    f.headline("CAN'T PAY", { at: t('#down') + 0.15, out: t('#cash') - 0.05 });

    // no cash
    f.backdrop('sky', { at: t('#cash') - 0.1, out: t('#atm') - 0.05 });
    f.emoji('👛', { x: 0.5, y: 0.45, size: 320, at: t('#cash') + 0.1, out: t('#atm') - 0.05, bob: 6 });
    f.cross({ x: 0.5, y: 0.45, size: 300, at: t('#cash') + 1.0, out: t('#atm') - 0.05 });
    f.headline('NO CASH LEFT', { at: t('#cash') + 0.15, out: t('#atm') - 0.05 });

    // ATM queues
    f.backdrop('street', { at: t('#atm') - 0.1, out: t('#shops') - 0.05 });
    f.emoji('🏧', { x: 0.2, y: 0.55, size: 300, at: t('#atm') + 0.1, out: t('#shops') - 0.05 });
    f.queue({ y: 0.78, items: ['🧍', '🧍‍♀️', '🧍‍♂️'], n: 6, at: t('#atm') + 0.4, gap: 0.22, x0: 0.36, size: 170, out: t('#shops') - 0.05 });
    f.headline('LONG ATM QUEUES', { at: t('#atm') + 0.1, out: t('#shops') - 0.05 });

    // shop owners lose a whole day of sales
    f.backdrop('shop', { at: t('#shops') - 0.1, out: t('#bills') - 0.05 });
    f.clock({ x: 0.25, y: 0.35, r: 120, at: t('#shops') + 0.1, out: t('#bills') - 0.05, hoursPerSec: 6, start: 9 });
    f.big('₹0', { at: t('#shops') + 0.5, out: t('#bills') - 0.05, x: 0.68, y: 0.38, size: 240, color: '#ff6b6b', sub: 'SALES TODAY' });
    f.person({ x: 0.5, y: 0.9, height: 0.26, mood: 'worried', at: t('#shops') + 0.2, from: -0.2, out: t('#bills') - 0.05, outfit: { shirt: '#f4a261', tie: null, pants: '#5b4636' } });

    // bills, rent, orders
    f.backdrop('sky', { at: t('#bills') - 0.1, out: t('#income') - 0.05 });
    f.emoji('🧾', { x: 0.2, y: 0.42, size: 220, at: t('#bills') + 0.1, out: t('#income') - 0.05, cross: true, crossAt: t('#bills') + 0.9 });
    f.emoji('🏠', { x: 0.5, y: 0.42, size: 220, at: t('#bills') + 0.5, out: t('#income') - 0.05, cross: true, crossAt: t('#bills') + 1.3 });
    f.emoji('📦', { x: 0.8, y: 0.42, size: 220, at: t('#bills') + 0.9, out: t('#income') - 0.05, cross: true, crossAt: t('#bills') + 1.7 });
    f.headline('EVERYTHING STALLS', { at: t('#bills') + 0.1, out: t('#income') - 0.05 });

    // no payments, no income
    f.backdrop('shop', { at: t('#income') - 0.1, out: t('#end') - 0.05 });
    f.banner('CLOSED', { at: t('#income') + 0.3, out: t('#end') - 0.05, x: 0.5, y: 0.5, size: 100 });
    f.person({ x: 0.5, y: 0.9, height: 0.26, mood: 'worried', at: t('#income') + 0.1, from: 1.2, out: t('#end') - 0.05, outfit: { shirt: '#f4a261', tie: null, pants: '#5b4636' } });
    f.headline('NO PAYMENTS\n= NO INCOME', { at: t('#income') + 1.2, out: t('#end') - 0.05 });

    // closing
    f.backdrop('sky', { at: t('#end') - 0.1 });
    f.phone({ x: 0.32, y: 0.5, h: 0.46, at: t('#end'), screens: [{ at: 0, kind: 'failed' }] });
    f.person({ x: 0.74, y: 0.84, height: 0.28, mood: 'shock', at: t('#end') + 0.1, from: 1.2, hold: 'phone' });
    f.headline('LAST TIME YOU\nCARRIED CASH?', { at: t('#end') + 0.1 });

    k.progress();
    k.whatIfCaptions({ size: 64, maxChars: 12, lit: ['upi', 'cash', 'income', 'payments', 'pay'] });
    [t('#billions'), t('#down'), t('#atm'), t('#bills')].forEach((m) => s.sfx('whoosh', m - 0.3, { gain: 0.2 }));
  },
};

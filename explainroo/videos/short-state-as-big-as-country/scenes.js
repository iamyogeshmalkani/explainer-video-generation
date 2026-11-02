// Which Indian state is as big as a country? A split screen at one honest scale per pair: Rajasthan beside the UK, Maharashtra beside Italy,
// Uttar Pradesh beside Brazil (by people). The last frame returns to the first pair so the Short loops. Outlines are true size and shape.
import { setParallel, basemap, kit } from './lib/kit.js';
import { cinema, cine } from './lib/cine.js';
import { kmRings } from './lib/series.js';

setParallel(25);
const sm = (q) => { q = Math.min(1, Math.max(0, q)); return q * q * (3 - 2 * q); };

export default {
  story(s) {
    const t = (m) => s.time(m);
    const MARKS = ['#raj', '#maha', '#up', '#end'].map(t);
    const end = s.dur;
    const cam = cinema(s, [{ lon: 78, lat: 22, span: 60, tilt: 0 }], { beats: MARKS, drift: 0 });
    const k = kit(s, cam); const c = cine(s, cam);

    basemap(s); c.dim(0.8);
    // one pair at a time: [state, country, px per km, text under each, note, from, to]
    const PAIRS = [
      { a: 'Rajasthan', b: 'United Kingdom', scale: 0.42, ta: [342000, ' km²'], tb: [244000, ' km²'], note: 'BIGGER THAN THE UK', at: 0.2, out: t('#maha') },
      { a: 'Maharashtra', b: 'Italy', scale: 0.42, ta: [126, 'M people'], tb: [59, 'M people'], note: 'OVER 2× THE PEOPLE', at: t('#maha'), out: t('#up') },
      { a: 'Uttar Pradesh', b: 'Brazil', scale: 0.1, ta: [240, 'M people'], tb: [213, 'M people'], note: 'MORE PEOPLE THAN BRAZIL', at: t('#up'), out: t('#end') + 0.3 },
      { a: 'Rajasthan', b: 'United Kingdom', scale: 0.42, ta: [342000, ' km²'], tb: [244000, ' km²'], note: 'BIGGER THAN THE UK', at: t('#end') + 0.3, out: end + 1 },
    ];
    c.tilt();
    PAIRS.forEach((P, pi) => {
      const A = kmRings(P.a, P.a === 'Maharashtra' || P.a === 'Rajasthan' || P.a === 'Uttar Pradesh' ? true : true); const B = kmRings(P.b, true);
      c.screen({ at: P.at, out: P.out }, (ctx, life, tt) => {
        const draw = (rings, cx, cy, col, name, val, i) => {
          const pop = sm((tt - 0.1 * i) / 0.5);
          ctx.save(); ctx.translate(cx, cy); ctx.scale(pop, pop);
          ctx.beginPath(); for (const r of rings) { ctx.moveTo(r[0] * P.scale, -r[1] * P.scale); for (let j = 2; j < r.length; j += 2) ctx.lineTo(r[j] * P.scale, -r[j + 1] * P.scale); ctx.closePath(); }
          ctx.fillStyle = col; ctx.globalAlpha = 0.78; ctx.shadowColor = col; ctx.shadowBlur = 30; ctx.fill(); ctx.shadowBlur = 0; ctx.globalAlpha = 1; ctx.lineJoin = 'round'; ctx.lineWidth = 4; ctx.strokeStyle = '#fff'; ctx.stroke();
          ctx.restore();
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = '800 54px "Plus Jakarta Sans", sans-serif'; ctx.fillStyle = '#fff'; ctx.lineJoin = 'round'; ctx.lineWidth = 10; ctx.strokeStyle = '#000';
          ctx.strokeText(name.toUpperCase(), cx, s.H * 0.215); ctx.fillText(name.toUpperCase(), cx, s.H * 0.215);
          const v = val[0] * sm((tt - 0.4) / 1.2); const txt = `${Math.round(v).toLocaleString('en-US')}${val[1]}`;
          ctx.font = '800 60px "Plus Jakarta Sans", sans-serif'; ctx.fillStyle = '#ffd84a'; ctx.lineWidth = 10; ctx.strokeText(txt, cx, s.H * 0.665); ctx.fillText(txt, cx, s.H * 0.665);
        };
        ctx.fillStyle = 'rgba(6,14,24,0.6)'; ctx.fillRect(0, s.H * 0.17, s.W, s.H * 0.55);
        ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(s.cx, s.H * 0.19); ctx.lineTo(s.cx, s.H * 0.7); ctx.stroke();
        draw(A, s.W * 0.27, s.H * 0.44, '#ffb02e', P.a, P.ta, 0); draw(B, s.W * 0.73, s.H * 0.44, '#3da5ff', P.b, P.tb, 1);
        ctx.font = '800 50px "Plus Jakarta Sans", sans-serif'; ctx.textAlign = 'center'; ctx.lineWidth = 9; ctx.strokeStyle = '#000'; ctx.fillStyle = '#7CFF6B';
        ctx.globalAlpha = sm((tt - 1.0) / 0.4); ctx.strokeText(P.note, s.cx, s.H * 0.705); ctx.fillText(P.note, s.cx, s.H * 0.705);
      });
    });

    k.grade(); k.ambient(); k.vignette();
    k.credit('Map is schematic', { y: 0.955 });
    k.hook('What if a *state* was a country?', { at: 0.1, out: 3.0, y: 0.1 });
    k.hook('Which state should be a *country*?', { at: t('#end') + 0.3, out: end, y: 0.1, size: 70 });
    k.progress();
    k.whatIfCaptions({ size: 64, maxChars: 12 });
  },
};

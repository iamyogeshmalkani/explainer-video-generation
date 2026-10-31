// what-if-map props: more cartoon frames and objects for "What if India ...?" shorts. frames() adds these to its object, so you
// call them as f.pump(...), f.phone(...), f.backdrop('station', ...) and so on. x, y are fractions of the frame (0 to 1),
// sizes are pixels at 1080 wide, times are seconds (use t('#marker')). Every helper plays its own sound.
//
// Cut-away backdrops (f.backdrop(kind, { at, out, ...options })):
//   'pump'     a petrol forecourt          'station'  a railway platform and tracks     'shop'    a shop front and counter
//   'stadium'  a floodlit cricket ground   { emptyAt } the crowd leaves from that time
//   'smog'     a grey Delhi skyline        { clearAt, clearDur } the sky turns blue and the Red Fort shows
//   'street'   a road (in frames.js)       'sky'      a plain sky
// Objects: emoji, emojiRow, big, cross, banner, arrowUp, queue, pump, phone, qr, clock, train, bars, rocket, countUp, crowd.
const TAU = Math.PI * 2;
const mix = (a, b, p) => a + (b - a) * p;
const hex = (c) => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
const lerpColor = (a, b, p) => { const A = hex(a), B = hex(b); return `rgb(${A.map((v, i) => Math.round(mix(v, B[i], p))).join(',')})`; };
const EMOJI = '"Apple Color Emoji", "Noto Color Emoji", "Segoe UI Emoji", sans-serif';

export function addProps(api, h) {
  const { s, W, H, S, screenLayer: layer, toon, roundRect, clamp, easeOut, backOut, rng, FONT, OUTLINE, sfx, X, Y, cam, geometry, trace } = h;
  const inOut = (p) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);
  const z = cam.zoom;

  // ---- backdrops ----------------------------------------------------------------------------------------------------
  const sky = (ctx, a, b) => { const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, a); g.addColorStop(1, b); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); };
  const cloud = (ctx, cx, cy, r, alpha = 0.85) => { ctx.fillStyle = `rgba(255,255,255,${alpha})`; ctx.beginPath(); ctx.ellipse(cx, cy, r * 1.5, r * 0.5, 0, 0, TAU); ctx.ellipse(cx + r * 0.8, cy - r * 0.2, r * 0.9, r * 0.45, 0, 0, TAU); ctx.fill(); };
  const skyline = (ctx, base, seed, tone, win, hmin = 0.1, hmax = 0.3) => {
    const r = rng(seed); let x = -30;
    while (x < W + 30) {
      const bw = 80 + r() * 90, bh = H * (hmin + r() * (hmax - hmin));
      ctx.fillStyle = tone[Math.floor(r() * tone.length)]; ctx.fillRect(x, base - bh, bw, bh);
      if (win) { ctx.fillStyle = win; for (let wy = base - bh + 20; wy < base - 28; wy += 32) for (let wx = x + 12; wx < x + bw - 20; wx += 26) ctx.fillRect(wx, wy, 13, 18); }
      x += bw + 5;
    }
  };

  api.scenes = {
    pump(ctx, { T }) {
      sky(ctx, '#7dc0ee', '#d9eefb');
      cloud(ctx, ((0.25 * W + T * 8) % (W + 300)) - 150, H * 0.12, 80); cloud(ctx, ((0.8 * W + T * 5) % (W + 300)) - 150, H * 0.2, 100);
      skyline(ctx, H * 0.6, 4, ['#8fb0cf', '#7f9fc0', '#9bbad6'], 'rgba(255,255,255,0.4)', 0.08, 0.2);
      ctx.fillStyle = '#d7282f'; ctx.fillRect(0, H * 0.035, W, H * 0.07); ctx.fillStyle = '#fff'; ctx.fillRect(0, H * 0.085, W, H * 0.014);   // canopy
      ctx.fillStyle = '#8a8f99'; ctx.fillRect(W * 0.06, H * 0.1, W * 0.03, H * 0.62); ctx.fillRect(W * 0.91, H * 0.1, W * 0.03, H * 0.62);
      ctx.fillStyle = '#c9ccd2'; ctx.fillRect(0, H * 0.72, W, H * 0.04);
      ctx.fillStyle = '#4d5058'; ctx.fillRect(0, H * 0.76, W, H);
      ctx.strokeStyle = '#f3f3f3'; ctx.lineWidth = 8; ctx.setLineDash([46, 34]); ctx.beginPath(); ctx.moveTo(0, H * 0.9); ctx.lineTo(W, H * 0.9); ctx.stroke(); ctx.setLineDash([]);
    },
    station(ctx, { T }) {
      sky(ctx, '#bcdcf3', '#eef6fb');
      cloud(ctx, ((0.3 * W + T * 6) % (W + 300)) - 150, H * 0.14, 90);
      skyline(ctx, H * 0.6, 9, ['#a9bfd3', '#9db5cb'], null, 0.05, 0.14);
      ctx.fillStyle = '#4d5360'; ctx.beginPath(); ctx.moveTo(0, H * 0.02); ctx.lineTo(W, H * 0.02); ctx.lineTo(W, H * 0.12); ctx.lineTo(0, H * 0.17); ctx.closePath(); ctx.fill();   // roof
      ctx.fillStyle = '#383d48'; for (const x of [0.12, 0.5, 0.88]) ctx.fillRect(W * x - 12, H * 0.14, 24, H * 0.5);
      ctx.fillStyle = '#ffd23f'; roundRect(ctx, W * 0.3, H * 0.19, W * 0.4, H * 0.06, 10); ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = OUTLINE; ctx.stroke();
      ctx.fillStyle = OUTLINE; ctx.font = `800 ${40 * S}px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('PLATFORM 1', W / 2, H * 0.222);
      ctx.fillStyle = '#d9cfa8'; ctx.fillRect(0, H * 0.64, W, H * 0.12); ctx.fillStyle = '#b9ae86'; ctx.fillRect(0, H * 0.76, W, H * 0.03);
      ctx.fillStyle = '#ffd23f'; ctx.fillRect(0, H * 0.745, W, H * 0.012);
      ctx.fillStyle = '#6b6560'; ctx.fillRect(0, H * 0.79, W, H * 0.21);
      ctx.fillStyle = '#4a3a2a'; for (let x = -20; x < W + 40; x += 70) ctx.fillRect(x, H * 0.82, 40, H * 0.16);
      ctx.fillStyle = '#b8bcc4'; ctx.fillRect(0, H * 0.84, W, 10); ctx.fillRect(0, H * 0.92, W, 10);
      ctx.fillStyle = '#8a5a2b'; for (const x of [0.2, 0.8]) { roundRect(ctx, W * x - 80, H * 0.69, 160, 18, 6); ctx.fill(); ctx.fillRect(W * x - 70, H * 0.71, 12, 40); ctx.fillRect(W * x + 58, H * 0.71, 12, 40); }
    },
    shop(ctx, { T }) {
      sky(ctx, '#ffe9b8', '#ffd98a');
      for (let i = 0; i < 12; i++) { ctx.fillStyle = i % 2 ? '#fff' : '#d7282f'; ctx.fillRect((W / 12) * i, H * 0.06, W / 12 + 1, H * 0.1); }
      ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.fillRect(0, H * 0.16, W, H * 0.02);
      ctx.fillStyle = '#c98a4b'; ctx.fillRect(W * 0.05, H * 0.28, W * 0.9, 14); ctx.fillRect(W * 0.05, H * 0.4, W * 0.9, 14);
      const r = rng(5); for (let i = 0; i < 12; i++) { ctx.fillStyle = ['#e8590c', '#2b8a3e', '#1c7ed6', '#f08c00'][Math.floor(r() * 4)]; roundRect(ctx, W * 0.08 + i * 78, H * 0.28 - 70, 52, 70, 8); ctx.fill(); roundRect(ctx, W * 0.08 + i * 78, H * 0.4 - 70, 52, 70, 8); ctx.fill(); }
      ctx.fillStyle = '#8a5a2b'; ctx.fillRect(0, H * 0.62, W, H * 0.13); ctx.fillStyle = '#a8713a'; ctx.fillRect(0, H * 0.62, W, 16);
      ctx.fillStyle = '#cbb68e'; ctx.fillRect(0, H * 0.75, W, H);
    },
    space(ctx, { W, H, T }) {
      const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#070b24'); g.addColorStop(0.6, '#1d1650'); g.addColorStop(1, '#3a2470'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      const r = rng(21);
      for (let i = 0; i < 90; i++) { const x = r() * W, y = r() * H, tw = 0.4 + 0.6 * Math.abs(Math.sin(T * (1 + r() * 2) + i)); ctx.fillStyle = `rgba(255,255,255,${tw})`; ctx.beginPath(); ctx.arc(x, y, 1.2 + r() * 2.6, 0, TAU); ctx.fill(); }
    },
    stadium(ctx, { W, H, t, T, emptyAt = 1e9, emptyDur = 2.6 }) {
      sky(ctx, '#1d2b5a', '#6d8fd8');
      const r = rng(13), p = clamp((t - emptyAt) / emptyDur);
      for (let row = 0; row < 7; row++) {
        const y = H * (0.2 + row * 0.058);
        ctx.fillStyle = row % 2 ? '#3a4a7a' : '#46578a'; ctx.beginPath(); ctx.ellipse(W / 2, y + 70, W * (0.62 + row * 0.03), 60, 0, Math.PI, TAU); ctx.fill();
        for (let i = 0; i < 64; i++) {
          const a = Math.PI + (i + 0.5) * (Math.PI / 64), rx = W * (0.55 + row * 0.03), x = W / 2 + Math.cos(a) * rx * 0.92, yy = y + 60 + Math.sin(a) * 52;
          const keep = r(), col = ['#ffd23f', '#ff6b6b', '#4dd2ff', '#ffffff', '#7cff6b', '#ff9f1c'][Math.floor(r() * 6)];
          if (keep > p) { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, yy + Math.sin(T * 5 + i) * 1.5 * (1 - p), 10, 0, TAU); ctx.fill(); }
        }
      }
      for (const x of [0.08, 0.92]) { ctx.fillStyle = '#9aa3b8'; ctx.fillRect(W * x - 6, H * 0.06, 12, H * 0.42); const g = ctx.createRadialGradient(W * x, H * 0.07, 4, W * x, H * 0.07, 150); g.addColorStop(0, 'rgba(255,255,230,0.95)'); g.addColorStop(1, 'rgba(255,255,230,0)'); ctx.fillStyle = g; ctx.fillRect(W * x - 160, 0, 320, 300); }
      ctx.fillStyle = '#2e9d4f'; ctx.beginPath(); ctx.ellipse(W / 2, H * 0.78, W * 0.75, H * 0.2, 0, 0, TAU); ctx.fill();
      for (let i = 0; i < 6; i++) { ctx.fillStyle = i % 2 ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'; ctx.fillRect(0, H * (0.6 + i * 0.065), W, H * 0.065); }
      ctx.fillStyle = '#d9b77c'; roundRect(ctx, W * 0.43, H * 0.66, W * 0.14, H * 0.22, 14); ctx.fill();
      ctx.fillStyle = '#fff'; for (const x of [-1, 0, 1]) ctx.fillRect(W / 2 + x * 22 - 4, H * 0.64, 8, H * 0.06);
    },
    smog(ctx, { W, H, t, T, clearAt = 0, clearDur = 2.2 }) {
      const p = inOut(clamp((t - clearAt) / clearDur));
      const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, lerpColor('#85796c', '#3f9be8', p)); g.addColorStop(0.6, lerpColor('#b3a487', '#a9dcff', p)); g.addColorStop(1, lerpColor('#c9b998', '#e6f5ff', p));
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      const sg = ctx.createRadialGradient(W * 0.75, H * 0.2, 5, W * 0.75, H * 0.2, mix(120, 230, p)); sg.addColorStop(0, `rgba(255,${mix(190, 245, p)},${mix(120, 200, p)},${mix(0.55, 1, p)})`); sg.addColorStop(1, 'rgba(255,230,170,0)'); ctx.fillStyle = sg; ctx.fillRect(0, 0, W, H * 0.6);
      cloud(ctx, ((0.3 * W + T * 9) % (W + 300)) - 150, H * 0.14, 90, p * 0.85);
      skyline(ctx, H * 0.66, 17, [lerpColor('#6b645c', '#7d99b8', p), lerpColor('#5d564f', '#6c88a8', p)], `rgba(255,255,255,${mix(0.12, 0.45, p)})`, 0.1, 0.26);
      // the Red Fort: a long wall with battlements, two small domes and a gate
      const wy = H * 0.66, wc = lerpColor('#7b4a3d', '#c4573a', p), wd = lerpColor('#5e382f', '#9e4128', p);
      ctx.fillStyle = wc; ctx.fillRect(W * 0.1, wy - H * 0.12, W * 0.8, H * 0.12);
      ctx.fillStyle = wd; for (let x = W * 0.1; x < W * 0.9 - 14; x += 34) ctx.fillRect(x, wy - H * 0.12 - 18, 20, 18);
      ctx.beginPath(); ctx.moveTo(W * 0.42, wy); ctx.lineTo(W * 0.42, wy - H * 0.07); ctx.arc(W / 2, wy - H * 0.07, W * 0.08, Math.PI, 0); ctx.lineTo(W * 0.58, wy); ctx.closePath(); ctx.fillStyle = wd; ctx.fill();
      ctx.fillStyle = wc; for (const x of [0.2, 0.8]) { ctx.fillRect(W * x - 28, wy - H * 0.2, 56, H * 0.08); ctx.beginPath(); ctx.arc(W * x, wy - H * 0.2, 28, Math.PI, 0); ctx.fill(); }
      ctx.fillStyle = lerpColor('#6b645c', '#4c6a8c', p); ctx.fillRect(0, H * 0.66, W, H * 0.34);
      ctx.fillStyle = lerpColor('#3d3a37', '#4d5058', p); ctx.fillRect(0, H * 0.78, W, H * 0.22);
      const hz = ctx.createLinearGradient(0, 0, 0, H); hz.addColorStop(0, `rgba(150,135,110,${(1 - p) * 0.55})`); hz.addColorStop(1, `rgba(150,135,110,${(1 - p) * 0.3})`); ctx.fillStyle = hz; ctx.fillRect(0, 0, W, H);
      if (p < 1) { const r = rng(3); ctx.fillStyle = `rgba(110,95,75,${(1 - p) * 0.35})`; for (let i = 0; i < 26; i++) { const x = ((r() * W + T * (10 + r() * 20)) % (W + 200)) - 100, y = r() * H * 0.85; ctx.beginPath(); ctx.ellipse(x, y, 90 + r() * 90, 30 + r() * 26, 0, 0, TAU); ctx.fill(); } }
    },
  };

  // ---- objects ------------------------------------------------------------------------------------------------------

  Object.assign(api, {
    // A round planet (or moon): f.planet({ x, y, r, color: '#d1593a' }).
    planet({ x = 0.5, y = 0.3, r = 150, color = '#d1593a', ring = false, at = 0, out, sound } = {}) {
      sfx({ sound }, 'pop', at, 0.18);
      layer({ at, out, enter: 'none' }, (ctx) => {
        const k = backOut(clamp((s.t - at) / 0.4)), R = r * S * k;
        ctx.save(); ctx.translate(W * x, H * y + Math.sin(s.T * 1.2) * 6);
        const g = ctx.createRadialGradient(-R * 0.35, -R * 0.35, R * 0.1, 0, 0, R); g.addColorStop(0, '#ffffff55'); g.addColorStop(0.15, color); g.addColorStop(1, '#00000066');
        ctx.beginPath(); ctx.arc(0, 0, R, 0, TAU); ctx.fillStyle = color; ctx.fill(); ctx.fillStyle = g; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = OUTLINE; ctx.stroke();
        ctx.fillStyle = 'rgba(0,0,0,0.12)'; for (const [dx, dy, rr] of [[-0.3, 0.2, 0.18], [0.35, -0.25, 0.12], [0.1, 0.45, 0.1]]) { ctx.beginPath(); ctx.arc(dx * R, dy * R, rr * R, 0, TAU); ctx.fill(); }
        if (ring) { ctx.lineWidth = R * 0.12; ctx.strokeStyle = 'rgba(240,220,170,0.85)'; ctx.beginPath(); ctx.ellipse(0, 0, R * 1.7, R * 0.45, -0.3, 0, TAU); ctx.stroke(); }
        ctx.restore();
      });
    },

    // A big emoji at a spot of the frame. to: { x, y } slides it there from `moveAt`. cross: true marks it with a red X at crossAt.
    emoji(char, o = {}) {
      const { x = 0.5, y = 0.5, size = 150, at = 0, out, to = null, dur = 0.9, moveAt = at + 0.3, pop = true, shake = 0, rot = 0, flip = false, cross = false, bob = 0 } = o;
      sfx(o, 'pop', at, 0.18); if (cross) sfx(o, 'thud', o.crossAt ?? at + 1, 0.25);
      layer({ at, out, enter: 'none' }, (ctx) => {
        const age = s.t - at, k = pop ? backOut(clamp(age / 0.3)) : 1;
        const q = to ? inOut(clamp((s.t - moveAt) / dur)) : 0;
        const px = W * mix(x, to?.x ?? x, q), py = H * mix(y, to?.y ?? y, q) + Math.sin(s.T * 3 + x * 9) * bob;
        ctx.save(); ctx.translate(px + (shake ? Math.sin(s.T * 60) * shake : 0), py); ctx.rotate(rot * Math.PI / 180); ctx.scale((flip ? -1 : 1) * k * S, k * S);
        ctx.font = `${size}px ${EMOJI}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 14; ctx.shadowOffsetY = 6;
        ctx.fillText(char, 0, 0);
        if (cross && s.t >= (o.crossAt ?? at + 1)) {
          const c = easeOut(clamp((s.t - (o.crossAt ?? at + 1)) / 0.2)), r = size * 0.5 * c; ctx.shadowColor = 'transparent'; ctx.lineCap = 'round';
          for (const [w, col] of [[size * 0.2, '#fff'], [size * 0.13, '#d7282f']]) { ctx.lineWidth = w; ctx.strokeStyle = col; ctx.beginPath(); ctx.moveTo(-r, -r); ctx.lineTo(r, r); ctx.moveTo(r, -r); ctx.lineTo(-r, r); ctx.stroke(); }
        }
        ctx.restore();
      });
    },

    // A row of emojis popping in one after another, centred on x0.
    emojiRow(chars, o = {}) {
      const { x0 = 0.5, y = 0.5, size = 130, stagger = 0.22, at = 0 } = o, gap = o.gap ?? (size * 1.2) / W;
      chars.forEach((c, i) => api.emoji(c, { ...o, x: x0 + (i - (chars.length - 1) / 2) * gap, y, size, at: at + i * stagger }));
    },

    // One giant number or word ("85%", "7 DAYS") with an optional small line under it.
    big(text, o = {}) {
      const { at = 0, out, x = 0.5, y = 0.45, size = 190, color = '#ffd23f', sub, rot = -3 } = o;
      sfx(o, 'thud', at, 0.3);
      layer({ at, out, enter: 'none' }, (ctx) => {
        const p = backOut(clamp((s.t - at) / 0.32));
        ctx.save(); ctx.translate(W * x, H * y); ctx.rotate(rot * Math.PI / 180); ctx.scale(p, p);
        toon(ctx, text, 0, 0, size * S, { color, stroke: 0.16 });
        if (sub) toon(ctx, sub, 0, size * S * 0.66, o.subSize ?? Math.min(size * 0.2, 54) * S, { color: '#fff', stroke: 0.2 });
        ctx.restore();
      });
    },

    // A red X (or a "no" sign) that scratches over a spot.
    cross({ x = 0.5, y = 0.5, size = 220, at = 0, out, sound } = {}) {
      sfx({ sound }, 'thud', at, 0.25);
      layer({ at, out, enter: 'none' }, (ctx) => {
        const c = easeOut(clamp((s.t - at) / 0.22)), r = size * 0.5 * c;
        ctx.save(); ctx.translate(W * x, H * y); ctx.lineCap = 'round'; ctx.shadowColor = 'rgba(0,0,0,0.4)'; ctx.shadowBlur = 10;
        for (const [w, col] of [[size * 0.2, '#fff'], [size * 0.13, '#d7282f']]) { ctx.lineWidth = w; ctx.strokeStyle = col; ctx.beginPath(); ctx.moveTo(-r, -r); ctx.lineTo(r, r); ctx.moveTo(r, -r); ctx.lineTo(-r, r); ctx.stroke(); }
        ctx.restore();
      });
    },

    // A plate that slams on at an angle: "NO SIGNAL", "CANCELLED", "CLOSED".
    banner(text, o = {}) {
      const { at = 0, out, x = 0.5, y = 0.5, size = 70, color = '#d7282f', rot = -6, fill = '#fff' } = o;
      sfx(o, 'thud', at + 0.12, 0.35); sfx(o, 'whoosh', at, 0.15);
      layer({ at, out, enter: 'none' }, (ctx) => {
        const age = s.t - at, k = 1 + 0.9 * (1 - easeOut(clamp(age / 0.14)));
        ctx.save(); ctx.translate(W * x, H * y); ctx.rotate(rot * Math.PI / 180); ctx.scale(k, k); ctx.globalAlpha *= clamp(age / 0.08);
        ctx.font = `800 ${size * S}px ${FONT}`; const w = ctx.measureText(text).width + size * S * 0.9, hh = size * S * 1.5;
        ctx.shadowColor = 'rgba(0,0,0,0.4)'; ctx.shadowBlur = 14; ctx.shadowOffsetY = 8;
        roundRect(ctx, -w / 2, -hh / 2, w, hh, hh * 0.18); ctx.fillStyle = fill; ctx.fill(); ctx.shadowColor = 'transparent';
        ctx.lineWidth = size * S * 0.09; ctx.strokeStyle = color; ctx.stroke();
        ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 0, size * S * 0.04);
        ctx.restore();
      });
    },

    // A fat arrow that bounces up (prices) or down.
    arrowUp({ x = 0.5, y = 0.5, size = 260, at = 0, out, down = false, color = '#e5342d', sound } = {}) {
      sfx({ sound }, 'rise', at, 0.18);
      layer({ at, out, enter: 'none' }, (ctx) => {
        const p = backOut(clamp((s.t - at) / 0.4)), bob = Math.sin(s.T * 6) * 8;
        ctx.save(); ctx.translate(W * x, H * y + bob); ctx.scale(p, down ? -p : p);
        ctx.beginPath(); ctx.moveTo(0, -size / 2); ctx.lineTo(size * 0.45, -size * 0.02); ctx.lineTo(size * 0.17, -size * 0.02); ctx.lineTo(size * 0.17, size / 2); ctx.lineTo(-size * 0.17, size / 2); ctx.lineTo(-size * 0.17, -size * 0.02); ctx.lineTo(-size * 0.45, -size * 0.02); ctx.closePath();
        ctx.shadowColor = 'rgba(0,0,0,0.4)'; ctx.shadowBlur = 12; ctx.fillStyle = color; ctx.fill(); ctx.shadowColor = 'transparent'; ctx.lineJoin = 'round'; ctx.lineWidth = size * 0.05; ctx.strokeStyle = '#fff'; ctx.stroke();
        ctx.restore();
      });
    },

    // A line of emojis (cars, people) that keeps growing from the right. items cycle; the first stands at x0.
    queue({ y = 0.78, items = ['🚗'], n = 8, at = 0, gap = 0.35, size = 120, x0 = 0.14, spacing, out, sound } = {}) {
      const sp = spacing ?? (size * 1.02) / W;
      for (let i = 0; i < n; i += 2) sfx({ sound }, 'whoosh', at + i * gap, 0.08);
      layer({ at, out, enter: 'none' }, (ctx) => {
        ctx.font = `${size * S}px ${EMOJI}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        for (let i = 0; i < n; i++) {
          const born = at + i * gap, q = easeOut(clamp((s.t - born) / 0.6)); if (s.t < born) continue;
          const fx = x0 + i * sp, px = W * mix(1.15, fx, q);
          ctx.save(); ctx.translate(px, H * y + Math.sin(s.T * 4 + i) * 1.5); ctx.shadowColor = 'rgba(0,0,0,0.3)'; ctx.shadowBlur = 8; ctx.fillText(items[i % items.length], 0, 0); ctx.restore();
        }
      });
    },

    // A cartoon petrol pump. dry: true shows EMPTY and a NO PETROL sign from dryAt.
    pump({ x = 0.22, y = 0.76, h = 0.36, at = 0, out, dryAt = 1e9, label = 'PETROL' } = {}) {
      sfx({}, 'pop', at, 0.2); if (dryAt < s.dur) sfx({}, 'error', dryAt, 0.14);
      layer({ at, out, enter: 'none' }, (ctx) => {
        const u = (H * h) / 10, k = backOut(clamp((s.t - at) / 0.3)), dry = s.t >= dryAt;
        ctx.save(); ctx.translate(W * x, H * y); ctx.scale(u * k, u * k); ctx.lineJoin = 'round';
        ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.beginPath(); ctx.ellipse(0, 0, 3.2, 0.5, 0, 0, TAU); ctx.fill();
        roundRect(ctx, -2.1, -9.2, 4.2, 9.0, 0.5); ctx.fillStyle = '#d7282f'; ctx.fill(); ctx.lineWidth = 0.16; ctx.strokeStyle = OUTLINE; ctx.stroke();
        roundRect(ctx, -2.4, -9.6, 4.8, 0.8, 0.3); ctx.fillStyle = '#9c1b21'; ctx.fill(); ctx.stroke();
        roundRect(ctx, -1.6, -8.5, 3.2, 2.0, 0.2); ctx.fillStyle = '#10161c'; ctx.fill(); ctx.stroke();
        ctx.font = `800 1.05px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        if (dry) { ctx.fillStyle = (Math.floor(s.T * 3) % 2) ? '#ff4b4b' : '#7a1d1d'; ctx.fillText('EMPTY', 0, -7.5); }
        else { ctx.fillStyle = '#6dff8a'; ctx.fillText((((s.T * 37) % 100)).toFixed(2).padStart(5, '0'), 0, -7.5); }
        roundRect(ctx, -1.6, -5.9, 3.2, 1.4, 0.2); ctx.fillStyle = '#fff'; ctx.fill(); ctx.stroke(); ctx.fillStyle = '#d7282f'; ctx.font = `800 0.7px ${FONT}`; ctx.fillText(label, 0, -5.2);
        ctx.fillStyle = '#9c1b21'; ctx.fillRect(-2.1, -3.0, 4.2, 0.35);
        ctx.beginPath(); ctx.moveTo(2.1, -5.0); ctx.bezierCurveTo(3.6, -4.8, 3.2, -2.4, 3.9, -2.0); ctx.lineWidth = 0.32; ctx.strokeStyle = OUTLINE; ctx.stroke(); ctx.lineWidth = 0.2; ctx.strokeStyle = '#2d2f35'; ctx.stroke();
        roundRect(ctx, 3.5, -2.3, 0.9, 1.5, 0.2); ctx.fillStyle = '#7b8190'; ctx.fill(); ctx.lineWidth = 0.1; ctx.strokeStyle = OUTLINE; ctx.stroke();
        if (dry) {                                                            // hanging sign
          const sw = Math.sin((s.t - dryAt) * 5) * 0.06 * Math.max(0, 1 - (s.t - dryAt) / 2), p = backOut(clamp((s.t - dryAt) / 0.3));
          ctx.save(); ctx.translate(0, -3.0); ctx.rotate(sw); ctx.scale(p, p); roundRect(ctx, -1.8, 0, 3.6, 1.9, 0.2); ctx.fillStyle = '#fff'; ctx.fill(); ctx.lineWidth = 0.14; ctx.strokeStyle = '#d7282f'; ctx.stroke();
          ctx.fillStyle = '#d7282f'; ctx.font = `800 0.62px ${FONT}`; ctx.fillText('NO', 0, 0.6); ctx.fillText('PETROL', 0, 1.3); ctx.restore();
        }
        ctx.restore();
      });
    },

    // A phone. screens: [{ at, kind }] where kind is 'pay', 'failed', 'ok', 'nosignal', 'chat' or 'maps'.
    phone({ x = 0.5, y = 0.5, h = 0.5, at = 0, out, screens = [{ at: 0, kind: 'pay' }], tilt = -4, sound } = {}) {
      sfx({ sound }, 'pop', at, 0.2); screens.forEach((sc, i) => { if (i) sfx({ sound }, sc.kind === 'ok' ? 'chime' : 'error', sc.at, 0.2); });
      layer({ at, out, enter: 'none' }, (ctx) => {
        const ph = H * h, pw = ph * 0.52, k = backOut(clamp((s.t - at) / 0.35));
        const cur = [...screens].reverse().find((sc) => s.t >= sc.at) ?? screens[0], age = s.t - cur.at;
        ctx.save(); ctx.translate(W * x, H * y); ctx.rotate(tilt * Math.PI / 180); ctx.scale(k, k);
        ctx.shadowColor = 'rgba(0,0,0,0.4)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 18;
        roundRect(ctx, -pw / 2, -ph / 2, pw, ph, pw * 0.14); ctx.fillStyle = '#161a24'; ctx.fill(); ctx.shadowColor = 'transparent'; ctx.lineWidth = 6; ctx.strokeStyle = '#0a0c12'; ctx.stroke();
        const sw = pw * 0.9, sh = ph * 0.92; ctx.save(); roundRect(ctx, -sw / 2, -sh / 2, sw, sh, pw * 0.1); ctx.clip();
        const bg = { pay: '#f4f6fb', failed: '#fff1f0', ok: '#effaf1', nosignal: '#eceff4', chat: '#e9f2ff', maps: '#e8f1e4' }[cur.kind] ?? '#f4f6fb'; ctx.fillStyle = bg; ctx.fillRect(-sw / 2, -sh / 2, sw, sh);
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; const u = sw / 10;
        if (cur.kind === 'pay') { ctx.fillStyle = '#1c2540'; ctx.font = `800 ${u * 0.9}px ${FONT}`; ctx.fillText('Pay', 0, -sh * 0.32); ctx.font = `800 ${u * 1.8}px ${FONT}`; ctx.fillText('₹ 250', 0, -sh * 0.12); roundRect(ctx, -sw * 0.35, sh * 0.15, sw * 0.7, u * 1.6, u * 0.8); ctx.fillStyle = '#2f9e44'; ctx.fill(); ctx.fillStyle = '#fff'; ctx.font = `800 ${u * 0.95}px ${FONT}`; ctx.fillText('PAY NOW', 0, sh * 0.15 + u * 0.8); }
        else if (cur.kind === 'failed') { const p = backOut(clamp(age / 0.3)); ctx.save(); ctx.translate(0, -sh * 0.1); ctx.scale(p, p); ctx.beginPath(); ctx.arc(0, 0, sw * 0.26, 0, TAU); ctx.fillStyle = '#e5342d'; ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = u * 0.5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-sw * 0.1, -sw * 0.1); ctx.lineTo(sw * 0.1, sw * 0.1); ctx.moveTo(sw * 0.1, -sw * 0.1); ctx.lineTo(-sw * 0.1, sw * 0.1); ctx.stroke(); ctx.restore(); ctx.fillStyle = '#c92a2a'; ctx.font = `800 ${u * 1.0}px ${FONT}`; ctx.fillText('PAYMENT', 0, sh * 0.2); ctx.fillText('FAILED', 0, sh * 0.2 + u * 1.2); }
        else if (cur.kind === 'ok') { const p = backOut(clamp(age / 0.3)); ctx.save(); ctx.translate(0, -sh * 0.1); ctx.scale(p, p); ctx.beginPath(); ctx.arc(0, 0, sw * 0.26, 0, TAU); ctx.fillStyle = '#2f9e44'; ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = u * 0.55; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(-sw * 0.11, 0); ctx.lineTo(-sw * 0.02, sw * 0.09); ctx.lineTo(sw * 0.12, -sw * 0.08); ctx.stroke(); ctx.restore(); ctx.fillStyle = '#2b8a3e'; ctx.font = `800 ${u * 1.1}px ${FONT}`; ctx.fillText('PAID', 0, sh * 0.2); }
        else if (cur.kind === 'nosignal') { ctx.save(); ctx.translate(0, -sh * 0.12); for (let i = 0; i < 4; i++) { const bh = u * (1 + i * 0.9), bx = -u * 2.6 + i * u * 1.4; ctx.fillStyle = '#c3c8d2'; roundRect(ctx, bx, u * 2 - bh, u * 0.9, bh, 4); ctx.fill(); } ctx.lineCap = 'round'; ctx.strokeStyle = '#e5342d'; ctx.lineWidth = u * 0.5; ctx.beginPath(); ctx.moveTo(-u * 3.3, -u * 1.2); ctx.lineTo(u * 3.3, u * 2.6); ctx.stroke(); ctx.restore(); ctx.fillStyle = '#5c6270'; ctx.font = `800 ${u * 1.0}px ${FONT}`; ctx.fillText('NO SERVICE', 0, sh * 0.2); }
        else if (cur.kind === 'chat') { for (let i = 0; i < 3; i++) { const side = i % 2 ? 1 : -1, by = -sh * 0.28 + i * sh * 0.2; roundRect(ctx, side > 0 ? sw * 0.02 : -sw * 0.44, by, sw * 0.42, sh * 0.13, 14); ctx.fillStyle = side > 0 ? '#d3f0c8' : '#fff'; ctx.fill(); ctx.fillStyle = '#9aa3b5'; for (let d = 0; d < 3; d++) { ctx.beginPath(); ctx.arc((side > 0 ? sw * 0.23 : -sw * 0.23) + (d - 1) * u * 0.6, by + sh * 0.065, u * 0.22, 0, TAU); ctx.fill(); } } if (age > 0.6) { ctx.fillStyle = '#e5342d'; ctx.font = `${u * 1.7}px ${EMOJI}`; ctx.fillText('⏳', 0, sh * 0.38); } }
        else if (cur.kind === 'maps') { ctx.strokeStyle = '#fff'; ctx.lineWidth = u * 0.7; ctx.beginPath(); ctx.moveTo(-sw / 2, -sh * 0.1); ctx.lineTo(sw / 2, sh * 0.05); ctx.moveTo(-sw * 0.1, -sh / 2); ctx.lineTo(sw * 0.15, sh / 2); ctx.stroke(); ctx.fillStyle = '#e5342d'; ctx.beginPath(); ctx.arc(0, -sh * 0.05, u * 0.8, 0, TAU); ctx.fill(); }
        ctx.restore(); ctx.restore();
      });
    },

    // A shop QR board on a stand: "SCAN & PAY".
    qr({ x = 0.5, y = 0.6, size = 360, at = 0, out, sound } = {}) {
      sfx({ sound }, 'pop', at, 0.2);
      layer({ at, out, enter: 'none' }, (ctx) => {
        const k = backOut(clamp((s.t - at) / 0.3)), r = rng(77), g = 9;
        ctx.save(); ctx.translate(W * x, H * y); ctx.scale(k * S, k * S);
        ctx.fillStyle = '#6b4a2a'; ctx.fillRect(-14, size * 0.5, 28, size * 0.32);
        roundRect(ctx, -size / 2, -size * 0.58, size, size * 1.12, 24); ctx.fillStyle = '#1c2a5e'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = OUTLINE; ctx.stroke();
        ctx.fillStyle = '#fff'; ctx.font = `800 ${size * 0.11}px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('SCAN & PAY', 0, -size * 0.47);
        roundRect(ctx, -size * 0.4, -size * 0.38, size * 0.8, size * 0.8, 12); ctx.fillStyle = '#fff'; ctx.fill();
        const c = (size * 0.7) / g; ctx.fillStyle = '#111';
        for (let i = 0; i < g; i++) for (let j = 0; j < g; j++) { const corner = (i < 3 && j < 3) || (i > g - 4 && j < 3) || (i < 3 && j > g - 4); if (corner || r() > 0.5) ctx.fillRect(-size * 0.35 + i * c, -size * 0.33 + j * c, c * 0.92, c * 0.92); }
        ctx.restore();
      });
    },

    // A wall clock whose hands race. hoursPerSec: how many hours pass each second.
    clock({ x = 0.5, y = 0.4, r = 130, at = 0, out, hoursPerSec = 2, start = 9, sound } = {}) {
      sfx({ sound }, 'pop', at, 0.2);
      layer({ at, out, enter: 'none' }, (ctx) => {
        const k = backOut(clamp((s.t - at) / 0.3)), hrs = start + (s.t - at) * hoursPerSec;
        ctx.save(); ctx.translate(W * x, H * y); ctx.scale(k * S, k * S); ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 16; ctx.shadowOffsetY = 8;
        ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fillStyle = '#fff'; ctx.fill(); ctx.shadowColor = 'transparent'; ctx.lineWidth = r * 0.1; ctx.strokeStyle = '#2a2f3a'; ctx.stroke();
        ctx.lineCap = 'round'; ctx.strokeStyle = '#2a2f3a'; for (let i = 0; i < 12; i++) { const a = (i / 12) * TAU; ctx.lineWidth = i % 3 ? r * 0.03 : r * 0.06; ctx.beginPath(); ctx.moveTo(Math.sin(a) * r * 0.78, -Math.cos(a) * r * 0.78); ctx.lineTo(Math.sin(a) * r * 0.9, -Math.cos(a) * r * 0.9); ctx.stroke(); }
        const hand = (a, l, w, col) => { ctx.lineWidth = w; ctx.strokeStyle = col; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.sin(a) * l, -Math.cos(a) * l); ctx.stroke(); };
        hand((hrs / 12) * TAU, r * 0.5, r * 0.09, '#2a2f3a'); hand(hrs * TAU, r * 0.75, r * 0.06, '#2a2f3a'); hand(hrs * TAU * 12, r * 0.8, r * 0.025, '#d7282f');
        ctx.beginPath(); ctx.arc(0, 0, r * 0.07, 0, TAU); ctx.fillStyle = '#d7282f'; ctx.fill();
        ctx.restore();
      });
    },

    // A side-view train that can roll across: to: { x } slides it from x. Coaches 3 by default.
    train({ x = 0.2, y = 0.84, size = 1, coaches = 3, at = 0, out, to = null, dur = 2.0, moveAt = at, sound } = {}) {
      sfx({ sound }, 'whoosh', moveAt, 0.2);
      layer({ at, out, enter: 'none' }, (ctx) => {
        const q = to ? inOut(clamp((s.t - moveAt) / dur)) : 0, px = W * mix(x, to?.x ?? x, q), cw = 300 * S * size, ch = 150 * S * size;
        ctx.save(); ctx.translate(px, H * y); ctx.lineJoin = 'round';
        const car = (cx, col, front) => {
          roundRect(ctx, cx, -ch, cw * 0.95, ch * 0.85, ch * 0.12); ctx.fillStyle = col; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = OUTLINE; ctx.stroke();
          ctx.fillStyle = '#bfe6ff'; for (let i = 0; i < 4; i++) { roundRect(ctx, cx + cw * (0.07 + i * 0.22), -ch * 0.88, cw * 0.15, ch * 0.34, 8); ctx.fill(); ctx.stroke(); }
          ctx.fillStyle = '#ffd23f'; ctx.fillRect(cx, -ch * 0.3, cw * 0.95, ch * 0.08);
          ctx.fillStyle = '#2a2f3a'; for (const wx of [0.18, 0.78]) { ctx.beginPath(); ctx.arc(cx + cw * wx, -ch * 0.1, ch * 0.13, 0, TAU); ctx.fill(); }
          if (front) { ctx.fillStyle = '#fff6b0'; ctx.beginPath(); ctx.arc(cx + cw * 0.9, -ch * 0.55, ch * 0.06, 0, TAU); ctx.fill(); }
        };
        for (let i = 0; i < coaches; i++) car(i * cw, i === coaches - 1 ? '#d7282f' : '#2b6cb0', i === coaches - 1);
        ctx.restore();
      });
    },

    // Vertical bars that grow, with a label under each and a value on top. rows: [{ label, value, color, emoji, text }].
    // grow: { row, to, at, dur } lets one bar climb to a new value later.
    bars({ rows, at = 0, out, y = 0.72, h = 0.42, w = 0.72, max, grow = null, stagger = 0.6, sound } = {}) {
      const top = max ?? Math.max(...rows.map((r) => r.value), grow?.to ?? 0);
      rows.forEach((_, i) => sfx({ sound }, 'click', at + i * stagger, 0.18)); if (grow) sfx({ sound }, 'rise', grow.at, 0.2);
      layer({ at, out, enter: 'none' }, (ctx) => {
        const n = rows.length, slot = (W * w) / n, bw = slot * 0.62;
        rows.forEach((r, i) => {
          const q = easeOut(clamp((s.t - (at + i * stagger)) / 0.8)); if (s.t < at + i * stagger) return;
          let v = r.value; if (grow && grow.row === i) v = mix(r.value, grow.to, inOut(clamp((s.t - grow.at) / (grow.dur ?? 1.6))));
          const bh = (H * h * v) / top * q, cx = W * ((1 - w) / 2) + slot * (i + 0.5), by = H * y;
          ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.3)'; ctx.shadowBlur = 12; roundRect(ctx, cx - bw / 2, by - bh, bw, Math.max(bh, 2), 16); ctx.fillStyle = r.color ?? '#f2a516'; ctx.fill(); ctx.restore();
          ctx.lineWidth = 5; ctx.strokeStyle = OUTLINE; roundRect(ctx, cx - bw / 2, by - bh, bw, Math.max(bh, 2), 16); ctx.stroke();
          toon(ctx, r.label, cx, by + 46 * S, 44 * S, { color: '#fff', stroke: 0.2 });
          if (r.emoji) { ctx.font = `${bw * 0.5}px ${EMOJI}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(r.emoji, cx, by - bh - bw * 0.35); }
          const val = r.text && !(grow && grow.row === i && s.t > grow.at + 0.2) ? r.text : (grow && grow.row === i && s.t > grow.at + 0.2 ? (grow.text ?? r.text) : r.text);
          if (val) toon(ctx, val, cx, by - bh - (r.emoji ? bw * 0.8 : 38 * S), 44 * S, { color: '#ffd23f', stroke: 0.2 });
        });
      });
    },

    // A rocket that waits on the ground, shakes, then flies off the top with a smoke trail.
    rocket({ x = 0.5, y = 0.8, size = 0.4, at = 0, out, launchAt = 1, sound } = {}) {
      sfx({ sound }, 'pop', at, 0.2); sfx({ sound }, 'rise', launchAt - 1.0, 0.25); sfx({ sound }, 'thud', launchAt, 0.4); sfx({ sound }, 'whoosh', launchAt + 0.2, 0.3);
      layer({ at, out, enter: 'none' }, (ctx) => {
        const u = (H * size) / 10, age = s.t - launchAt, k = backOut(clamp((s.t - at) / 0.3));
        const lift = age > 0 ? Math.pow(age, 2.2) * 9 : 0, shake = age > -0.8 && age < 0.4 ? Math.sin(s.T * 90) * 0.06 * u : 0;
        ctx.save(); ctx.translate(W * x, H * y);
        if (age > 0) { for (let i = 0; i < 26; i++) { const a = age - i * 0.045; if (a < 0) continue; const py = Math.pow(a, 2.2) * 9 * u, r = (0.5 + a * 1.4) * u, al = Math.max(0, 0.7 - (age - a) * 0.5); ctx.fillStyle = `rgba(235,235,240,${al})`; ctx.beginPath(); ctx.arc(Math.sin(i * 2.1) * u * 0.5, -py * 0 + (-py) + u * 1.5, r, 0, TAU); ctx.fill(); } }
        ctx.translate(shake, -lift * u); ctx.scale(u * k, u * k); ctx.lineJoin = 'round';
        if (age > -0.6) { const fl = 1 + Math.sin(s.T * 40) * 0.2; ctx.fillStyle = '#ff9f1c'; ctx.beginPath(); ctx.moveTo(-0.9, 0); ctx.lineTo(0, 2.6 * fl); ctx.lineTo(0.9, 0); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#ffe066'; ctx.beginPath(); ctx.moveTo(-0.5, 0); ctx.lineTo(0, 1.6 * fl); ctx.lineTo(0.5, 0); ctx.closePath(); ctx.fill(); }
        ctx.fillStyle = '#d7282f'; ctx.beginPath(); ctx.moveTo(-1.0, -1.2); ctx.lineTo(-2.0, 0.2); ctx.lineTo(-1.0, 0); ctx.closePath(); ctx.moveTo(1.0, -1.2); ctx.lineTo(2.0, 0.2); ctx.lineTo(1.0, 0); ctx.closePath(); ctx.fill(); ctx.lineWidth = 0.14; ctx.strokeStyle = OUTLINE; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-1.1, 0); ctx.lineTo(-1.1, -4.6); ctx.quadraticCurveTo(0, -7.6, 1.1, -4.6); ctx.lineTo(1.1, 0); ctx.closePath(); ctx.fillStyle = '#fbfbf7'; ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-1.1, -4.6); ctx.quadraticCurveTo(0, -7.6, 1.1, -4.6); ctx.quadraticCurveTo(0, -5.2, -1.1, -4.6); ctx.fillStyle = '#d7282f'; ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.arc(0, -3.1, 0.5, 0, TAU); ctx.fillStyle = '#7fd0ff'; ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#ff9933'; ctx.fillRect(-1.1, -1.5, 2.2, 0.35); ctx.fillStyle = '#138808'; ctx.fillRect(-1.1, -1.15, 2.2, 0.35);
        ctx.restore();
      });
    },

    // A big number that rolls from one value to another (population, money). decimals: digits after the point.
    countUp(from, to, { at = 0, dur = 2.2, out, x = 0.5, y = 0.3, size = 150, prefix = '', suffix = '', decimals = 0, color = '#ffd23f', sub, sound } = {}) {
      sfx({ sound }, 'rise', at, 0.18, { dur }); sfx({ sound }, 'ding', at + dur, 0.22);
      layer({ at, out, enter: 'none' }, (ctx) => {
        const p = easeOut(clamp((s.t - at) / dur)), v = mix(from, to, p), pop = backOut(clamp((s.t - at) / 0.3));
        ctx.save(); ctx.translate(W * x, H * y); ctx.scale(pop, pop);
        toon(ctx, `${prefix}${decimals || Math.abs(to) >= 10000 ? v.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) : v.toFixed(0)}${suffix}`, 0, 0, size * S, { color, stroke: 0.15 });
        if (sub) toon(ctx, sub, 0, size * S * 0.72, size * S * 0.3, { color: '#fff', stroke: 0.2 });
        ctx.restore();
      });
    },

    // The outline of a country or state, drawn flat on the screen: f.silhouette('India', { x, y, w, color }). Uses the official India outline.
    silhouette(name, { x = 0.5, y = 0.5, w = 0.5, color = '#f6b43a', at = 0, out, sound } = {}) {
      sfx({ sound }, 'pop', at, 0.2);
      layer({ at, out, enter: 'none' }, (ctx) => {
        const g = geometry(name, name === 'India' ? true : true), bw = g.box.x1 - g.box.x0, bh = g.box.y1 - g.box.y0, k = backOut(clamp((s.t - at) / 0.35));
        const fit = (W * w) / bw;
        ctx.save(); ctx.translate(W * x, H * y); ctx.scale(fit * k, fit * k); ctx.translate(-(g.box.x0 + g.box.x1) / 2, -(g.box.y0 + g.box.y1) / 2);
        trace(ctx, g.rings); ctx.shadowColor = 'rgba(0,0,0,0.4)'; ctx.shadowBlur = 14 / fit; ctx.fillStyle = color; ctx.fill(); ctx.shadowColor = 'transparent'; ctx.lineJoin = 'round'; ctx.lineWidth = 4 / fit; ctx.strokeStyle = OUTLINE; ctx.stroke();
        ctx.restore();
      });
    },

    // A crowd of dots on the map inside a circle that can grow: lon/lat is the centre, r0 and r1 are radii in degrees of latitude.
    crowd({ lon, lat, lon1 = lon, lat1 = lat, r0 = 0.12, r1 = r0, n = 600, at = 0, dur = 1.6, growAt = at + dur, growDur = 2.4, out, size = 5, colors = ['#ffd23f', '#ff6b6b', '#4dd2ff', '#ffffff', '#7cff6b'], sound } = {}) {
      sfx({ sound }, 'rise', at, 0.2, { dur }); if (r1 !== r0) sfx({ sound }, 'whoosh', growAt, 0.25);
      const r = rng(31), pts = Array.from({ length: n }, () => { const a = r() * TAU, d = Math.sqrt(r()); return [Math.cos(a) * d, Math.sin(a) * d, colors[Math.floor(r() * colors.length)]]; });
      s.draw({ at, out, enter: 'none', sfx: false }, (ctx) => {
        const p = clamp((s.t - at) / dur), shown = Math.floor(n * easeOut(p)), g = inOut(clamp((s.t - growAt) / growDur)), R = mix(r0, r1, g) * 14, cx = X(mix(lon, lon1, g)), cy = Y(mix(lat, lat1, g)), u = 1 / z;
        for (let i = 0; i < shown; i++) { const [px, py, col] = pts[i]; ctx.fillStyle = col; ctx.beginPath(); ctx.arc(cx + px * R * 1.1, cy + py * R, size * u, 0, TAU); ctx.fill(); }
      });
    },
  });
  return api;
}

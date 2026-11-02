// Helpers for "compare and move shapes" videos (India next to Japan, six countries inside India, a state beside a country).
// A shape moved to another latitude keeps its TRUE size and shape: a flat lon/lat map stretches things sideways away from the
// equator, so moved() re-projects every point (east-west distance shrinks or grows with the cosine of the latitude).
import { geometry } from './kit.js';

const R = Math.PI / 180;
const smooth = (q) => { q = Math.min(1, Math.max(0, q)); return q * q * q * (q * (q * 6 - 15) + 10); };

export function ringsOf(name, mainland = true) { return typeof name === 'string' ? geometry(name, mainland).rings : name; }

// The middle of a shape in [lon, lat] (the average of all its points).
export function centroid(rings) {
  let sx = 0; let sy = 0; let n = 0;
  for (const r of rings) for (let i = 0; i < r.length; i += 2) { sx += r[i]; sy += r[i + 1]; n++; }
  return [sx / n, sy / n];
}

// The same country (or state, or your own rings) with its middle at [lon, lat], true to size. scale: 1 is the real size,
// 2.3 makes it twice as wide and tall (5 times the area). rotate: degrees clockwise.
export function moved(name, { lon, lat, scale = 1, rotate = 0, mainland = true } = {}) {
  const rings = ringsOf(name, mainland);
  const [cLon, cLat] = centroid(rings);
  const kc = Math.cos(cLat * R); const kt = Math.cos(lat * R); const a = rotate * R;
  return rings.map((r) => {
    const out = [];
    for (let i = 0; i < r.length; i += 2) {
      const dx = (r[i] - cLon) * kc * scale; const dy = (r[i + 1] - cLat) * scale;
      const x = dx * Math.cos(a) + dy * Math.sin(a); const y = -dx * Math.sin(a) + dy * Math.cos(a);   // y up (north)
      out.push(lon + x / kt, lat + y);
    }
    return out;
  });
}

// Rings in kilometres from the middle (x east, y north), for drawing on the screen at an honest scale.
export function kmRings(name, mainland = true) {
  const rings = ringsOf(name, mainland); const [cLon, cLat] = centroid(rings); const kc = Math.cos(cLat * R);
  return rings.map((r) => { const o = []; for (let i = 0; i < r.length; i += 2) o.push((r[i] - cLon) * kc * 111.32, (r[i + 1] - cLat) * 110.57); return o; });
}

// Area in square kilometres (a check on the data, and for labels).
export function areaKm2(name, mainland = true) {
  let A = 0;
  for (const r of kmRings(name, mainland)) { let a = 0; for (let i = 0; i < r.length; i += 2) { const j = (i + 2) % r.length; a += r[i] * r[j + 1] - r[j] * r[i + 1]; } A += Math.abs(a) / 2; }
  return A;
}

// Offset function for c.shape: slides from [lon, lat] a to b between t0 and t0 + dur seconds after the shape's `at`.
export function slide(a, b, t0, dur) {
  return (t) => { const p = smooth((t - t0) / dur); return [a[0] + (b[0] - a[0]) * p, a[1] + (b[1] - a[1]) * p]; };
}

// Rings that cross the 180 degree line (Russia, Fiji) are drawn with a stray bar across the map. This moves the western-hemisphere points of such a
// ring past 180 (-170 becomes 190) so the shape is whole; the basemap ends at 180, so the far end is simply cut off.
export function unwrap(rings) {
  return rings.map((r) => {
    let lo = 1e9; let hi = -1e9;
    for (let i = 0; i < r.length; i += 2) { lo = Math.min(lo, r[i]); hi = Math.max(hi, r[i]); }
    if (hi - lo < 270) return r;
    return r.map((v, i) => (i % 2 === 0 && v < 0 ? v + 360 : v));
  });
}

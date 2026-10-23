// Converts Natural Earth countries (world-atlas, 1:50m) into a plain JS module.
// usage: node build-countries.mjs <out.js>
import fs from 'node:fs';
import { feature } from 'topojson-client';
const topo = JSON.parse(fs.readFileSync('node_modules/world-atlas/countries-50m.json', 'utf8'));
const fc = feature(topo, topo.objects.countries);
const r2 = (v) => Math.round(v * 100) / 100;
const out = [];
for (const f of fc.features) {
  const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
  const rings = [];
  for (const p of polys) {
    const flat = [];
    for (const [lon, lat] of p[0]) flat.push(r2(lon), r2(lat)); // outer ring only; holes are tiny lakes
    if (flat.length >= 8) rings.push(flat);
  }
  out.push({ name: f.properties.name, rings });
}
const body = '// Natural Earth countries (public domain) via the world-atlas package, 1:50m.\n// Each ring is a flat [lon, lat, lon, lat, ...] list.\nexport default ' + JSON.stringify(out) + ';\n';
fs.writeFileSync(process.argv[2], body);
console.log(out.length, 'countries,', (body.length / 1e6).toFixed(2), 'MB');

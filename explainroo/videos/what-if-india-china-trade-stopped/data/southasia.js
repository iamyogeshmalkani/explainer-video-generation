// Stylised lines for the South Asia videos (not surveyed): rivers, the Himalayan arc, borders, the Siliguri neck, sea routes. [lon, lat].
// Schematic maps: say so on screen. Disputed places: draw lines only, never fill China or Pakistan on a map that shows India.

// ---- the Indus system (western rivers go to Pakistan under the 1960 treaty, eastern rivers to India) ----
export const INDUS = [[81.7, 31.1], [79.5, 32.9], [77.6, 34.1], [76.0, 34.7], [75.0, 35.1], [74.6, 35.0], [73.6, 34.6], [72.7, 34.1], [72.25, 33.9], [71.6, 32.97], [70.9, 31.8], [70.8, 30.5], [69.7, 28.4], [68.85, 27.7], [68.3, 25.4], [67.4, 24.0]];
export const JHELUM = [[75.25, 33.5], [74.8, 34.1], [74.6, 34.35], [74.35, 34.2], [73.5, 34.35], [73.65, 33.15], [72.3, 31.2], [72.15, 31.15]];
export const CHENAB = [[77.0, 32.6], [75.8, 33.3], [74.7, 32.9], [74.5, 32.7], [72.9, 31.7], [72.15, 31.15], [71.0, 29.35], [70.45, 28.95]];
export const RAVI = [[77.2, 32.5], [76.1, 32.55], [75.65, 32.37], [74.3, 31.58], [71.9, 30.8]];
export const BEAS = [[77.2, 32.4], [77.2, 32.25], [76.9, 31.7], [75.95, 31.95], [74.95, 31.17]];
export const SUTLEJ = [[81.5, 30.7], [78.7, 31.8], [76.4, 31.4], [76.5, 30.97], [74.95, 31.17], [74.6, 30.95], [71.7, 29.4], [71.0, 29.35]];
export const WESTERN = { INDUS, JHELUM, CHENAB };
export const EASTERN = { RAVI, BEAS, SUTLEJ };
export const PUNJAB_PLAINS = [[71.0, 32.6], [72.8, 33.2], [74.6, 32.3], [75.2, 31.0], [73.2, 29.6], [71.0, 28.4], [69.2, 27.4], [67.9, 25.4], [68.6, 24.6], [70.2, 26.3], [70.4, 29.5]];   // the irrigated plains (rough)

// ---- the Ganga (for the glacier video) ----
export const GANGA = [[79.1, 30.9], [78.2, 29.95], [78.6, 28.5], [79.5, 27.2], [80.35, 26.45], [81.85, 25.45], [83.0, 25.3], [85.1, 25.6], [87.0, 25.2], [87.9, 24.8], [88.7, 24.2], [89.6, 23.6], [90.4, 23.2], [90.6, 22.5]];
export const HIMALAYA_LINE = [[73.5, 35.5], [75.5, 34.2], [77.5, 32.8], [79.5, 31.0], [81.5, 30.0], [83.5, 28.9], [85.5, 28.3], [87.5, 28.0], [89.5, 28.0], [91.5, 28.3], [93.5, 28.7], [95.5, 28.9], [97.0, 28.6]];

// A strip around a line, as a polygon: half a width (degrees of latitude) to each side.
export function strip(line, half) {
  const left = []; const right = [];
  line.forEach((p, i) => {
    const a = line[Math.max(0, i - 1)]; const b = line[Math.min(line.length - 1, i + 1)];
    const dx = b[0] - a[0]; const dy = b[1] - a[1]; const L = Math.hypot(dx, dy) || 1;
    left.push([p[0] - (dy / L) * half, p[1] + (dx / L) * half]); right.push([p[0] + (dy / L) * half, p[1] - (dx / L) * half]);
  });
  return [...left, ...right.reverse()];
}

// ---- India's land borders, one group per neighbour (schematic lines) ----
export const BORDERS = {
  Pakistan: [[[68.2, 23.75], [69.6, 24.25], [70.3, 25.2], [69.9, 26.3], [70.1, 27.6], [71.7, 28.0], [72.9, 29.0], [74.1, 29.7], [74.6, 30.9], [74.6, 31.6], [74.6, 32.5], [74.0, 33.0], [74.0, 33.9], [74.5, 34.6], [75.3, 35.0], [76.5, 35.6], [77.8, 35.5]]],
  China: [
    [[77.8, 35.5], [78.9, 34.4], [79.0, 33.1], [78.7, 32.4], [78.8, 31.7], [79.4, 31.0], [80.2, 30.5], [80.2, 30.2]],
    [[88.1, 27.85], [88.6, 28.1], [88.9, 27.9], [88.85, 27.35]],
    [[91.65, 27.8], [92.5, 28.2], [93.4, 28.6], [94.5, 29.2], [95.2, 29.1], [96.2, 28.5], [97.0, 28.3], [97.4, 28.2]],
  ],
  Nepal: [[[80.2, 30.2], [80.9, 29.3], [81.6, 28.7], [82.7, 28.0], [83.5, 27.5], [84.4, 27.3], [85.5, 26.8], [86.6, 26.5], [87.5, 26.4], [88.1, 26.5], [88.1, 27.85]]],
  Bhutan: [[[88.95, 26.9], [89.7, 26.7], [90.4, 26.85], [91.5, 26.8], [92.1, 26.9], [91.65, 27.8]]],
  Bangladesh: [[[88.2, 26.45], [88.6, 25.7], [88.2, 25.0], [88.6, 24.4], [88.9, 23.2], [88.7, 22.4], [89.0, 21.7]], [[89.8, 25.3], [90.7, 25.2], [92.0, 25.1], [92.4, 24.9], [92.0, 24.4], [91.2, 24.1], [91.4, 23.2], [92.2, 22.6]]],
  Myanmar: [[[97.4, 28.2], [96.5, 27.3], [95.9, 26.9], [95.0, 26.3], [94.7, 25.5], [94.4, 24.3], [93.4, 23.5], [93.3, 22.5], [93.0, 22.2]]],
};

// ---- Siliguri Corridor (the "Chicken's Neck"): a line along the narrow part, about 20 km wide ----
export const NECK = [[87.9, 26.62], [88.4, 26.58], [89.0, 26.5]];
export const NORTHEAST = ['Assam', 'Arunachal Pradesh', 'Nagaland', 'Manipur', 'Mizoram', 'Tripura', 'Meghalaya', 'Sikkim'];
export const NECK_ROAD = [[87.4, 26.4], [88.0, 26.55], [88.45, 26.6], [89.0, 26.5], [89.8, 26.35], [91.0, 26.2]];
export const NECK_RAIL = [[87.4, 26.5], [88.0, 26.62], [88.45, 26.68], [89.0, 26.58], [89.8, 26.45], [91.0, 26.3]];
export const NECK_PIPE = [[87.4, 26.3], [88.0, 26.5], [88.5, 26.52], [89.1, 26.42], [89.9, 26.28], [91.0, 26.12]];

// ---- sea trade: ports and a route round the peninsula ----
export const SEA_ROUTE = [[68.5, 22.3], [70.5, 19.6], [72.2, 18.6], [72.6, 15.5], [73.9, 12.4], [75.4, 9.4], [77.3, 7.6], [79.6, 8.2], [80.9, 12.4], [81.9, 15.6], [84.5, 18.7], [87.4, 21.0]];
export const PORTS = [['Mundra', 69.7, 22.8], ['Mumbai', 72.9, 18.95], ['Kochi', 76.2, 9.95], ['Chennai', 80.3, 13.1], ['Visakhapatnam', 83.3, 17.7], ['Kolkata', 88.1, 21.9]];

// ---- cities for the sea-level video ----
export const CITIES = { Mumbai: [72.88, 19.07], Kolkata: [88.36, 22.57], Chennai: [80.27, 13.08], Sundarbans: [89.0, 21.9] };
export const SUNDARBANS = [[88.6, 22.4], [89.4, 22.45], [90.1, 22.2], [90.0, 21.65], [89.2, 21.55], [88.7, 21.7]];

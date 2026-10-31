// Schematic geography for India videos, as [lon, lat] points. These are hand-placed approximations for a
// map explainer (rivers, ranges and regions are not survey-accurate). Say "approximate" if a viewer asks.
// The country outline itself comes from data/countries.js (Natural Earth): for a published video about borders,
// replace it with the official Survey of India map.
export const HIMALAYA = [[73.0, 35.5], [75.5, 34.5], [77.5, 33.2], [79.0, 31.5], [80.5, 30.3], [82.5, 29.3], [84.5, 28.6], [86.9, 28.0], [88.2, 27.8], [90.0, 27.7], [92.0, 28.0], [94.5, 28.6], [96.5, 28.2]];
export const GANGA = [[78.9, 30.99], [78.5, 30.2], [78.17, 29.95], [78.6, 28.8], [79.5, 27.5], [80.2, 26.6], [80.9, 26.0], [81.85, 25.43], [82.6, 25.3], [83.0, 25.32], [83.9, 25.5], [84.9, 25.6], [85.9, 25.4], [86.9, 25.1], [87.9, 24.8], [88.4, 24.2], [89.0, 23.7], [90.0, 23.2], [90.6, 22.5]];
export const BRAHMAPUTRA = [[82.0, 30.2], [85.0, 29.3], [88.0, 29.2], [90.5, 29.2], [93.0, 29.4], [94.8, 29.6], [95.3, 29.1], [95.0, 28.3], [94.5, 27.6], [93.5, 27.0], [92.0, 26.3], [91.0, 26.1], [90.0, 26.0], [89.7, 25.2], [89.7, 24.0], [90.3, 23.5]];
export const BRAHMAPUTRA_NEW = [[93.5, 27.0], [93.0, 26.4], [92.6, 25.7], [92.2, 25.0], [91.6, 24.6], [91.0, 24.2], [90.6, 23.8]];
export const GODAVARI = [[73.8, 19.99], [75.0, 19.6], [77.0, 19.2], [79.0, 18.9], [80.5, 17.9], [81.8, 17.1], [82.3, 16.7]];
export const KRISHNA = [[73.65, 17.9], [75.0, 17.2], [76.5, 16.5], [78.2, 16.2], [79.5, 16.0], [80.8, 15.8], [81.0, 15.7]];
export const THAR = [[69.8, 27.7], [71.5, 28.6], [73.5, 29.2], [75.0, 28.5], [75.2, 27.0], [74.5, 25.8], [72.8, 24.8], [70.8, 24.6], [70.0, 25.5]];
export const WESTERN_GHATS = [[73.4, 21.0], [73.3, 19.0], [73.6, 17.5], [74.2, 15.5], [74.8, 13.0], [75.6, 11.5], [76.6, 10.0], [77.2, 9.0], [77.5, 8.2]];
export const PLAINS = [[74.5, 31.5], [77.0, 31.0], [80.0, 29.5], [84.0, 27.5], [88.0, 26.8], [89.5, 25.5], [88.0, 24.0], [85.0, 24.5], [82.0, 24.5], [79.0, 26.0], [76.5, 27.5], [74.0, 29.0], [73.5, 30.5]];
export const SUNDARBANS = [[88.7, 21.9], [89.0, 22.3], [89.6, 22.5], [90.2, 22.2], [90.3, 21.8], [89.9, 21.7], [89.2, 21.6]];
export const CITIES = {
  delhi: [77.2, 28.6], mumbai: [72.83, 18.97], chennai: [80.27, 13.08], kolkata: [88.36, 22.57], kochi: [76.27, 9.93],
  varanasi: [83.0, 25.32], patna: [85.1, 25.6], kanpur: [80.35, 26.45], prayagraj: [81.85, 25.43], guwahati: [91.74, 26.14], jaipur: [75.8, 26.9],
};
export const INDUS = [[81.5, 31.0], [77.7, 34.1], [74.3, 35.0], [72.2, 33.5], [71.2, 30.5], [68.5, 26.0], [67.4, 24.0]];
// Belts around a ridge, used to "flatten" a range by painting over it.
const belt = (ridge, dN, dS, dE = 0) => [...ridge.map(([a, b]) => [a - dE, b + dN]), ...ridge.slice().reverse().map(([a, b]) => [a + dE, b - dS])];
export const HIMALAYA_BELT = belt(HIMALAYA, 1.6, 1.0);
export const WESTERN_GHATS_BELT = [...WESTERN_GHATS.map(([a, b]) => [a - 0.5, b]), ...WESTERN_GHATS.slice().reverse().map(([a, b]) => [a + 0.7, b])];

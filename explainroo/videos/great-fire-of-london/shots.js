// The picture list for "The Great Fire of London" (clay-stopmotion template).
// SHOTS are full-frame clay sets, PUPPETS are clay characters and props on a flat green background (see README.md).

export const STYLE = 'handmade claymation miniature set, plasticine and polymer clay, visible fingerprints and soft clay texture, warm dramatic lighting, shallow depth of field, 17th century London, a clear empty open space in the lower middle, no characters, no people, vertical 9:16, no text, no letters, no logos';
export const ASPECT = '9:16';

export const PUPPET_BG = 'bright green';
export const PUPPET_STYLE = `handmade plasticine clay figure, soft clay texture with fingerprints, simple rounded cute shape, bright saturated colors, soft studio light, standing on its own, whole figure visible and centered, isolated on a plain flat solid ${PUPPET_BG} background like a green screen, no floor, no ground shadow, no text, no letters, no logos`;
export const PUPPET_ASPECT = '1:1';

export const SHOTS = [
  { n: 1, at: '#s1', file: 'shot01', motion: 'push', prompt: 'A clay model of old London at dusk, crowded timber houses, church spires and the river Thames, a hazy orange sky' },
  { n: 2, at: '#s2', file: 'shot02', motion: 'pull', prompt: 'A narrow cobbled clay lane at night, leaning timber-framed houses, a small bakery with a hanging bread-shaped sign, a warm glow in its window' },
  { n: 3, at: '#s3', file: 'shot03', motion: 'push', prompt: 'Inside a small clay bakery, a brick oven glowing orange, wooden shelves and flour sacks, empty floor in front' },
  { n: 4, at: '#s4', file: 'shot04', motion: 'panRight', prompt: 'Crowded clay timber houses packed tightly together under a hot dry summer sky, dusty cracked ground' },
  { n: 5, at: '#s5', file: 'shot05', motion: 'push', prompt: 'A clay street corner with stacked barrels, coils of rope and tar buckets beside a wooden warehouse, evening light' },
  { n: 6, at: '#s6', file: 'shot06', motion: 'panLeft', prompt: 'A wide clay street of timber houses with flames on the rooftops in the distance, wind-blown smoke, an orange night sky' },
  { n: 7, at: '#s7', file: 'shot07', motion: 'push', prompt: 'A grand clay palace room with tall windows and red curtains, a polished wooden floor, warm candlelight' },
  { n: 8, at: '#s8', file: 'shot08', motion: 'rise', prompt: 'A clay street where timber houses have been pulled down, rubble, ropes and iron hooks on the ground, smoke in the air' },
  { n: 9, at: '#s9', file: 'shot09', motion: 'pull', prompt: 'A clay street with a wide gap between houses where buildings were removed, thinning smoke, soft dawn light' },
  { n: 10, at: '#s10', file: 'shot10', motion: 'panRight', prompt: 'A wide clay view of a burnt city, blackened roof beams and ash, grey smoke over the river, small tents on a field' },
  { n: 11, at: '#s11', file: 'shot11', motion: 'push', prompt: 'A quiet clay street at dawn, soot-blackened walls and a few drifting embers, calm and empty' },
  { n: 12, at: '#s12', file: 'shot12', motion: 'rise', prompt: 'A clay street of neat new red brick and stone houses under a bright blue sky, wooden scaffolding, sunny and hopeful' },
];

export const PUPPETS = [
  { n: 1, file: 'baker', prompt: 'A friendly clay baker with a white apron and tall white baker hat, round body, big eyes and a smile, holding nothing' },
  { n: 2, file: 'flame', prompt: 'A cute clay fire flame character floating in the air, orange and yellow, a tall teardrop shape with two big eyes and a mischievous grin, no ground, no floor, no shadow beneath it' },
  { n: 3, file: 'pepys', prompt: 'A clay man in a dark brown 17th century coat and a long curly brown wig, round body, big eyes, a serious expression' },
  { n: 4, file: 'duke', prompt: 'A clay nobleman in a red 17th century coat with a feathered hat and a long wig, round body, big eyes, a determined expression' },
  { n: 5, file: 'house', prompt: 'A small clay half-timbered house with dark wooden beams, white walls and a brown roof, simple rounded shape' },
  { n: 6, file: 'bricks', prompt: 'A neat stack of red clay bricks, simple rounded shape, small friendly dots for eyes, no ground, no floor, no shadow beneath it' },
];

export const HOOK = { text: 'THE *GREAT FIRE* OF LONDON', at: 0.2, out: '#s2' };
// Drawn numbers (never ask a picture model for text). Facts: London Museum (about four fifths of the city; around 100,000 homeless).
export const BOARDS = [
  { at: '#s10', out: '#s11', y: 0.3, title: 'After four days', rows: [{ label: 'City burned', value: 'about 4/5' }, { label: 'Homeless', value: '~100,000', hot: true }] },
];

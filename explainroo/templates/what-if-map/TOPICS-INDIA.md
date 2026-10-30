# "What if ...?" map topics for an Indian channel

Same format as `TOPICS.md`. **Source every number before use** (Census, RBI, NITI Aayog, IMF, World Bank, UN). No
figures are given here on purpose.

## India inside the world

| # | Hook | Map angle | Twist |
|---|---|---|---|
| 1 | What if India and Pakistan had never been split? | Fill the 1947 subcontinent (today: India, Pakistan, Bangladesh), ranking vs China | Today's borders only, say so on screen |
| 2 | What if all of South Asia became one country? | Fill 8 countries, population counter | Languages, religions and rival governments |
| 3 | What if India was as big as China's economy today? | Ranking bars, overlay | What would have to change |
| 4 | What if India had no monsoon? | Rain flows across the map, then fade | Farming and water for most of the country |
| 5 | What if the Indus river stopped flowing? | Follow the river from Tibet to the sea | Who depends on it |
| 6 | What if the Himalayas did not exist? | Remove the range | Monsoon and rivers change |
| 7 | What if all the world's Hindi speakers lived in one country? | Pins and fill across continents | Many diaspora communities |
| 8 | What if the Indian Ocean dried up? | Show the seabed | Trade routes and weather |
| 9 | What if India controlled the Malacca Strait? | Route lines, ships | Share of world trade through it |
| 10 | What if the Ganga dried up? | Follow the river, cities along it | Population that depends on it |

## India and its states

| # | Hook | Map angle | Twist |
|---|---|---|---|
| 11 | What if every Indian state was a separate country? | Fill states, rank by population and GDP | Several would rank among big countries |
| 12 | What if India's states were split by language? | Colour by main language | The 1956 reorganisation already did this |
| 13 | What if Uttar Pradesh was a country? | Fill the state, compare with countries | It would rank among the most populous countries |
| 14 | What if Maharashtra was a country? | Fill, compare economy with nations | Its economy rivals countries |
| 15 | What if all of India's coastline was one big port? | Pins on ports | How much trade goes through a few |
| 16 | What if India had one time zone less/more? | Overlay the clock across the country | It has one time zone across a huge east-west width |
| 17 | What if the capital had never moved from Calcutta? | Pins on both cities | Why Delhi became the capital in 1911 |
| 18 | What if there was no Partition of Bengal and Punjab? | Fill historic regions | Today's borders only |

## Economy, people and tech

| # | Hook | Map angle | Twist |
|---|---|---|---|
| 19 | What if every Indian lived in one state? | Counter, density | The most crowded places on Earth |
| 20 | What if India had no rupee? | Flows between countries | Why a currency matters |
| 21 | What if India's rail network stopped for one day? | Lines across the map, then fade | How many people depend on it daily |
| 22 | What if India switched to 100% solar? | Sun intensity across states | Where it works best |
| 23 | What if the Indian diaspora formed one country? | Fill countries with big Indian communities, counter | A population bigger than most countries |
| 24 | What if India made all its own chips? | Pins on fabs and imports | What is imported today |
| 25 | What if oil prices doubled overnight for India? | Oil routes to India | How much it imports |

## History turned around

| # | Hook | Map angle | Twist |
|---|---|---|---|
| 26 | What if the Mauryan Empire never fell? | Fill today's countries it covered | Language and borders |
| 27 | What if the Mughal Empire had never ended? | Fill its largest extent | Today's borders only |
| 28 | What if the British had never come to India? | Pins on trade posts, then fade | Several possible paths, no certain answer |
| 29 | What if the Chola navy ruled the Indian Ocean today? | Naval routes to Southeast Asia | Real reach of the Cholas |
| 30 | What if India had joined the Silk Road trade fully? | Routes, pins on cities | Goods that moved |

## Best five to start with

1. **#11, Every Indian state a separate country.** Familiar visual, easy numbers, strong ranking, instantly shareable.
2. **#23, The Indian diaspora as one country.** Positive, global map, a big number.
3. **#1, India and Pakistan never split.** High interest but sensitive: use today's borders, neutral wording, no
   claims about "what would have happened".
4. **#4, No monsoon.** Easy to explain, strong "However": how much of farming depends on it.
5. **#13, Uttar Pradesh as a country.** One fill and one ranking, simple and punchy.

## Notes for an Indian channel

- **Borders:** the template's data is Natural Earth with today's country shapes. It will not match India's official
  map in disputed areas (Jammu and Kashmir, Ladakh, Arunachal). If the official map matters to your audience,
  draw those polygons yourself with `s.draw` before publishing. Do not use the default shapes without checking.
- **State borders** (topics 11 to 14, 17 to 18) are not in the data. Add an India states file (an open GeoJSON,
  e.g. from a government open-data source or Natural Earth admin-1) to `data/` and fill by name.
- **Flags:** add `India` to `lib/flags.js` (saffron, white, green with a blue wheel is drawn with a custom function,
  or fill with stripes only).

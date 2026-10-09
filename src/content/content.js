// All learning content in one place. Edit freely.
//
// Every spoken line is built here with a stable key. To replace the built-in
// voice for a line, put <key>.mp3 in public/audio/nl/ and add the key to
// public/audio/nl/manifest.json.  `npm run lines` prints every key + text
// (handy as a recording list).

// ---------- Numbers ----------
const numberWords = ['één', 'twee', 'drie', 'vier', 'vijf', 'zes', 'zeven', 'acht', 'negen', 'tien']

export const numbers = numberWords.map((word, i) => {
  const n = i + 1
  return {
    id: String(n),
    value: n,
    label: String(n),
    lines: {
      explore: { key: `numbers.${n}.explore`, text: `Dit is de ${word}!` },
      find: {
        key: `numbers.${n}.find`,
        text: `Waar is de ${word}?`,
        // Played as "waar is de" + the number clip when there's no clip for the whole line.
        parts: [
          { key: 'ui.find.waar_is_de', text: 'Waar is de' },
          { key: `count.${n}`, text: word },
        ],
      },
      thatIs: {
        key: `numbers.${n}.thatis`,
        text: `Dat is de ${word}.`,
        parts: [
          { key: 'ui.find.dat_is_de', text: 'Dat is de' },
          { key: `count.${n}`, text: word },
        ],
      },
    },
  }
})

// "Hoeveel appels zijn er?" at the start of each counting round, per object kind.
const countPlurals = { appel: 'appels', vis: 'vissen', eend: 'eendjes', ster: 'sterren', ballon: 'ballonnen' }
export const countAskLine = (kind) => ({ key: `count.ask.${kind}`, text: `Hoeveel ${countPlurals[kind]} zijn er?` })

export const countLine = (n) => ({ key: `count.${n}`, text: numberWords[n - 1] })
export const countDoneLine = (n) => ({
  key: `count.done.${n}`,
  text: `${cap(numberWords[n - 1])}!`,
})

// ---------- Letters (taught as their sound / klank) ----------
// `klank` is how the built-in voice is asked to pronounce the sound. A text-to-
// speech voice can only approximate letter sounds, so these are the first lines
// worth replacing with real recordings.
const letterData = [
  ['a', 'ah', 'appel', '🍎'],
  ['b', 'buh', 'beer', '🐻'],
  ['c', 'kuh', 'cactus', '🌵'],
  ['d', 'duh', 'dino', '🦕'],
  ['e', 'eh', 'emmer', '🪣'],
  ['f', 'fff', 'fiets', '🚲'],
  ['g', 'ggg', 'giraf', '🦒'],
  ['h', 'huh', 'huis', '🏠'],
  ['i', 'ih', 'inktvis', '🐙'],
  ['j', 'juh', 'jas', '🧥'],
  ['k', 'kuh', 'koe', '🐄'],
  ['l', 'lll', 'leeuw', '🦁'],
  ['m', 'mmm', 'maan', '🌙'],
  ['n', 'nnn', 'neus', '👃'],
  ['o', 'oh', 'olifant', '🐘'],
  ['p', 'puh', 'pinguïn', '🐧'],
  ['q', 'kuh', 'quad', '🏍️'],
  ['r', 'rrr', 'raket', '🚀'],
  ['s', 'sss', 'slang', '🐍'],
  ['t', 'tuh', 'tijger', '🐯'],
  ['u', 'uu', 'ufo', '🛸'],
  ['v', 'vvv', 'vis', '🐟'],
  ['w', 'wuh', 'walvis', '🐋'],
  ['x', 'ks', 'xylofoon', '🎶'],
  ['y', 'ie', 'yoghurt', '🥣'],
  ['z', 'zzz', 'zon', '☀️'],
]

export const letters = letterData.map(([id, klank, word, picture]) => ({
  id,
  label: id,
  word,
  picture, // placeholder picture; swap for an illustration later
  lines: {
    explore: { key: `letters.${id}.explore`, text: `${klank}... ${klank}... ${word}!` },
    find: { key: `letters.${id}.find`, text: `Waar is de ${klank}?` },
    thatIs: { key: `letters.${id}.thatis`, text: `Dat is de ${klank}.` },
  },
}))

// ---------- Shapes ----------
const shapeData = [
  ['cirkel', 'de', '#FF5D8F'],
  ['vierkant', 'het', '#4CC9F0'],
  ['driehoek', 'de', '#FFB703'],
  ['ster', 'de', '#9B5DE5'],
  ['hart', 'het', '#F2383A'],
  ['rechthoek', 'de', '#3CC46B'],
  ['ovaal', 'het', '#FF8C2B'],
  ['ruit', 'de', '#2F7CF6'],
]

export const shapes = shapeData.map(([id, article, colour]) => ({
  id,
  colour,
  lines: {
    explore: { key: `shapes.${id}.explore`, text: `Dit is een ${id}!` },
    find: { key: `shapes.${id}.find`, text: `Waar is ${article} ${id}?` },
    thatIs: { key: `shapes.${id}.thatis`, text: `Dat is ${article} ${id}.` },
  },
}))

// ---------- Colours ----------
const colourData = [
  ['rood', '#F2383A'],
  ['blauw', '#2F7CF6'],
  ['geel', '#FFD23F'],
  ['groen', '#3CC46B'],
  ['oranje', '#FF8C2B'],
  ['paars', '#9B5DE5'],
  ['roze', '#FF7EB6'],
  ['bruin', '#9C6B3E'],
  ['zwart', '#2B2B2B'],
  ['wit', '#FFFFFF'],
]

export const colours = colourData.map(([id, hex]) => ({
  id,
  hex,
  lines: {
    explore: { key: `colours.${id}.explore`, text: `Dit is ${id}!` },
    find: { key: `colours.${id}.find`, text: `Welke is ${id}?` },
    thatIs: { key: `colours.${id}.thatis`, text: `Dat is ${id}.` },
  },
}))

// ---------- General lines ----------
export const lines = {
  welcome: { key: 'ui.welcome', text: 'Wat zullen we oefenen?' },
  counting: { key: 'ui.counting', text: 'Tellen!' },
  explore: { key: 'ui.explore', text: 'Ontdekken! Tik maar ergens op.' },
}

// Spoken when a topic is opened, before its chooseLine.
export const topicLines = {
  numbers: { key: 'ui.numbers', text: 'Cijfers!' },
}

// Spoken on the "explore or find?" screen for each topic.
export const chooseLines = {
  numbers: { key: 'ui.numbers.choose', text: 'Cijfers! Wil je ontdekken, zoeken of tellen?' },
  letters: { key: 'ui.letters.choose', text: 'Letters! Wil je ontdekken of zoeken?' },
  shapes: { key: 'ui.shapes.choose', text: 'Vormen! Wil je ontdekken of zoeken?' },
  colours: { key: 'ui.colours.choose', text: 'Kleuren! Wil je ontdekken of zoeken?' },
}

export const praise = [
  { key: 'praise.1', text: 'Heel goed van je!' },
  { key: 'praise.2', text: 'Geweldig!' },
  { key: 'praise.3', text: 'Dat is goed!' },
]

function cap(s) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

/** Every spoken line in the app, for the README / recording list. */
export function allLines() {
  const out = [...Object.values(lines), ...Object.values(topicLines), ...Object.values(chooseLines), ...praise]
  for (const kind of Object.keys(countPlurals)) out.push(countAskLine(kind))
  for (const deck of [numbers, letters, shapes, colours]) {
    for (const item of deck) out.push(...Object.values(item.lines))
  }
  for (let n = 1; n <= 10; n++) out.push(countLine(n), countDoneLine(n))
  // Parts of composed lines (e.g. "Waar is de" + number), each listed once.
  const seen = new Set(out.map((l) => l.key))
  for (const p of out.flatMap((l) => l.parts || [])) {
    if (!seen.has(p.key)) {
      seen.add(p.key)
      out.push(p)
    }
  }
  return out
}

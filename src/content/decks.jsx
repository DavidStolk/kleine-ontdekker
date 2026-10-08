import { numbers, letters, shapes, colours, countLine } from './content.js'
import { Shape, Splat, Glyph, CountObject } from '../components/Visuals.jsx'

export const PALETTE = ['#FF5D8F', '#4CC9F0', '#FFB703', '#9B5DE5', '#3CC46B', '#FF8C2B', '#2F7CF6', '#F2383A']
const colourFor = (i) => PALETTE[i % PALETTE.length]

// A deck = one topic. Each deck says how to draw an item small (Tile), big
// (Detail, in Explore mode) and what to say when exploring it.
export const decks = {
  numbers: {
    id: 'numbers',
    title: 'Cijfers',
    colour: '#FF5D8F',
    items: numbers,
    columns: 5,
    findOptions: 3,
    Tile: ({ item, index }) => <Glyph text={item.label} colour={colourFor(index)} />,
    Detail: ({ item, index, step }) => (
      <div className="detail-number">
        <Glyph text={item.label} colour={colourFor(index)} className="glyph-xl" />
        <div className="count-row">
          {Array.from({ length: item.value }, (_, i) => (
            <div key={i} className={`count-dot ${i < step ? 'on' : ''}`}>
              <CountObject kind="ster" />
            </div>
          ))}
        </div>
      </div>
    ),
    // Say "Dit is de drie!", then count the stars one by one.
    sequence: (item) => [
      { line: item.lines.explore, step: 0 },
      ...Array.from({ length: item.value }, (_, i) => ({ line: countLine(i + 1), step: i + 1, sfx: 'count' })),
    ],
  },

  letters: {
    id: 'letters',
    title: 'Letters',
    colour: '#4CC9F0',
    items: letters,
    columns: 7,
    findOptions: 3,
    Tile: ({ item, index }) => <Glyph text={item.label} colour={colourFor(index)} />,
    Detail: ({ item, index }) => (
      <div className="detail-letter">
        <Glyph text={item.label} colour={colourFor(index)} className="glyph-xl" />
        <div className="letter-example">
          <span className="emoji-pic" aria-hidden>
            {item.picture}
          </span>
          <span className="word">
            <b style={{ color: colourFor(index) }}>{item.word[0]}</b>
            {item.word.slice(1)}
          </span>
        </div>
      </div>
    ),
    sequence: (item) => [{ line: item.lines.explore, step: 1 }],
  },

  shapes: {
    id: 'shapes',
    title: 'Vormen',
    colour: '#FFB703',
    items: shapes,
    columns: 4,
    findOptions: 3,
    Tile: ({ item }) => <Shape id={item.id} colour={item.colour} />,
    Detail: ({ item }) => (
      <div className="detail-shape wobble">
        <Shape id={item.id} colour={item.colour} face />
      </div>
    ),
    sequence: (item) => [{ line: item.lines.explore, step: 1 }],
  },

  colours: {
    id: 'colours',
    title: 'Kleuren',
    colour: '#3CC46B',
    cardBg: '#ECEAF2', // so white and yellow still stand out
    items: colours,
    columns: 5,
    findOptions: 3,
    Tile: ({ item }) => <Splat hex={item.hex} />,
    Detail: ({ item }) => (
      <div className="detail-colour">
        <div className="detail-splat wobble">
          <Splat hex={item.hex} />
        </div>
        <div className="colour-friends">
          {['cirkel', 'ster', 'hart'].map((s) => (
            <div key={s} className="friend">
              <Shape id={s} colour={item.hex} />
            </div>
          ))}
        </div>
      </div>
    ),
    sequence: (item) => [{ line: item.lines.explore, step: 1 }],
  },
}

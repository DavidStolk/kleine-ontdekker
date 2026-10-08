import { useEffect, useRef, useState } from 'react'
import { say, stopSpeech } from '../lib/speech.js'
import { sfx } from '../lib/sfx.js'
import { sleep } from '../lib/random.js'
import { lines } from '../content/content.js'

/** Tap anything to hear what it is. No right or wrong. */
export default function Explore({ deck }) {
  const [open, setOpen] = useState(null) // { item, index }
  const [step, setStep] = useState(0)
  const run = useRef(0)

  useEffect(() => {
    say(lines.explore.key, lines.explore.text)
    return () => {
      run.current++
      stopSpeech()
    }
  }, [])

  async function show(item, index) {
    sfx.pop()
    const id = ++run.current
    setOpen({ item, index })
    setStep(0)
    await sleep(150)
    for (const s of deck.sequence(item)) {
      if (run.current !== id) return
      setStep(s.step)
      if (s.sfx === 'count') sfx.count(s.step)
      await say(s.line.key, s.line.text)
      await sleep(120)
    }
  }

  function close() {
    run.current++
    stopSpeech()
    sfx.whoosh()
    setOpen(null)
  }

  const { Tile, Detail } = deck
  return (
    <div className="explore">
      <div className="tile-grid" style={{ '--cols': deck.columns }}>
        {deck.items.map((item, i) => (
          <button key={item.id} className="tile pop-in" style={{ animationDelay: `${i * 25}ms` }} onPointerDown={() => show(item, i)}>
            <Tile item={item} index={i} />
          </button>
        ))}
      </div>

      {open && (
        <div className="detail-overlay" onPointerDown={close}>
          <div className="detail-card zoom-in" style={deck.cardBg ? { background: deck.cardBg } : undefined} onPointerDown={(e) => {
            // Tapping the card itself replays it instead of closing.
            e.stopPropagation()
            show(open.item, open.index)
          }}>
            <Detail item={open.item} index={open.index} step={step} />
          </div>
        </div>
      )}
    </div>
  )
}

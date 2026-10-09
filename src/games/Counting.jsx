import { useCallback, useEffect, useRef, useState } from 'react'
import { say, sayLine, stopSpeech } from '../lib/speech.js'
import { sfx } from '../lib/sfx.js'
import { pick, shuffle, sleep } from '../lib/random.js'
import { countAskLine, countLine, countDoneLine, lines } from '../content/content.js'
import { CountObject, COUNT_KINDS, Glyph } from '../components/Visuals.jsx'
import { Confetti } from '../components/Controls.jsx'
import { PALETTE } from '../content/decks.jsx'

const COLS = 5
const ROWS = 3

/** Tap each object; the app counts along. Each round has a random 1–10 objects. */
export default function Counting() {
  const [round, setRound] = useState(null)
  const [tapped, setTapped] = useState([]) // indexes in tap order
  const [done, setDone] = useState(false)
  const [burst, setBurst] = useState(0)
  const last = useRef(null) // previous { n, kind }, so a round never repeats exactly
  const tappedRef = useRef([])
  const doneRef = useRef(false)
  const alive = useRef(true)
  const intro = useRef(true) // say "Tellen!" before the first question

  const newRound = useCallback(() => {
    const n = pick(Array.from({ length: 10 }, (_, i) => i + 1).filter((x) => x !== last.current?.n))
    // Place objects in random cells of a grid, with a little jitter.
    const cells = shuffle(Array.from({ length: COLS * ROWS }, (_, i) => i)).slice(0, n)
    const objects = cells.map((c) => ({
      x: ((c % COLS) + 0.5) / COLS,
      y: (Math.floor(c / COLS) + 0.5) / ROWS,
      jx: Math.random() * 0.4 - 0.2,
      jy: Math.random() * 0.3 - 0.15,
      rot: Math.random() * 30 - 15,
    }))
    const kind = pick(COUNT_KINDS.filter((k) => k !== last.current?.kind))
    last.current = { n, kind }
    setRound({ id: Date.now(), n, kind, objects, colour: pick(PALETTE) })
    tappedRef.current = []
    doneRef.current = false
    setTapped([])
    setDone(false)
    const ask = countAskLine(kind)
    sayLine(intro.current ? { key: null, text: `${lines.counting.text} ${ask.text}`, parts: [lines.counting, ask] } : ask)
    intro.current = false
  }, [])

  useEffect(() => {
    alive.current = true
    intro.current = true
    newRound()
    return () => {
      alive.current = false
      stopSpeech()
    }
  }, [newRound])

  async function tap(i) {
    if (doneRef.current || tappedRef.current.includes(i)) return
    const next = [...tappedRef.current, i]
    tappedRef.current = next
    setTapped(next)
    const count = next.length
    sfx.count(count)
    const l = countLine(count)
    if (count < round.n) {
      say(l.key, l.text)
      return
    }
    // Last one counted!
    doneRef.current = true
    setDone(true)
    await say(l.key, l.text)
    if (!alive.current) return
    setBurst((b) => b + 1)
    sfx.yay()
    const d = countDoneLine(round.n)
    await say(d.key, d.text)
    await sleep(1400)
    if (alive.current) newRound()
  }

  if (!round) return null
  return (
    <div className="counting">
      <div className="count-field">
        {round.objects.map((o, i) => {
          const order = tapped.indexOf(i)
          return (
            <button
              key={`${round.id}-${i}`}
              className={`count-obj pop-in ${order >= 0 ? 'counted' : ''}`}
              style={{
                left: `${8 + (o.x + o.jx / COLS) * 84}%`,
                top: `${10 + (o.y + o.jy / ROWS) * 80}%`,
                '--rot': `${o.rot}deg`,
                animationDelay: `${i * 70}ms`,
              }}
              onPointerDown={() => tap(i)}
            >
              <CountObject kind={round.kind} />
              {order >= 0 && (
                <span className="count-badge" style={{ background: round.colour }}>
                  {order + 1}
                </span>
              )}
            </button>
          )
        })}
      </div>
      {done && (
        <div className="count-result zoom-in">
          <Glyph text={String(round.n)} colour={round.colour} className="glyph-xl" />
        </div>
      )}
      <Confetti burstKey={burst} />
    </div>
  )
}

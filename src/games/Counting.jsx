import { useCallback, useEffect, useRef, useState } from 'react'
import { say, stopSpeech } from '../lib/speech.js'
import { sfx } from '../lib/sfx.js'
import { pick, shuffle, sleep } from '../lib/random.js'
import { countLine, countDoneLine, lines } from '../content/content.js'
import { CountObject, COUNT_KINDS, Glyph } from '../components/Visuals.jsx'
import { Confetti } from '../components/Controls.jsx'
import { PALETTE } from '../content/decks.jsx'

const COLS = 5
const ROWS = 3

/** Tap each object; the app counts along. Starts with up to 5, grows to 10. */
export default function Counting() {
  const [round, setRound] = useState(null)
  const [tapped, setTapped] = useState([]) // indexes in tap order
  const [done, setDone] = useState(false)
  const [burst, setBurst] = useState(0)
  const rounds = useRef(0)
  const tappedRef = useRef([])
  const doneRef = useRef(false)
  const alive = useRef(true)

  const newRound = useCallback(() => {
    const max = rounds.current < 4 ? 5 : 10
    const n = 1 + Math.floor(Math.random() * max)
    // Place objects in random cells of a grid, with a little jitter.
    const cells = shuffle(Array.from({ length: COLS * ROWS }, (_, i) => i)).slice(0, n)
    const objects = cells.map((c) => ({
      x: ((c % COLS) + 0.5) / COLS,
      y: (Math.floor(c / COLS) + 0.5) / ROWS,
      jx: Math.random() * 0.4 - 0.2,
      jy: Math.random() * 0.3 - 0.15,
      rot: Math.random() * 30 - 15,
    }))
    setRound({ id: Date.now(), n, kind: pick(COUNT_KINDS), objects, colour: pick(PALETTE) })
    tappedRef.current = []
    doneRef.current = false
    setTapped([])
    setDone(false)
  }, [])

  useEffect(() => {
    alive.current = true
    say(lines.counting.key, lines.counting.text)
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
    rounds.current++
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

import { useCallback, useEffect, useRef, useState } from 'react'
import { say, stopSpeech } from '../lib/speech.js'
import { sfx } from '../lib/sfx.js'
import { optionsWith, pick, sleep } from '../lib/random.js'
import { praise } from '../content/content.js'
import { Confetti, RepeatButton } from '../components/Controls.jsx'

/** "Waar is de drie?" — pick the right one. Wrong taps are gentle, never a fail. */
export default function FindIt({ deck }) {
  const [round, setRound] = useState(null) // { target, options }
  const [wrong, setWrong] = useState(null)
  const [solved, setSolved] = useState(false)
  const [burst, setBurst] = useState(0)
  const busy = useRef(false)
  const last = useRef(null)
  const alive = useRef(true)

  const ask = useCallback((target) => say(target.lines.find.key, target.lines.find.text), [])

  const newRound = useCallback(() => {
    const pool = deck.items.filter((x) => x !== last.current)
    const target = pick(pool)
    last.current = target
    setRound({ target, options: optionsWith(target, deck.items, deck.findOptions) })
    setWrong(null)
    setSolved(false)
    busy.current = false
    ask(target)
  }, [deck, ask])

  useEffect(() => {
    alive.current = true
    newRound()
    return () => {
      alive.current = false
      stopSpeech()
    }
  }, [newRound])

  async function choose(item) {
    if (busy.current || !round) return
    if (item === round.target) {
      busy.current = true
      setSolved(true)
      setBurst((b) => b + 1)
      sfx.yay()
      const p = pick(praise)
      await say(p.key, p.text)
      await sleep(700)
      if (alive.current) newRound()
    } else {
      sfx.boing()
      setWrong(item.id)
      setTimeout(() => setWrong(null), 600)
      busy.current = true
      await say(item.lines.thatIs.key, item.lines.thatIs.text)
      busy.current = false
      if (alive.current) ask(round.target)
    }
  }

  if (!round) return null
  const { Tile } = deck
  return (
    <div className="find">
      <RepeatButton onPress={() => ask(round.target)} />
      <div className="find-options" key={round.target.id + round.options.map((o) => o.id).join()}>
        {round.options.map((item, i) => {
          const index = deck.items.indexOf(item)
          const isTarget = item === round.target
          return (
            <button
              key={item.id}
              className={`tile find-tile pop-in ${wrong === item.id ? 'wiggle' : ''} ${solved && isTarget ? 'win' : ''} ${solved && !isTarget ? 'fade' : ''}`}
              style={{ animationDelay: `${i * 90}ms` }}
              onPointerDown={() => choose(item)}
            >
              <Tile item={item} index={index} />
            </button>
          )
        })}
      </div>
      <Confetti burstKey={burst} />
    </div>
  )
}

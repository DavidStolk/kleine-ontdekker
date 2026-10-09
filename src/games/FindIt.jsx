import { useCallback, useEffect, useRef, useState } from 'react'
import { say, sayLine, stopSpeech } from '../lib/speech.js'
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
  const [revealed, setRevealed] = useState(false) // options appear after the first question
  const busy = useRef(false)
  const listening = useRef(false) // no taps while the question is being asked
  const askId = useRef(0)
  const last = useRef(null)
  const lastPraise = useRef(null)
  const alive = useRef(true)

  const ask = useCallback(async (target) => {
    const id = ++askId.current
    listening.current = true
    // Safety net in case the audio never reports that it finished.
    await Promise.race([sayLine(target.lines.find), sleep(6000)])
    if (id !== askId.current || !alive.current) return // a newer question took over
    listening.current = false
    setRevealed(true)
  }, [])

  const newRound = useCallback(() => {
    const pool = deck.items.filter((x) => x !== last.current)
    const target = pick(pool)
    last.current = target
    setRound({ target, options: optionsWith(target, deck.items, deck.findOptions) })
    setWrong(null)
    setSolved(false)
    setRevealed(false)
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
    if (busy.current || listening.current || !round) return
    if (item === round.target) {
      busy.current = true
      setSolved(true)
      setBurst((b) => b + 1)
      sfx.yay()
      const p = pick(praise.filter((x) => x !== lastPraise.current)) // never the same twice in a row
      lastPraise.current = p
      await say(p.key, p.text)
      await sleep(700)
      if (alive.current) newRound()
    } else {
      sfx.boing()
      setWrong(item.id)
      setTimeout(() => setWrong(null), 600)
      busy.current = true
      await sayLine(item.lines.thatIs)
      busy.current = false
      if (alive.current) ask(round.target)
    }
  }

  if (!round) return null
  const { Tile } = deck
  return (
    <div className="find">
      <RepeatButton onPress={() => !busy.current && ask(round.target)} />
      <div className="find-options" key={round.target.id + round.options.map((o) => o.id).join()}>
        {round.options.map((item, i) => {
          const index = deck.items.indexOf(item)
          const isTarget = item === round.target
          return (
            <button
              key={item.id}
              className={`tile find-tile ${revealed ? 'pop-in' : 'waiting'} ${wrong === item.id ? 'wiggle' : ''} ${solved && isTarget ? 'win' : ''} ${solved && !isTarget ? 'fade' : ''}`}
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

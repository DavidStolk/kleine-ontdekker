import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { say, sayLine, stopSpeech } from '../lib/speech.js'
import { sfx } from '../lib/sfx.js'
import { pick, sleep } from '../lib/random.js'
import { countDoneLine, lines, praise, writeAskLine } from '../content/content.js'
import { numberStrokes } from '../content/strokes.js'
import { Confetti, RepeatButton } from '../components/Controls.jsx'
import { PALETTE } from '../content/decks.jsx'

// All distances are in the units of the stroke drawings (a digit is 100 × 140).
const STEP = 2 // spacing of the points sampled along each stroke
const REACH = 22 // how far from the line the finger may be and still count
const LOOKAHEAD = 40 // how far along the line one finger move may jump ahead
const END_SLACK = 8 // this close to the end of a stroke counts as finished
const TICK = 14 // a soft tick sound every this many units traced
const ARROW_GAP = 18 // spacing of the direction arrows
const DEMO_SPEED = 0.11 // units per millisecond for the "watch how" dot

/** Trace a random number (1–10) with a finger, stroke by stroke, in writing order. */
export default function Writing() {
  const [round, setRound] = useState(null) // { id, n, colour, glyph }
  const [geo, setGeo] = useState(null) // per stroke: { len, pts: [{ x, y, l, a }] }
  const [trace, setTrace] = useState({ stroke: 0, progress: [] })
  const [demo, setDemo] = useState(null) // { stroke, l } while the "watch how" dot runs
  const [done, setDone] = useState(false)
  const [burst, setBurst] = useState(0)
  const svgRef = useRef(null)
  const pathRefs = useRef([])
  const geoRef = useRef(null)
  const traceRef = useRef(trace)
  const tickRef = useRef(0)
  const pointer = useRef(null) // the one finger we follow
  const demoRaf = useRef(0)
  const doneRef = useRef(false)
  const last = useRef(null)
  const lastPraise = useRef(null)
  const alive = useRef(true)
  const intro = useRef(true) // say "Schrijven!" before the first question

  const stopDemo = useCallback(() => {
    cancelAnimationFrame(demoRaf.current)
    setDemo(null)
  }, [])

  // A dot runs along the strokes in writing order, leaving a faint trail.
  const startDemo = useCallback((g) => {
    cancelAnimationFrame(demoRaf.current)
    const total = g.reduce((sum, s) => sum + s.len, 0)
    const t0 = performance.now()
    const frame = (now) => {
      let l = (now - t0) * DEMO_SPEED
      if (l > total + 60) return setDemo(null) // linger a moment at the end
      let stroke = 0
      while (stroke < g.length - 1 && l > g[stroke].len) l -= g[stroke++].len
      setDemo({ stroke, l: Math.min(l, g[stroke].len) })
      demoRaf.current = requestAnimationFrame(frame)
    }
    demoRaf.current = requestAnimationFrame(frame)
  }, [])

  const newRound = useCallback(() => {
    const n = pick(Array.from({ length: 10 }, (_, i) => i + 1).filter((x) => x !== last.current))
    last.current = n
    const glyph = numberStrokes(n)
    geoRef.current = null
    setGeo(null)
    setRound({ id: Date.now(), n, colour: pick(PALETTE), glyph })
    traceRef.current = { stroke: 0, progress: glyph.strokes.map(() => 0) }
    setTrace(traceRef.current)
    tickRef.current = 0
    doneRef.current = false
    setDone(false)
    const ask = writeAskLine(n)
    sayLine(intro.current ? { key: null, text: `${lines.writing.text} ${ask.text}`, parts: [lines.writing, ask] } : ask)
    intro.current = false
  }, [])

  useEffect(() => {
    alive.current = true
    intro.current = true
    newRound()
    return () => {
      alive.current = false
      cancelAnimationFrame(demoRaf.current)
      stopSpeech()
    }
  }, [newRound])

  // Once the strokes are on screen, sample points along them to trace against.
  useLayoutEffect(() => {
    if (!round) return
    const g = round.glyph.strokes.map((s, i) => measure(pathRefs.current[i], s.x))
    geoRef.current = g
    setGeo(g)
    startDemo(g)
  }, [round, startDemo])

  function toSvg(ev) {
    const m = svgRef.current.getScreenCTM()
    return new DOMPoint(ev.clientX, ev.clientY).matrixTransform(m.inverse())
  }

  function follow(e) {
    const coalesced = e.nativeEvent.getCoalescedEvents?.() || []
    for (const ev of coalesced.length ? coalesced : [e.nativeEvent]) {
      if (doneRef.current) return
      advance(toSvg(ev))
    }
  }

  // Move along the current stroke as far as the finger reaches, never backwards.
  function advance(p) {
    const g = geoRef.current
    const t = traceRef.current
    if (!g || t.stroke >= g.length) return
    const { len, pts } = g[t.stroke]
    const from = t.progress[t.stroke]
    let best = from
    for (const q of pts) {
      if (q.l < from) continue
      if (q.l > from + LOOKAHEAD) break
      if (q.l > best && Math.hypot(q.x - p.x, q.y - p.y) < REACH) best = q.l
    }
    if (best === from) return

    const progress = [...t.progress]
    let stroke = t.stroke
    if (best >= len - END_SLACK) {
      progress[stroke] = len
      stroke++
      tickRef.current = 0
      sfx.pop()
    } else {
      progress[stroke] = best
      const tick = Math.floor(best / TICK)
      if (tick > tickRef.current) {
        tickRef.current = tick
        sfx.draw(best / len)
      }
    }
    traceRef.current = { stroke, progress }
    setTrace(traceRef.current)
    if (stroke >= g.length) finish()
  }

  async function finish() {
    doneRef.current = true
    setDone(true)
    setBurst((b) => b + 1)
    sfx.yay()
    const d = countDoneLine(round.n)
    await say(d.key, d.text)
    if (!alive.current) return
    const p = pick(praise.filter((x) => x !== lastPraise.current)) // never the same twice in a row
    lastPraise.current = p
    await say(p.key, p.text)
    await sleep(1200)
    if (alive.current) newRound()
  }

  function down(e) {
    if (pointer.current !== null || doneRef.current) return
    pointer.current = e.pointerId
    e.currentTarget.setPointerCapture?.(e.pointerId)
    stopDemo()
    follow(e)
  }
  function up(e) {
    if (e.pointerId === pointer.current) pointer.current = null
  }

  function repeat() {
    if (doneRef.current || !geoRef.current) return
    sayLine(writeAskLine(round.n))
    startDemo(geoRef.current)
  }

  if (!round) return null
  const { stroke: current, progress } = trace
  const here = geo && !done && !demo && current < geo.length ? pointAt(geo[current], progress[current]) : null
  const demoDot = geo && demo ? pointAt(geo[demo.stroke], demo.l) : null

  return (
    <div className="writing">
      <RepeatButton onPress={repeat} />
      <div className={`trace-card ${done ? 'win' : ''}`} key={round.id}>
        <svg
          ref={svgRef}
          viewBox={round.glyph.viewBox}
          className="trace-svg pop-in"
          onPointerDown={down}
          onPointerMove={(e) => e.pointerId === pointer.current && follow(e)}
          onPointerUp={up}
          onPointerCancel={up}
        >
          {round.glyph.strokes.map((s, i) => (
            <path
              key={`track-${i}`}
              ref={(el) => (pathRefs.current[i] = el)}
              d={s.d}
              transform={`translate(${s.x} 0)`}
              className="trace-track"
            />
          ))}
          {round.glyph.strokes.map(
            (s, i) =>
              !(here && i === current) && ( // the current stroke shows arrows instead
                <path key={`guide-${i}`} d={s.d} transform={`translate(${s.x} 0)`} className="trace-guide" />
              ),
          )}
          {geo &&
            demo &&
            round.glyph.strokes.map(
              (s, i) =>
                i <= demo.stroke && (
                  <path
                    key={`demo-${i}`}
                    d={s.d}
                    transform={`translate(${s.x} 0)`}
                    className="trace-ghost"
                    stroke={round.colour}
                    strokeDasharray={`${i < demo.stroke ? geo[i].len : demo.l} ${geo[i].len + 1}`}
                  />
                ),
            )}
          {geo &&
            round.glyph.strokes.map(
              (s, i) =>
                progress[i] > 0 && (
                  <path
                    key={`ink-${i}`}
                    d={s.d}
                    transform={`translate(${s.x} 0)`}
                    className="trace-ink"
                    stroke={round.colour}
                    strokeDasharray={`${progress[i]} ${geo[i].len + 1}`}
                  />
                ),
            )}
          {here &&
            arrowsAfter(geo[current], progress[current]).map((q) => (
              <path
                key={`arrow-${q.l}`}
                d="M-2.5 -4 L2 0 L-2.5 4"
                transform={`translate(${q.x} ${q.y}) rotate(${q.a})`}
                className="trace-arrow"
              />
            ))}
          {here && <circle cx={here.x} cy={here.y} r="8" className="trace-dot" fill={round.colour} />}
          {demoDot && <circle cx={demoDot.x} cy={demoDot.y} r="8" className="trace-demo-dot" fill={round.colour} />}
        </svg>
      </div>
      <Confetti burstKey={burst} />
    </div>
  )
}

/** Sample points along a path (in the svg's coordinates), with the direction at each. */
function measure(el, dx) {
  const len = el.getTotalLength()
  const pts = []
  for (let l = 0; l < len; l += STEP) pts.push(el.getPointAtLength(l))
  pts.push(el.getPointAtLength(len))
  return {
    len,
    pts: pts.map((p, i) => {
      const a = pts[Math.max(i - 1, 0)]
      const b = pts[Math.min(i + 1, pts.length - 1)]
      return { x: p.x + dx, y: p.y, l: Math.min(i * STEP, len), a: (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI }
    }),
  }
}

const pointAt = (g, l) => g.pts[Math.min(Math.round(l / STEP), g.pts.length - 1)]

/** Direction arrows along the part of a stroke that's still to be traced. */
function arrowsAfter(g, from) {
  const out = []
  for (let l = from + ARROW_GAP; l < g.len - END_SLACK; l += ARROW_GAP) out.push(pointAt(g, l))
  return out
}

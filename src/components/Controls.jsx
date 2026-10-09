import { useEffect, useRef, useState } from 'react'

const HOLD_MS = 900

/**
 * Back/home button that must be HELD for a moment, so little hands that tap
 * everything don't accidentally leave the game. A ring fills while holding.
 */
export function HoldButton({ onDone, label = 'Terug', icon = 'home' }) {
  const [holding, setHolding] = useState(false)
  const timer = useRef(null)

  const start = (e) => {
    e.preventDefault()
    setHolding(true)
    timer.current = setTimeout(() => {
      setHolding(false)
      onDone()
    }, HOLD_MS)
  }
  const cancel = () => {
    clearTimeout(timer.current)
    setHolding(false)
  }
  useEffect(() => () => clearTimeout(timer.current), [])

  return (
    <button
      className={`hold-btn ${holding ? 'holding' : ''}`}
      aria-label={`${label} (vasthouden)`}
      onPointerDown={start}
      onPointerUp={cancel}
      onPointerLeave={cancel}
      onPointerCancel={cancel}
      onContextMenu={(e) => e.preventDefault()}
      style={{ '--hold-ms': `${HOLD_MS}ms` }}
    >
      <svg viewBox="0 0 48 48" className="hold-ring">
        <circle cx="24" cy="24" r="21" className="ring-bg" />
        <circle cx="24" cy="24" r="21" className="ring-fill" />
      </svg>
      {icon === 'home' ? <HomeIcon /> : icon === 'gear' ? <GearIcon /> : <BackIcon />}
    </button>
  )
}

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="btn-icon">
      <path d="M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z" fill="currentColor" />
    </svg>
  )
}
function GearIcon() {
  return (
    <svg viewBox="0 0 24 24" className="btn-icon">
      <path
        d="M12 8.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7zm8.6 4.9l1.9 1.5-2 3.4-2.3-.9a7.6 7.6 0 01-1.7 1l-.3 2.4h-4l-.4-2.4a7.6 7.6 0 01-1.7-1l-2.3.9-2-3.4 1.9-1.5a7.7 7.7 0 010-2L1.8 8.9l2-3.4 2.3.9c.5-.4 1.1-.7 1.7-1L8.1 3h4l.3 2.4c.6.3 1.2.6 1.7 1l2.3-.9 2 3.4-1.9 1.5a7.7 7.7 0 010 2z"
        fill="currentColor"
      />
    </svg>
  )
}

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" className="btn-icon">
      <path d="M15 4l-8 8 8 8" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/** Big "say it again" button with an ear/speaker icon. */
export function RepeatButton({ onPress }) {
  return (
    <button className="repeat-btn" aria-label="Nog een keer horen" onPointerDown={onPress}>
      <svg viewBox="0 0 24 24" className="btn-icon">
        <path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor" />
        <path d="M16 8.5a5 5 0 010 7M18.5 6a8.5 8.5 0 010 12" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    </button>
  )
}

const CONFETTI_COLOURS = ['#FF5D8F', '#4CC9F0', '#FFB703', '#9B5DE5', '#3CC46B', '#FF8C2B']

/** A burst of confetti. Change `burstKey` to fire again. */
export function Confetti({ burstKey }) {
  const [pieces, setPieces] = useState([])
  useEffect(() => {
    if (!burstKey) return
    setPieces(
      Array.from({ length: 48 }, (_, i) => ({
        id: `${burstKey}-${i}`,
        left: Math.random() * 100,
        delay: Math.random() * 0.25,
        dur: 1.4 + Math.random() * 1,
        rot: Math.random() * 720 - 360,
        drift: Math.random() * 30 - 15,
        colour: CONFETTI_COLOURS[i % CONFETTI_COLOURS.length],
        round: Math.random() > 0.5,
      })),
    )
    const t = setTimeout(() => setPieces([]), 2800)
    return () => clearTimeout(t)
  }, [burstKey])

  return (
    <div className="confetti" aria-hidden>
      {pieces.map((p) => (
        <i
          key={p.id}
          style={{
            left: `${p.left}%`,
            background: p.colour,
            borderRadius: p.round ? '50%' : '3px',
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.dur}s`,
            '--rot': `${p.rot}deg`,
            '--drift': `${p.drift}vw`,
          }}
        />
      ))}
    </div>
  )
}

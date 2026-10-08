// Little sound effects, synthesised with Web Audio so there are no files to manage.
// Later you can swap any of these for a recorded/AI-generated clip.

let ctx = null

export function unlockSfx() {
  const AC = window.AudioContext || window.webkitAudioContext
  if (!AC) return
  if (!ctx) ctx = new AC()
  if (ctx.state === 'suspended') ctx.resume()
}

function tone({ freq, to = freq, dur = 0.15, type = 'sine', vol = 0.25, delay = 0 }) {
  if (!ctx) return
  const t = ctx.currentTime + delay
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t)
  osc.frequency.exponentialRampToValueAtTime(to, t + dur)
  gain.gain.setValueAtTime(0.0001, t)
  gain.gain.exponentialRampToValueAtTime(vol, t + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  osc.connect(gain).connect(ctx.destination)
  osc.start(t)
  osc.stop(t + dur + 0.02)
}

export const sfx = {
  pop: () => tone({ freq: 500, to: 900, dur: 0.09, type: 'triangle', vol: 0.3 }),
  tap: () => tone({ freq: 700, to: 600, dur: 0.06, type: 'sine', vol: 0.2 }),
  boing: () => tone({ freq: 260, to: 140, dur: 0.25, type: 'sine', vol: 0.25 }),
  whoosh: () => tone({ freq: 300, to: 1200, dur: 0.2, type: 'sine', vol: 0.12 }),
  yay: () => {
    // Happy rising arpeggio (C E G C)
    ;[523, 659, 784, 1047].forEach((f, i) =>
      tone({ freq: f, dur: 0.18, type: 'triangle', vol: 0.25, delay: i * 0.09 }),
    )
  },
  count: (n) => tone({ freq: 440 * Math.pow(2, (n - 1) / 12), dur: 0.12, type: 'triangle', vol: 0.25 }),
}

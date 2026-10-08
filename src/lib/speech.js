// Speech for Kleine Ontdekker.
//
// Every spoken line has a stable KEY (e.g. "numbers.3.explore") and a TEXT.
// If a recorded clip exists for the key (listed in public/audio/nl/manifest.json,
// file public/audio/nl/<key>.mp3) it is played. Otherwise the iPad's built-in
// Dutch voice reads the text. So you can replace the placeholder voice one clip
// at a time (e.g. with ElevenLabs) without touching any code.

const BASE = import.meta.env.BASE_URL
let clips = new Set()
let voice = null
let current = null // currently playing <audio>

export async function initSpeech() {
  try {
    const res = await fetch(`${BASE}audio/nl/manifest.json`, { cache: 'no-cache' })
    if (res.ok) clips = new Set((await res.json()).clips || [])
  } catch {
    /* offline first run or no manifest: fall back to TTS only */
  }
  pickVoice()
  if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = pickVoice
  }
}

function pickVoice() {
  if (!('speechSynthesis' in window)) return
  const voices = window.speechSynthesis.getVoices()
  const dutch = voices.filter((v) => v.lang?.toLowerCase().replace('_', '-').startsWith('nl'))
  const nlNL = dutch.filter((v) => v.lang.toLowerCase().replace('_', '-') === 'nl-nl')
  const pool = nlNL.length ? nlNL : dutch
  // Prefer the higher-quality downloadable voices if the parent installed them.
  voice =
    pool.find((v) => /premium|enhanced|verbeterd/i.test(v.name)) ||
    pool[0] ||
    null
}

/** Must be called from a user gesture (the big Play button) to unlock audio on iOS. */
export function unlockSpeech() {
  if ('speechSynthesis' in window) {
    const u = new SpeechSynthesisUtterance(' ')
    u.volume = 0
    window.speechSynthesis.speak(u)
  }
  const a = new Audio()
  a.muted = true
  a.play().catch(() => {})
}

export function stopSpeech() {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel()
  if (current) {
    current.pause()
    current = null
  }
}

/**
 * Say a line. Interrupts whatever is being said, so fast tapping stays snappy.
 * Returns a promise that resolves when the line is finished (or fails).
 */
export function say(key, text, { rate = 0.9, pitch = 1.15 } = {}) {
  stopSpeech()
  if (key && clips.has(key)) return playClip(key)
  return speakText(text, rate, pitch)
}

function playClip(key) {
  return new Promise((resolve) => {
    const a = new Audio(`${BASE}audio/nl/${key}.mp3`)
    current = a
    a.onended = a.onerror = () => resolve()
    a.play().catch(() => resolve())
  })
}

function speakText(text, rate, pitch) {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window) || !text) return resolve()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'nl-NL'
    if (voice) u.voice = voice
    u.rate = rate
    u.pitch = pitch
    u.onend = u.onerror = () => resolve()
    // Safety net: some iOS versions never fire onend.
    setTimeout(resolve, 400 + text.length * 120)
    window.speechSynthesis.speak(u)
  })
}

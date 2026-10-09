// Speech for Kleine Ontdekker.
//
// Every spoken line has a stable KEY (e.g. "numbers.3.explore") and a TEXT.
// If a recorded clip exists for the key (listed in public/audio/nl/manifest.json,
// file public/audio/nl/<key>.mp3) it is played. Otherwise the iPad's built-in
// Dutch voice reads the text. So you can replace the placeholder voice one clip
// at a time (e.g. with ElevenLabs) without touching any code.
//
// iOS/Safari quirks handled here:
// - speak() straight after cancel() is sometimes silently dropped -> wait a moment.
// - The voice list often arrives late (or voiceschanged never fires) -> re-check lazily.
// - Utterances can be garbage-collected mid-speech -> keep a reference.

const BASE = import.meta.env.BASE_URL
const VOICE_KEY = 'ko.voice'
const synth = typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null

let clips = new Set()
let voice = null
let currentAudio = null
let currentUtterance = null // keep a reference so it isn't garbage-collected
let token = 0 // increases on every say(); stale speech requests are skipped
const log = [] // recent speech events, shown on the test screen

function addLog(msg) {
  log.unshift(`${new Date().toLocaleTimeString('nl-NL')}  ${msg}`)
  log.length = Math.min(log.length, 30)
}
export const speechLog = () => [...log]

export async function initSpeech() {
  try {
    const res = await fetch(`${BASE}audio/nl/manifest.json`, { cache: 'no-cache' })
    if (res.ok) clips = new Set((await res.json()).clips || [])
  } catch {
    /* offline first run or no manifest: fall back to TTS only */
  }
  pickVoice()
  if (synth) synth.addEventListener?.('voiceschanged', pickVoice)
}

/** All Dutch voices the device offers. */
export function dutchVoices() {
  if (!synth) return []
  return synth.getVoices().filter((v) => v.lang?.toLowerCase().replace('_', '-').startsWith('nl'))
}

function pickVoice() {
  const dutch = dutchVoices()
  if (!dutch.length) return
  let saved = null
  try {
    saved = localStorage.getItem(VOICE_KEY)
  } catch {
    /* storage blocked */
  }
  const nlNL = dutch.filter((v) => v.lang.toLowerCase().replace('_', '-') === 'nl-nl')
  const pool = nlNL.length ? nlNL : dutch
  voice =
    dutch.find((v) => v.voiceURI === saved) ||
    pool.find((v) => /premium|enhanced|verbeterd/i.test(v.name)) ||
    pool[0]
}

export const currentVoice = () => voice

/** Parent setting on the test screen. */
export function setVoice(v) {
  voice = v
  try {
    localStorage.setItem(VOICE_KEY, v.voiceURI)
  } catch {
    /* storage blocked */
  }
}

/** Must be called from a user gesture (the big Play button) to unlock audio on iOS. */
export function unlockSpeech() {
  if (synth) {
    pickVoice()
    const u = new SpeechSynthesisUtterance('.')
    u.volume = 0
    u.lang = 'nl-NL'
    currentUtterance = u
    synth.speak(u)
    addLog('ontgrendeld')
  }
  const a = new Audio()
  a.muted = true
  a.play().catch(() => {})
}

export function stopSpeech() {
  token++
  if (synth && (synth.speaking || synth.pending)) synth.cancel()
  if (currentAudio) {
    currentAudio.pause()
    currentAudio = null
  }
}

/**
 * Say a line. Interrupts whatever is being said, so fast tapping stays snappy.
 * Returns a promise that resolves when the line is finished (or fails).
 */
export function say(key, text, { rate = 0.9, pitch = 1.15 } = {}) {
  const wasBusy = !!(synth && (synth.speaking || synth.pending)) || !!currentAudio
  stopSpeech()
  const my = token
  if (key && clips.has(key)) return playClip(key, my)
  return speakText(text, rate, pitch, my, wasBusy)
}

function playClip(key, my) {
  return new Promise((resolve) => {
    if (my !== token) return resolve()
    const a = new Audio(`${BASE}audio/nl/${key}.mp3`)
    currentAudio = a
    a.onended = a.onerror = () => resolve()
    a.play().catch(() => resolve())
  })
}

function speakText(text, rate, pitch, my, wasBusy) {
  return new Promise((resolve) => {
    if (!synth || !text) return resolve()
    if (!voice) pickVoice()

    const go = () => {
      if (my !== token) return resolve() // something newer was said meanwhile
      const u = new SpeechSynthesisUtterance(text)
      u.lang = voice?.lang || 'nl-NL'
      if (voice) u.voice = voice
      u.rate = rate
      u.pitch = pitch
      u.volume = 1
      let finished = false
      const done = () => {
        if (!finished) {
          finished = true
          resolve()
        }
      }
      u.onstart = () => addLog(`start: "${text}"`)
      u.onend = () => {
        addLog('klaar')
        done()
      }
      u.onerror = (e) => {
        addLog(`fout: ${e.error || 'onbekend'}`)
        done()
      }
      // Safety net: some iOS versions never fire onend.
      setTimeout(done, 1200 + text.length * 110)
      currentUtterance = u
      if (synth.paused) synth.resume()
      synth.speak(u)
      addLog(`spreek (${voice ? voice.name : 'geen NL-stem'}): "${text}"`)
    }

    // Speaking right after cancel() gets dropped on iOS, so give it a beat.
    if (wasBusy) setTimeout(go, 80)
    else go()
  })
}

// Speech for Kleine Ontdekker.
//
// Every spoken line has a stable KEY (e.g. "numbers.3.explore") and a TEXT.
// public/audio/nl/manifest.json maps keys to recorded clips:
//   { "clips": { "count.3": "3.mp3", "ui.welcome": "wat_zullen_we_oefenen.mp3" } }
// (a plain list ["count.3"] also works and means count.3.mp3).
// Keys without a clip are read by the iPad's built-in Dutch voice, so clips can
// be added one at a time without touching any code.
//
// Clips are played through Web Audio (the same unlocked AudioContext as the
// tap sounds), because iOS often blocks <audio>.play() outside a direct tap.
//
// iOS/Safari quirks handled here:
// - speak() straight after cancel() is sometimes silently dropped -> wait a moment.
// - The voice list often arrives late (or voiceschanged never fires) -> re-check lazily.
// - Utterances can be garbage-collected mid-speech -> keep a reference.

import { audioContext, unlockSfx } from './sfx.js'

const BASE = import.meta.env.BASE_URL
const VOICE_KEY = 'ko.voice'
const synth = typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null

let clips = new Map() // key -> file name
const buffers = new Map() // file name -> Promise<AudioBuffer|null>
let currentSource = null
let voice = null
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
    if (res.ok) {
      const raw = (await res.json()).clips || {}
      clips = Array.isArray(raw) ? new Map(raw.map((k) => [k, `${k}.mp3`])) : new Map(Object.entries(raw))
      addLog(`${clips.size} opnames gevonden`)
    }
  } catch {
    /* offline first run or no manifest: fall back to TTS only */
  }
  preloadClips()
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
  if (currentSource) {
    try {
      currentSource.stop()
    } catch {
      /* already stopped */
    }
    currentSource = null
  }
}

/**
 * Say a line. Interrupts whatever is being said, so fast tapping stays snappy.
 * Returns a promise that resolves when the line is finished (or fails).
 */
export function say(key, text, { rate = 0.9, pitch = 1.15 } = {}) {
  const wasBusy = !!(synth && (synth.speaking || synth.pending))
  stopSpeech()
  const my = token
  if (key && clips.has(key)) return playClip(key, text, rate, pitch, my)
  return speakText(text, rate, pitch, my, wasBusy)
}

/**
 * Say a line that may be built from parts ({ key, text, parts: [{ key, text }] }).
 * A clip for the whole line wins; otherwise, if every part has a clip, the parts
 * play back to back; otherwise the built-in voice reads the whole text.
 * A line without a key is just a sequence: each part plays on its own (clip or voice).
 * Parts can have parts themselves, e.g. "Schrijven!" + ("Schrijf de" + "drie").
 */
export async function sayLine(line) {
  await playLine(line)
}

/** Has a clip for the whole line, or for every piece of it. */
const covered = (l) => clips.has(l.key) || !!l.parts?.every(covered)

/** Returns false when something newer interrupted the line. */
async function playLine({ key, text, parts }) {
  const sequence = parts && (!key || (!clips.has(key) && parts.every(covered)))
  if (!sequence) {
    const done = say(key, text)
    const mine = token // say() has just claimed a new token
    await done
    return token === mine
  }
  for (const p of parts) if (!(await playLine(p))) return false
  return true
}

function loadClip(file) {
  if (!buffers.has(file)) {
    buffers.set(
      file,
      fetch(`${BASE}audio/nl/${file}`)
        .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(r.status))))
        .then((data) => {
          unlockSfx()
          const ctx = audioContext()
          // Safari's older callback form also works through this wrapper.
          return new Promise((res, rej) => ctx.decodeAudioData(data, res, rej))
        })
        .catch((e) => {
          addLog(`opname mislukt: ${file} (${e?.message || e})`)
          buffers.delete(file)
          return null
        }),
    )
  }
  return buffers.get(file)
}

async function playClip(key, text, rate, pitch, my) {
  const file = clips.get(key)
  const buffer = await loadClip(file)
  if (my !== token) return
  const ctx = audioContext()
  if (!buffer || !ctx) return speakText(text, rate, pitch, my, false) // fall back to the built-in voice
  if (ctx.state === 'suspended') ctx.resume()
  return new Promise((resolve) => {
    const src = ctx.createBufferSource()
    src.buffer = buffer
    src.connect(ctx.destination)
    src.onended = () => {
      if (currentSource === src) currentSource = null
      resolve()
    }
    currentSource = src
    src.start()
    addLog(`opname: ${file}`)
  })
}

/** Decode all clips ahead of time so the first tap isn't delayed. */
export function preloadClips() {
  for (const file of new Set(clips.values())) loadClip(file)
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
      let started = false
      u.onstart = () => {
        started = true
        addLog(`start: "${text}"`)
      }
      u.onend = () => {
        addLog('klaar')
        done()
      }
      u.onerror = (e) => {
        addLog(`fout: ${e.error || 'onbekend'}`)
        done()
      }
      // Safety nets: some iOS versions never fire onend, and sometimes the voice
      // never starts at all. Don't keep the game waiting on a silent voice.
      setTimeout(done, 1200 + text.length * 110)
      setTimeout(() => {
        if (!started && !finished) {
          addLog(`stem startte niet: "${text}"`)
          done()
        }
      }, 1500)
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

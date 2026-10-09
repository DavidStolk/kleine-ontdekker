import { useEffect, useState } from 'react'
import { currentVoice, dutchVoices, say, setVoice, speechLog } from '../lib/speech.js'
import { HoldButton } from './Controls.jsx'

/**
 * Parent screen (hold the gear on the start screen): shows what the device's
 * speech engine reports, lets you pick a Dutch voice and test it.
 */
export default function SpeechTest({ onBack }) {
  const [, setTick] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 500)
    return () => clearInterval(t)
  }, [])

  const synth = 'speechSynthesis' in window ? window.speechSynthesis : null
  const all = synth ? synth.getVoices() : []
  const dutch = dutchVoices()
  const active = currentVoice()
  const standalone = window.matchMedia?.('(display-mode: standalone)').matches || navigator.standalone

  // Called straight from the click, so iOS counts it as a user gesture.
  const test = (text) => say(null, text)

  return (
    <div className="speechtest">
      <HoldButton icon="back" onDone={onBack} />
      <h2>Spraaktest</h2>

      <div className="st-card">
        <div className="st-status">
          <span>Spraak ondersteund</span>
          <b className={synth ? 'st-ok' : 'st-bad'}>{synth ? 'ja' : 'nee'}</b>
          <span>Stemmen op dit apparaat</span>
          <b>{all.length}</b>
          <span>Nederlandse stemmen</span>
          <b className={dutch.length ? 'st-ok' : 'st-bad'}>{dutch.length}</b>
          <span>Gekozen stem</span>
          <b>{active ? `${active.name} (${active.lang})` : '—'}</b>
          <span>Bezig met spreken</span>
          <b>{synth?.speaking ? 'ja' : 'nee'}</b>
          <span>Geopend als app</span>
          <b>{standalone ? 'ja (beginscherm)' : 'nee (Safari)'}</b>
        </div>
      </div>

      <h3>Test</h3>
      <button className="st-btn" onClick={() => test('Hallo! Dit is de drie!')}>
        ▶ Zeg „Hallo! Dit is de drie!"
      </button>
      <button className="st-btn" onClick={() => test('één, twee, drie, vier, vijf')}>
        ▶ Tel tot vijf
      </button>

      <h3>Kies een stem</h3>
      {dutch.length === 0 && <p>Geen Nederlandse stem gevonden. Zie de tips hieronder.</p>}
      {dutch.map((v) => (
        <button
          key={v.voiceURI}
          className={`st-btn st-voice ${active?.voiceURI === v.voiceURI ? 'active' : ''}`}
          onClick={() => {
            setVoice(v)
            test(`Hallo, ik ben ${v.name}.`)
          }}
        >
          {v.name} · {v.lang}
        </button>
      ))}

      <h3>Wat er gebeurt</h3>
      <div className="st-log">{speechLog().join('\n') || 'Nog niets. Tik op een testknop.'}</div>

      <h3>Hoor je niets?</h3>
      <div className="st-card">
        <ul>
          <li>Zet het volume omhoog en controleer of het geluid niet gedempt is (Bedieningspaneel).</li>
          <li>
            Download een Nederlandse stem: Instellingen → Toegankelijkheid → Gesproken materiaal → Stemmen → Nederlands. Kies
            een „Verbeterde" of „Premium" stem en sluit daarna deze app helemaal af en open hem opnieuw.
          </li>
          <li>Probeer het ook eens in Safari zelf (niet via het beginscherm) om te zien of het daar wel werkt.</li>
        </ul>
      </div>
    </div>
  )
}

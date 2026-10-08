import { useEffect, useState } from 'react'
import { initSpeech, say, stopSpeech, unlockSpeech } from './lib/speech.js'
import { sfx, unlockSfx } from './lib/sfx.js'
import { lines, chooseLines } from './content/content.js'
import { decks } from './content/decks.jsx'
import { HoldButton } from './components/Controls.jsx'
import { Shape, Splat, CountObject } from './components/Visuals.jsx'
import Explore from './games/Explore.jsx'
import FindIt from './games/FindIt.jsx'
import Counting from './games/Counting.jsx'

// Screens: start → menu → (topic → mode) → game
export default function App() {
  const [screen, setScreen] = useState({ name: 'start' })

  useEffect(() => {
    initSpeech()
  }, [])

  const go = (s) => {
    stopSpeech()
    setScreen(s)
  }

  return (
    <div className="app">
      <Background />
      {screen.name === 'start' && <StartScreen onPlay={() => go({ name: 'menu', welcome: true })} />}
      {screen.name === 'menu' && <Menu welcome={screen.welcome} go={go} />}
      {screen.name === 'mode' && <ModePicker deck={decks[screen.deck]} go={go} />}
      {screen.name === 'game' && <Game screen={screen} go={go} />}
    </div>
  )
}

function StartScreen({ onPlay }) {
  function play() {
    // This first tap unlocks sound + speech on iOS.
    unlockSfx()
    unlockSpeech()
    sfx.yay()
    onPlay()
  }
  return (
    <div className="start">
      <h1 className="logo">
        {'Kleine'.split('').map((c, i) => (
          <span key={i} style={{ animationDelay: `${i * 80}ms` }}>{c}</span>
        ))}
        <br />
        {'Ontdekker'.split('').map((c, i) => (
          <span key={i} style={{ animationDelay: `${(i + 6) * 80}ms` }}>{c}</span>
        ))}
      </h1>
      <button className="play-btn" aria-label="Spelen" onPointerDown={play}>
        <svg viewBox="0 0 100 100">
          <path d="M36 24 L78 50 L36 76 Z" fill="#fff" stroke="#fff" strokeWidth="10" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  )
}

const TOPICS = [
  { id: 'numbers', icon: <span className="menu-glyph">123</span> },
  { id: 'letters', icon: <span className="menu-glyph">abc</span> },
  {
    id: 'shapes',
   
    icon: (
      <div className="menu-trio">
        <Shape id="cirkel" colour="#FF5D8F" />
        <Shape id="driehoek" colour="#4CC9F0" />
        <Shape id="ster" colour="#9B5DE5" />
      </div>
    ),
  },
  {
    id: 'colours',
   
    icon: (
      <div className="menu-trio">
        <Splat hex="#F2383A" />
        <Splat hex="#FFD23F" />
        <Splat hex="#2F7CF6" />
      </div>
    ),
  },
  {
    id: 'counting',
   
    icon: (
      <div className="menu-trio">
        <CountObject kind="appel" />
        <CountObject kind="appel" />
        <CountObject kind="appel" />
      </div>
    ),
  },
]

const TOPIC_COLOURS = { numbers: '#FF5D8F', letters: '#4CC9F0', shapes: '#FFB703', colours: '#3CC46B', counting: '#9B5DE5' }

function Menu({ welcome, go }) {
  useEffect(() => {
    if (welcome) say(lines.welcome.key, lines.welcome.text)
  }, [welcome])

  return (
    <div className="menu">
      <div className="menu-grid">
        {TOPICS.map((t, i) => (
          <button
            key={t.id}
            className="menu-tile pop-in"
            style={{ '--tile': TOPIC_COLOURS[t.id], animationDelay: `${i * 70}ms` }}
            onPointerDown={() => {
              sfx.pop()
              if (t.id === 'counting') go({ name: 'game', game: 'counting' })
              else go({ name: 'mode', deck: t.id })
            }}
          >
            {t.icon}
          </button>
        ))}
      </div>
    </div>
  )
}

function ModePicker({ deck, go }) {
  useEffect(() => {
    const l = chooseLines[deck.id]
    say(l.key, l.text)
  }, [deck])

  return (
    <div className="modes">
      <HoldButton icon="back" onDone={() => go({ name: 'menu' })} />
      <div className="mode-grid">
        <button
          className="mode-tile pop-in"
          style={{ '--tile': deck.colour }}
          onPointerDown={() => {
            sfx.pop()
            go({ name: 'game', game: 'explore', deck: deck.id })
          }}
        >
          <TapIcon />
        </button>
        <button
          className="mode-tile pop-in"
          style={{ '--tile': deck.colour, animationDelay: '90ms' }}
          onPointerDown={() => {
            sfx.pop()
            go({ name: 'game', game: 'find', deck: deck.id })
          }}
        >
          <SearchIcon />
        </button>
      </div>
    </div>
  )
}

function Game({ screen, go }) {
  const back = () => (screen.deck ? go({ name: 'mode', deck: screen.deck }) : go({ name: 'menu' }))
  const deck = decks[screen.deck]
  return (
    <div className="game">
      <HoldButton icon="back" onDone={back} />
      {screen.game === 'explore' && <Explore deck={deck} />}
      {screen.game === 'find' && <FindIt deck={deck} />}
      {screen.game === 'counting' && <Counting />}
    </div>
  )
}

function TapIcon() {
  return (
    <svg viewBox="0 0 100 100" className="mode-icon" aria-label="Ontdekken">
      <circle cx="50" cy="50" r="40" fill="none" stroke="#fff" strokeWidth="5" opacity=".45" className="ripple" />
      <circle cx="50" cy="50" r="26" fill="none" stroke="#fff" strokeWidth="6" opacity=".7" />
      <circle cx="50" cy="50" r="13" fill="#fff" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 100 100" className="mode-icon" aria-label="Zoeken">
      <circle cx="42" cy="42" r="24" fill="rgba(255,255,255,.25)" stroke="#fff" strokeWidth="9" />
      <path d="M60 60 L82 82" stroke="#fff" strokeWidth="13" strokeLinecap="round" />
    </svg>
  )
}

function Background() {
  return (
    <div className="bg" aria-hidden>
      <span className="blob b1" />
      <span className="blob b2" />
      <span className="blob b3" />
      <span className="blob b4" />
    </div>
  )
}

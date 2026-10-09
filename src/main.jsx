import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/fredoka'
import './styles.css'
import App from './App.jsx'
import { unlockSpeech } from './lib/speech.js'
import { unlockSfx } from './lib/sfx.js'

// Backup unlock: the first time a finger is lifted anywhere, unlock audio + speech.
// (iOS only allows this on touchend/click, not on touchstart/pointerdown.)
const unlockOnce = () => {
  unlockSfx()
  unlockSpeech()
  document.removeEventListener('touchend', unlockOnce)
  document.removeEventListener('click', unlockOnce)
}
document.addEventListener('touchend', unlockOnce)
document.addEventListener('click', unlockOnce)

// Stop iOS pinch-zoom and the long-press magnifier from getting in the way.
document.addEventListener('gesturestart', (e) => e.preventDefault())
document.addEventListener('contextmenu', (e) => e.preventDefault())

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

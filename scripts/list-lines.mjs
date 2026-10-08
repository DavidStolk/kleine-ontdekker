// Prints every spoken line as CSV (key;text) — a recording list for ElevenLabs etc.
//   npm run lines > lines.csv
import { allLines } from '../src/content/content.js'

console.log('key;text')
for (const { key, text } of allLines()) console.log(`${key};${text}`)

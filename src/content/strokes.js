// How each digit is written: the strokes in order, each drawn from start to end.
// Coordinates are in a 100 × 140 box (the digit itself runs from y=14 to y=126).
// The Schrijven game lets the child trace these with a finger, so the direction
// of each path matters: it's the direction the child learns to write.

const DIGITS = {
  0: ['M50 14 C20 14 18 50 18 70 C18 92 22 126 50 126 C78 126 82 92 82 70 C82 50 80 14 50 14'],
  1: ['M32 42 L60 14 L60 126'],
  2: ['M22 40 C22 4 82 4 80 42 C78 66 40 96 20 126 L84 126'],
  3: ['M22 32 C30 8 78 8 78 38 C78 58 62 68 44 68 C66 68 82 80 82 98 C82 132 28 134 20 110'],
  4: ['M58 14 L18 90 L86 90', 'M66 52 L66 126'],
  5: ['M30 14 L26 64 C42 50 84 54 82 92 C80 130 32 132 20 110', 'M30 14 L76 14'],
  6: ['M72 18 C52 6 22 26 20 80 C18 114 36 126 52 126 C70 126 82 112 82 94 C82 76 68 66 52 66 C36 66 22 76 20 90'],
  7: ['M18 14 L82 14 L38 126'],
  8: ['M50 14 C22 14 20 46 50 66 C80 84 82 126 50 126 C18 126 20 84 50 66 C80 46 78 14 50 14'],
  9: ['M80 38 C76 12 22 12 22 44 C22 74 76 76 80 38 L76 126'],
}

/**
 * The strokes for a number (1–10), laid out side by side.
 * Returns { viewBox, strokes: [{ d, x }] } where x shifts the stroke sideways.
 */
export function numberStrokes(n) {
  if (n === 10) {
    return {
      viewBox: '4 -4 160 148',
      strokes: [...DIGITS[1].map((d) => ({ d, x: -10 })), ...DIGITS[0].map((d) => ({ d, x: 64 }))],
    }
  }
  return { viewBox: '-4 -4 108 148', strokes: DIGITS[n].map((d) => ({ d, x: 0 })) }
}

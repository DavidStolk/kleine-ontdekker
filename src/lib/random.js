export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]

export function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Pick `count` distinct items including `target`, in random order. */
export function optionsWith(target, pool, count) {
  const others = shuffle(pool.filter((x) => x !== target)).slice(0, count - 1)
  return shuffle([target, ...others])
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// Renders public/favicon.svg to the PNG icons iOS and the PWA manifest need.
// Run once (or after changing the icon):  node scripts/make-icons.mjs
// Requires Playwright: npx -y playwright@latest install chromium (if not present)
import { chromium } from 'playwright'
import { readFile } from 'node:fs/promises'

const svg = await readFile(new URL('../public/favicon.svg', import.meta.url), 'utf8')
const browser = await chromium.launch()
const page = await browser.newPage()
for (const [name, size] of [['icon-192', 192], ['icon-512', 512], ['apple-touch-icon', 180]]) {
  await page.setViewportSize({ width: size, height: size })
  await page.setContent(
    `<style>html,body{margin:0}svg{width:${size}px;height:${size}px;display:block}</style>${svg}`,
  )
  await page.screenshot({ path: new URL(`../public/icons/${name}.png`, import.meta.url).pathname })
}
await browser.close()
console.log('Icons written to public/icons/')

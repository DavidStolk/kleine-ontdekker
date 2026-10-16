# Kleine Ontdekker

A Dutch learning game for toddlers (2–6) on the iPad: numbers, letters (taught by sound/klank), shapes and colours. It's a web app (React + Vite) that installs on the home screen and works offline.

## Run it

Needs Node 22 (Vite 8 doesn't work on Node 20.15 and older). With nvm, `nvm use` picks the version from `.nvmrc`.

```bash
nvm use
npm install
npm run dev        # opens on http://localhost:5173 and on your network
```

**Test on the iPad right away:** with the iPad on the same Wi-Fi, open the *Network* address that `npm run dev` prints (e.g. `http://192.168.1.20:5173`) in Safari. Everything works there except offline mode, which needs HTTPS (so GitHub Pages, below).

## What's in it

- **Big Play button** – the first tap also unlocks sound on iOS.
- **Menu** – Cijfers (123), Letters (abc), Vormen, Kleuren.
- **Ontdekken** (explore) – tap anything to hear what it is. Numbers count stars along with the voice.
- **Zoeken** (find it) – "Waar is de drie?" A wrong tap only gets a gentle wiggle and "Dat is de vier." There are no fail states.
- **Tellen** (counting, inside Cijfers) – tap each object and the app counts along. Each round has a random number of objects (1–10).
- **Schrijven** (writing, inside Cijfers) – trace a random number (1–10) with a finger. A dot first shows how the number is written, then arrows show the way along each stroke, in writing order. The stroke drawings live in `src/content/strokes.js`.
- **Back button = press and hold** for about 1 second, so little hands don't leave the game by accident.

## Install on the iPad (GitHub Pages)

1. Create a public repo named `kleine-ontdekker` on GitHub and push this folder to `main`.
2. In the repo, go to **Settings → Pages → Source: GitHub Actions**. The workflow in `.github/workflows/deploy.yml` builds and publishes on every push.
3. On the iPad, open `https://<your-username>.github.io/kleine-ontdekker/` in Safari, tap **Share → Add to Home Screen**, then open it once while online. After that it works offline.

If you name the repo differently, the workflow picks the name up automatically.

**Tip:** turn on **Guided Access** (Settings → Accessibility → Guided Access). Triple-clicking the side button then locks your child inside the app.

## Better voice: the iPad's Dutch voices

Until there are recorded clips, the app uses the iPad's built-in Dutch voice. Install a better one under **Settings → Accessibility → Spoken Content → Voices → Dutch (Nederlands)**: download an *Enhanced/Premium* voice (e.g. Claire or Xander). The app prefers those automatically.

## Your own voice and sounds (ElevenLabs, or record them yourself)

Every spoken line has a fixed key. To replace the built-in voice for a line:

1. `npm run lines > lines.csv` prints every key and its text (about 200 lines).
2. Put the mp3 in `public/audio/nl/`. Any file name works.
3. Map the key to the file in `public/audio/nl/manifest.json`:
   ```json
   { "clips": { "count.3": "3.mp3", "ui.welcome": "wat_zullen_we_oefenen.mp3" } }
   ```
   One file can serve several keys (e.g. `3.mp3` for both `count.3` and `numbers.3.explore`).

Lines without a clip keep using the built-in voice, so you can switch over gradually. **Start with the letters:** a text-to-speech voice can only approximate klanken ("buh", "mmm"). You can adjust these approximations in the `klank` column of `src/content/content.js`.

## Your own pictures

The placeholder art is drawn in code in `src/components/Visuals.jsx`. The letter pictures are emoji for now (`picture` in `src/content/content.js`). To use AI-generated illustrations (e.g. from Leonardo), put them in `public/images/`. Then swap the component, for example `<img src={`${import.meta.env.BASE_URL}images/beer.png`} />`.

## Showing or hiding topics

Edit `src/config.js`: topics listed there appear in the menu.

## Where things live

| What | File |
|---|---|
| All content (numbers, letters, shapes, colours, praise) | `src/content/content.js` |
| How each topic is drawn and spoken | `src/content/decks.jsx` |
| Games | `src/games/Explore.jsx`, `FindIt.jsx`, `Counting.jsx`, `Writing.jsx` |
| How each digit is written (strokes for Schrijven) | `src/content/strokes.js` |
| Speech (clip → built-in voice fallback) | `src/lib/speech.js` |
| Sound effects (synthesised) | `src/lib/sfx.js` |
| Styling | `src/styles.css` |
| App icon | `public/favicon.svg` → PNGs via `scripts/make-icons.mjs` |

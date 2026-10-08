# Kleine Ontdekker

A Dutch learning game for toddlers (2–6) on the iPad: numbers, letters (taught by sound/klank), shapes and colours. It's a web app (React + Vite) that installs on the home screen and works offline.

## Run it

```bash
npm install
npm run dev        # opens on http://localhost:5173 and on your network
```

**Test on the iPad right away:** with the iPad on the same Wi-Fi, open the *Network* address that `npm run dev` prints (e.g. `http://192.168.1.20:5173`) in Safari. Everything works there except offline mode, which needs HTTPS (so GitHub Pages, below).

## What's in it

- **Big Play button** – the first tap also unlocks sound on iOS.
- **Menu** – Cijfers (123), Letters (abc), Vormen, Kleuren, Tellen.
- **Ontdekken** (explore) – tap anything to hear what it is. Numbers count stars along with the voice.
- **Zoeken** (find it) – "Waar is de drie?" A wrong tap only gets a gentle wiggle and "Dat is de vier." There are no fail states.
- **Tellen** (counting) – tap each object and the app counts along. It starts at up to 5 objects and goes up to 10 after a few rounds.
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
2. Generate or record each line as an mp3 named `<key>.mp3`, for example `letters.b.explore.mp3`, and put it in `public/audio/nl/`.
3. Add the key to `public/audio/nl/manifest.json`:
   ```json
   { "clips": ["letters.b.explore", "letters.b.find"] }
   ```

Lines without a clip keep using the built-in voice, so you can switch over gradually. **Start with the letters:** a text-to-speech voice can only approximate klanken ("buh", "mmm"). You can adjust these approximations in the `klank` column of `src/content/content.js`.

## Your own pictures

The placeholder art is drawn in code in `src/components/Visuals.jsx`. The letter pictures are emoji for now (`picture` in `src/content/content.js`). To use AI-generated illustrations (e.g. from Leonardo), put them in `public/images/`. Then swap the component, for example `<img src={`${import.meta.env.BASE_URL}images/beer.png`} />`.

## Where things live

| What | File |
|---|---|
| All content (numbers, letters, shapes, colours, praise) | `src/content/content.js` |
| How each topic is drawn and spoken | `src/content/decks.jsx` |
| Games | `src/games/Explore.jsx`, `FindIt.jsx`, `Counting.jsx` |
| Speech (clip → built-in voice fallback) | `src/lib/speech.js` |
| Sound effects (synthesised) | `src/lib/sfx.js` |
| Styling | `src/styles.css` |
| App icon | `public/favicon.svg` → PNGs via `scripts/make-icons.mjs` |

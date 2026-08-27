# Found Words

**Give people back the words they've lost.**

Found Words is a free, open-source Progressive Web App (PWA) that helps people with speech and communication difficulties express themselves. A caregiver photographs the real objects, places, and people from someone's actual life — their favorite mug, their dog, their daughter — and can record a familiar voice to go with each one. The person taps a picture to communicate, and hears that voice out loud.

It was built for families navigating Parkinson's disease, Alzheimer's, stroke, ALS, aphasia, and other conditions that take away someone's ability to speak. No accounts. No subscriptions. No cloud. Just pictures, voices, taps, and communication.

**Live at [foundwords.org](https://foundwords.org)** — the app itself lives at [foundwords.org/app](https://foundwords.org/app).

---

## Who It's For

**People who use it to communicate:**
- Adults with Parkinson's disease, Alzheimer's, ALS, or MS
- Stroke or brain injury survivors with aphasia
- Anyone experiencing progressive speech or memory loss

**Caregivers who set it up:**
- Family members, partners, or adult children
- Speech-language pathologists
- Home health aides and care facility staff

Found Words works best when the photos and voices come from real life. A picture of *their* coffee maker — and *their daughter's* voice saying "Hi, Mom" — communicates far more than any generic icon.

---

## Key Features

### For the Person Communicating
- **Large, tappable picture cards** — easy to use with limited motor control
- **Personal photos** — real images from their life, not clip art
- **Familiar voices** — tap a card to hear a short recording (a loved one's voice, or their own)
- **Category navigation** — organized by topic (Food & Drink, People, Activities, Needs)
- **Visual feedback** — clear selection animation on every tap
- **Works offline** — fully functional without internet after first load
- **Installable** — add to home screen on iPhone, Android, or desktop

### For Caregivers
- **PIN-protected caregiver mode** — keeps the setup interface out of the way during use
- **Camera or upload** — take a photo directly or choose from the gallery
- **Voice recording** — record up to 10 seconds of audio for any card, right in the browser
- **Flexible organization** — create, rename, reorder, and color-code categories
- **Item management** — add, edit, reorder, and delete cards per category
- **Backup & restore** — download a full backup as a JSON file (photos and voices included) and restore it on any device
- **Auto-backup** — automatically save to a folder on supported browsers (Chrome)

### Privacy First
- **Everything stays on the device** — all photos, recordings, and data live in your browser's IndexedDB
- **No accounts, no login** — nothing to sign up for
- **Nothing ever leaves your device** — no analytics, no tracking, no cloud sync
- **Backup is yours** — the export file is a plain JSON file you control completely

---

## How It Works

### User Mode (the communication interface)

When you open Found Words, you land in User Mode — a full-screen, distraction-free interface:

1. The screen shows a grid of **category cards** (Food & Drink, People, etc.)
2. Tapping a category opens a grid of **picture cards** for that category
3. Tapping a picture highlights it with a pulse — and plays its voice recording, if one exists (cards with a recording show a 🔊 badge)
4. A back button returns to categories

The settings gear in the corner is the only way into Caregiver Mode, and it requires a PIN.

### Caregiver Mode (the setup interface)

Tap the gear icon and enter the PIN (default: **1234**) to access the management dashboard:

- **Categories** — add new categories, choose an emoji and color, reorder them
- **Items** — add a photo (camera or file), write a label, record an optional voice clip, and reorder within categories
- **Settings** — change the PIN, back up or restore data, set up auto-backup

When you're done, tap "Exit Caregiver Mode" to return to the communication interface.

---

## Project Structure

The site is two things served from one domain: a marketing homepage at the root, and the app at `/app`.

```
site/            Static marketing homepage (index.html) + self-cleaning root service worker
src/             The React app
  components/      UI (UserMode, CaregiverMode, ItemEdit, Settings, ...)
  db/              IndexedDB access (via idb)
  utils/           Backup / restore
scripts/         Icon generation + build-site.mjs (assembles dist/)
public/          App icons + CNAME (custom domain)
docs/            Maintainer notes (support playbook, funding notes)
```

`npm run build` runs the Vite build (which emits the app with a `/app/` base) and then `scripts/build-site.mjs`, which arranges `dist/`: the homepage at the root, the app under `dist/app/`, the `CNAME` at the root, and a small self-cleaning service worker at `/sw.js` that retires any older root-scoped install so returning visitors get the homepage.

---

## Tech Stack

| Layer | Technology |
|---|---|
| UI Framework | [React 19](https://react.dev/) |
| Styling | [Tailwind CSS 4](https://tailwindcss.com/) |
| Build Tool | [Vite 6](https://vite.dev/) |
| PWA | [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) + Workbox |
| Storage | [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) via [idb](https://github.com/jakearchibald/idb) |
| Audio | [MediaRecorder API](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder) — in-browser recording |
| Deployment | GitHub Pages via GitHub Actions, custom domain |

No backend. No database server. No authentication service. The whole thing ships as static files.

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) 20 or later
- npm (comes with Node.js)

### Local Development

```bash
git clone https://github.com/Ord3rProductions/FoundWords.git
cd FoundWords
npm install
npm run dev
```

The dev server runs the **app** at [http://localhost:5173/app/](http://localhost:5173/app/) — the app uses a `/app/` base. Hot module replacement is on, so source changes update instantly.

> The marketing homepage in `site/` is assembled at build time, so it doesn't appear under `npm run dev`. To preview the whole site (homepage + app) together, run `npm run build && npm run preview`.

### Build for Production

```bash
npm run build
```

Output goes to `dist/` — the homepage at the root and the app under `dist/app/`. Preview it locally with `npm run preview`.

---

## Deployment

Found Words deploys to **GitHub Pages** via the workflow at `.github/workflows/deploy.yml`, which builds and publishes on every push to `main`. The production site is served at the custom domain configured in `public/CNAME` (foundwords.org).

To deploy your own fork:

1. Fork the repository
2. Go to **Settings → Pages** and set the source to **GitHub Actions**
3. Update `public/CNAME` to your own domain, or delete it to use the default `github.io` URL
4. Push to `main` — the workflow builds and deploys

The homepage lands at the site root and the app at `/app`. The app is built with a `/app/` base (in `vite.config.js`); adjust that base if you host it somewhere else.

### Self-Hosted

Because Found Words is a static site, you can host the `dist/` folder anywhere — Netlify, Vercel, Cloudflare Pages, or any web server (nginx, Apache, Caddy) — or run it from a local file server for completely offline use.

---

## Data & Privacy

Found Words stores everything in your browser's **IndexedDB** — the same local storage used by offline-capable email and note apps. Nothing is ever sent to a server.

**What's stored locally:**
- Category names, icons, and colors
- Item labels
- Item photos (compressed JPEG, max 800px)
- Item voice recordings (short audio clips)
- Your caregiver PIN
- Auto-backup folder handle (if configured)

**Backup format:** The backup/restore feature exports a single `.json` file containing all your categories, items, photos, and recordings (as base64 data URLs). Keep it safe — it's the only copy of your data outside the browser.

**Clearing data:** Clearing your browser's site data deletes all Found Words data, so back up regularly. Because the data lives in the browser on that device, it may also be included in the device's own backups (for example iCloud or Google) — so keep the device itself secure.

---

## Contributing

Found Words started as a personal project built for a family member with Parkinson's disease. If it can help other families too, that would mean everything. Contributions of all kinds are welcome.

### Ways to Contribute
- **Report something that isn't working** — open an issue with steps to reproduce
- **Suggest an idea** — open an issue describing the use case
- **Improve accessibility** — always a priority for this kind of app
- **Translate the UI** — help make it available in more languages
- **Write tests** — the project has no automated tests yet
- **Improve docs** — clearer setup, caregiver guides, etc.

### Development Setup

```bash
git clone https://github.com/Ord3rProductions/FoundWords.git
cd FoundWords
npm install
npm run dev
```

Standard React + Vite conventions. App components live in `src/components/`, data access in `src/db/`, and backup utilities in `src/utils/`; the marketing homepage is in `site/`.

### Filing Issues

Please include:
- What you were trying to do
- What happened instead
- Your browser and operating system
- Whether it happens on mobile, desktop, or both

### Pull Request Guidelines

1. **Open an issue first** for anything beyond small fixes — it's worth aligning before investing time
2. **Keep PRs focused** — one feature or fix per PR
3. **Test on mobile** — the primary use case is a tablet or phone held by someone with limited motor control
4. **Respect the privacy design** — no network requests, analytics, or external dependencies that phone home
5. **Keep it simple** — the users include elderly people and those with cognitive changes alongside physical ones; simpler is almost always better

---

## Feedback

If Found Words is helping your family, we'd love to hear about it — and if something isn't working, tell us. Email **hello@foundwords.org**, or use the contact form at [foundwords.org](https://foundwords.org/#contact).

---

## License

MIT License — see [LICENSE](LICENSE) for details.

You're free to use, modify, and distribute Found Words for any purpose, including building it into care facility systems or other assistive technology tools.

---

## Acknowledgments

Built with love for everyone who has watched a family member lose the ability to say what they mean — and for everyone working to give those words back.

# Found Words

**Give people back the words they've lost.**

Found Words is a free, open-source Progressive Web App (PWA) that helps people with speech and communication difficulties express themselves. A caregiver photographs real objects, places, and people from someone's actual life — their favorite mug, their dog, their daughter — and the person can tap those pictures to communicate.

It was built for families navigating Parkinson's disease, stroke, ALS, aphasia, and other conditions that take away someone's ability to speak. No accounts. No subscriptions. No cloud. Just pictures, taps, and communication.

---

## Who It's For

**People who use it to communicate:**
- Adults with Parkinson's disease, ALS, or MS
- Stroke or brain injury survivors with aphasia
- Anyone experiencing progressive speech loss

**Caregivers who set it up:**
- Family members, partners, or adult children
- Speech-language pathologists
- Home health aides and care facility staff

Found Words works best when the photos come from real life. A picture of *their* coffee maker communicates more clearly than a generic icon.

---

## Key Features

### For the Person Communicating
- **Large, tappable picture cards** — easy to use with limited motor control
- **Personal photos** — real images from their life, not clip art
- **Category navigation** — organized by topic (Food & Drink, People, Activities, Needs)
- **Visual feedback** — clear selection animation on every tap
- **Works offline** — fully functional without internet after first load
- **Installable** — add to home screen on iPhone, Android, or desktop

### For Caregivers
- **PIN-protected caregiver mode** — keeps the setup interface out of the way during use
- **Camera or upload** — take a photo directly or choose from the gallery
- **Flexible organization** — create, rename, reorder, and color-code categories
- **Item management** — add, edit, reorder, and delete pictures per category
- **Backup & restore** — download a full backup as a JSON file and restore it on any device
- **Auto-backup** — automatically save to a folder on supported browsers (Chrome)

### Privacy First
- **Everything stays on the device** — all photos and data live in your browser's IndexedDB
- **No accounts, no login** — nothing to sign up for
- **No data ever leaves your device** — no analytics, no tracking, no cloud sync
- **Backup is yours** — the export file is a plain JSON file you control completely

---

## How It Works

### User Mode (the communication interface)

When you open Found Words, you land in User Mode. This is the full-screen, distraction-free interface:

1. The screen shows a grid of **category cards** (Food & Drink, People, etc.)
2. Tapping a category opens a grid of **picture cards** for that category
3. Tapping a picture selects it with a visual pulse animation
4. A back button returns to categories

The settings gear in the corner is the only way into Caregiver Mode, and it requires a PIN.

### Caregiver Mode (the setup interface)

Tap the gear icon and enter the PIN (default: **1234**) to access the management dashboard:

- **Categories** — add new categories, choose an emoji and color, reorder them
- **Items** — add photos (from camera or file), write a label, reorder within categories
- **Settings** — change the PIN, back up or restore data, set up auto-backup

When you're done, tap "Exit Caregiver Mode" to return to the communication interface.

---

## Tech Stack

| Layer | Technology |
|---|---|
| UI Framework | [React 19](https://react.dev/) |
| Styling | [Tailwind CSS 4](https://tailwindcss.com/) |
| Build Tool | [Vite 6](https://vite.dev/) |
| PWA | [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) + Workbox |
| Storage | [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) via [idb](https://github.com/jakearchibald/idb) |
| Deployment | GitHub Pages via GitHub Actions |

No backend. No database server. No authentication service. The whole app ships as static files.

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 20 or later
- npm (comes with Node.js)

### Local Development

```bash
# Clone the repository
git clone https://github.com/Ord3rProductions/FoundWords.git
cd FoundWords

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

The dev server includes hot module replacement — changes to source files update instantly without a full reload.

### Build for Production

```bash
npm run build
```

Output goes to `dist/`. Preview the production build locally:

```bash
npm run preview
```

---

## Deployment

### GitHub Pages (recommended)

The repository includes a GitHub Actions workflow at `.github/workflows/deploy.yml` that automatically builds and deploys to GitHub Pages on every push to `main`.

To deploy your own fork:

1. Fork the repository
2. Go to **Settings → Pages** in your fork
3. Set the source to **GitHub Actions**
4. Push to `main` — the workflow will handle the rest

The app will be live at `https://<your-username>.github.io/FoundWords/`.

### Self-Hosted

Because Found Words is a static site, it can be hosted anywhere that serves HTML files:

- Netlify, Vercel, Cloudflare Pages (drag and drop the `dist/` folder)
- Any web server (nginx, Apache, Caddy)
- A local file server for completely offline use

If you change the hosting path, update `base` in `vite.config.js` to match.

---

## Data & Privacy

Found Words stores everything in your browser's **IndexedDB** — the same local storage used by email clients and note-taking apps that work offline. Nothing is ever sent to a server.

**What's stored locally:**
- Category names, icons, and colors
- Item labels
- Item photos (compressed JPEG, max 800px)
- Your caregiver PIN
- Auto-backup folder handle (if configured)

**Backup format:** The backup/restore feature exports a single `.json` file containing all your categories, items, and photos (as base64 data URLs). Keep this file safe — it's the only copy of your data outside the browser.

**Clearing data:** If you clear your browser's site data, all Found Words data will be deleted. Use the backup feature regularly.

---

## Contributing

Found Words started as a personal project built for a family member with Parkinson's disease. If it can help other families too, that would mean everything. Contributions of all kinds are welcome.

### Ways to Contribute

- **Report a bug** — open an issue with steps to reproduce
- **Suggest a feature** — open an issue describing the use case
- **Improve accessibility** — always a priority for this kind of app
- **Translate the UI** — help make it available in more languages
- **Write tests** — the project has no automated tests yet
- **Improve docs** — clearer setup instructions, guides for caregivers, etc.

### Development Setup

```bash
git clone https://github.com/Ord3rProductions/FoundWords.git
cd FoundWords
npm install
npm run dev
```

The project uses standard React + Vite conventions. Components live in `src/components/`, database logic in `src/db/`, and backup utilities in `src/utils/`.

### Filing Issues

When filing a bug report, please include:
- What you were trying to do
- What happened instead
- Your browser and operating system
- Whether the issue happens on mobile, desktop, or both

### Pull Request Guidelines

1. **Open an issue first** for anything beyond small fixes — it's worth aligning before investing time
2. **Keep PRs focused** — one feature or fix per PR
3. **Test on mobile** — the primary use case is a tablet or phone held by someone with limited motor control
4. **Respect the privacy design** — don't introduce any network requests, analytics, or external dependencies that phone home
5. **Keep it simple** — the target users include elderly people and those with cognitive changes alongside physical ones; simpler is almost always better

---

## License

MIT License — see [LICENSE](LICENSE) for details.

You're free to use, modify, and distribute Found Words for any purpose, including building it into care facility systems or other assistive technology tools.

---

## Acknowledgments

Built with love for everyone who has watched a family member lose the ability to say what they mean — and for everyone working to give those words back.

If Found Words is helping your family, we'd love to hear about it.

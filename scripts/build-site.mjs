// Post-build reorganizer.
//
// `vite build` (base: '/app/') emits the React PWA into dist/ with all URLs
// prefixed /app/. This script rearranges dist/ so it matches those URLs and adds
// the static marketing homepage:
//
//   dist/index.html        <- marketing homepage (from site/)
//   dist/sw.js             <- self-destroying worker that frees old '/' installs
//   dist/CNAME             <- custom domain (kept at root)
//   dist/app/...           <- the React PWA (index.html, assets, sw.js, icons...)
//
import { existsSync, mkdirSync, readdirSync, renameSync, rmSync, cpSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')
const appDir = join(dist, 'app')
const site = join(root, 'site')

if (!existsSync(dist)) {
  console.error('[build-site] dist/ not found — run `vite build` first.')
  process.exit(1)
}

// 1. Move everything currently in dist/ into dist/app/
mkdirSync(appDir, { recursive: true })
for (const entry of readdirSync(dist)) {
  if (entry === 'app') continue
  renameSync(join(dist, entry), join(appDir, entry))
}

// 2. Lift CNAME back to the site root (custom domain must resolve at /).
const cnameInApp = join(appDir, 'CNAME')
if (existsSync(cnameInApp)) renameSync(cnameInApp, join(dist, 'CNAME'))

// 3. Copy the static marketing site (homepage, root sw, assets) to dist root.
//    site/root-sw.js is published as dist/sw.js (self-destroying migration worker).
for (const entry of readdirSync(site)) {
  const from = join(site, entry)
  const to = entry === 'root-sw.js' ? join(dist, 'sw.js') : join(dist, entry)
  cpSync(from, to, { recursive: true })
}

console.log('[build-site] Homepage at /, app at /app/, CNAME at root. Done.')

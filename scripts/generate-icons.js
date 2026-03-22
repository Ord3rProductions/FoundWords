#!/usr/bin/env node
/**
 * Generates PNG icons for the Found Words PWA.
 * Uses only Node.js built-ins (zlib) — no external dependencies.
 */
import { deflateSync } from 'zlib'
import { writeFileSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const OUT_DIR = resolve(__dirname, '../public/icons')

function crc32(buf) {
  const table = new Uint32Array(256)
  for (let i = 0; i < 256; i++) {
    let c = i
    for (let j = 0; j < 8; j++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    table[i] = c >>> 0
  }
  let crc = 0xffffffff
  for (let i = 0; i < buf.length; i++) {
    crc = (table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8)) >>> 0
  }
  return (crc ^ 0xffffffff) >>> 0
}

function pngChunk(type, data) {
  const tb = Buffer.from(type, 'ascii')
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const crcVal = Buffer.alloc(4)
  crcVal.writeUInt32BE(crc32(Buffer.concat([tb, data])))
  return Buffer.concat([len, tb, data, crcVal])
}

function makePNG(size, pixelFn) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8  // bit depth
  ihdr[9] = 2  // truecolor RGB

  const rowBytes = 1 + size * 3
  const raw = Buffer.alloc(size * rowBytes)
  for (let y = 0; y < size; y++) {
    raw[y * rowBytes] = 0 // filter: None
    for (let x = 0; x < size; x++) {
      const [r, g, b] = pixelFn(x, y, size)
      const o = y * rowBytes + 1 + x * 3
      raw[o] = r; raw[o + 1] = g; raw[o + 2] = b
    }
  }

  return Buffer.concat([
    sig,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', deflateSync(raw)),
    pngChunk('IEND', Buffer.alloc(0)),
  ])
}

function inRoundedRect(x, y, size, radius, margin) {
  const x0 = margin, y0 = margin
  const x1 = size - 1 - margin, y1 = size - 1 - margin
  if (x < x0 || x > x1 || y < y0 || y > y1) return false
  const r = radius
  if (x < x0 + r && y < y0 + r) return Math.hypot(x - (x0 + r), y - (y0 + r)) <= r
  if (x > x1 - r && y < y0 + r) return Math.hypot(x - (x1 - r), y - (y0 + r)) <= r
  if (x < x0 + r && y > y1 - r) return Math.hypot(x - (x0 + r), y - (y1 - r)) <= r
  if (x > x1 - r && y > y1 - r) return Math.hypot(x - (x1 - r), y - (y1 - r)) <= r
  return true
}

function drawIcon(x, y, size) {
  const pad = Math.round(size * 0.04)
  const bgRadius = Math.round(size * 0.18)

  if (!inRoundedRect(x, y, size, bgRadius, pad)) {
    return [248, 247, 244]
  }

  // Blue background: #4A90D9
  const BG = [74, 144, 217]

  // 3×3 grid of white "picture cards"
  const cols = 3, rows = 3
  const gridPad = Math.round(size * 0.13)
  const gap = Math.round(size * 0.045)
  const cellW = Math.round((size - 2 * gridPad - (cols - 1) * gap) / cols)
  const cellH = Math.round((size - 2 * gridPad - (rows - 1) * gap) / rows)
  const cellR = Math.round(size * 0.035)

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cx = gridPad + col * (cellW + gap)
      const cy = gridPad + row * (cellH + gap)
      if (x >= cx && x < cx + cellW && y >= cy && y < cy + cellH) {
        if (inRoundedRect(x - cx, y - cy, Math.max(cellW, cellH), cellR, 0)) {
          // Subtle inner color tone for visual interest
          const shade = (row + col) % 2 === 0 ? 255 : 245
          return [shade, shade, shade]
        }
      }
    }
  }

  return BG
}

try {
  mkdirSync(OUT_DIR, { recursive: true })

  for (const size of [192, 512]) {
    const png = makePNG(size, drawIcon)
    writeFileSync(resolve(OUT_DIR, `icon-${size}.png`), png)
    console.log(`✓ Generated icon-${size}.png`)
  }

  // SVG icon
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="18" fill="#4A90D9"/>
  <rect x="11" y="11" width="23" height="23" rx="4" fill="white"/>
  <rect x="38.5" y="11" width="23" height="23" rx="4" fill="white" opacity="0.9"/>
  <rect x="66" y="11" width="23" height="23" rx="4" fill="white"/>
  <rect x="11" y="38.5" width="23" height="23" rx="4" fill="white" opacity="0.9"/>
  <rect x="38.5" y="38.5" width="23" height="23" rx="4" fill="white"/>
  <rect x="66" y="38.5" width="23" height="23" rx="4" fill="white" opacity="0.9"/>
  <rect x="11" y="66" width="23" height="23" rx="4" fill="white"/>
  <rect x="38.5" y="66" width="23" height="23" rx="4" fill="white" opacity="0.9"/>
  <rect x="66" y="66" width="23" height="23" rx="4" fill="white"/>
</svg>`
  writeFileSync(resolve(OUT_DIR, 'icon.svg'), svg)
  console.log('✓ Generated icon.svg')
} catch (e) {
  console.warn('Icon generation warning:', e.message)
  process.exit(0)
}

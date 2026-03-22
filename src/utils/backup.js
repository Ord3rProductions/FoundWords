import { getSetting, setSetting } from '../db/index.js'

// ── Manual backup ─────────────────────────────────────────────────────────────

export function downloadBackup(data) {
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `foundwords-backup-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function readBackupFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => {
      try {
        const data = JSON.parse(e.target.result)
        if (!data.version || !Array.isArray(data.categories)) {
          throw new Error('Invalid backup format')
        }
        resolve(data)
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}

// ── Auto-backup via File System Access API ────────────────────────────────────

const FS_ACCESS_SUPPORTED = typeof window !== 'undefined' && 'showDirectoryPicker' in window

export function isAutoBackupSupported() {
  return FS_ACCESS_SUPPORTED
}

// Module-level handle cache (survives re-renders, lost on page reload)
let _cachedHandle = null

async function getStoredHandle() {
  if (_cachedHandle) return _cachedHandle
  try {
    // FileSystemDirectoryHandle can be stored directly in IndexedDB in Chrome
    const { getDB } = await import('../db/index.js')
    const db = await getDB()
    const rec = await db.get('settings', '_autoBackupDir')
    if (rec?.value) {
      _cachedHandle = rec.value
      return _cachedHandle
    }
  } catch {
    // IDB storage of handles may not be supported everywhere
  }
  return null
}

async function storeHandle(handle) {
  _cachedHandle = handle
  try {
    await setSetting('_autoBackupDir', handle)
  } catch {
    // Ignore — in-memory cache is still useful for the session
  }
}

export async function setupAutoBackup() {
  if (!FS_ACCESS_SUPPORTED) return false
  try {
    const handle = await window.showDirectoryPicker({ mode: 'readwrite' })
    await storeHandle(handle)
    return true
  } catch {
    return false
  }
}

export async function autoBackup(data) {
  if (!FS_ACCESS_SUPPORTED) return false
  const handle = await getStoredHandle()
  if (!handle) return false

  try {
    let perm = await handle.queryPermission({ mode: 'readwrite' })
    if (perm !== 'granted') {
      perm = await handle.requestPermission({ mode: 'readwrite' })
    }
    if (perm !== 'granted') return false

    const fileHandle = await handle.getFileHandle('foundwords-backup.json', { create: true })
    const writable = await fileHandle.createWritable()
    await writable.write(JSON.stringify(data, null, 2))
    await writable.close()
    return true
  } catch {
    _cachedHandle = null
    return false
  }
}

export async function hasAutoBackupFolder() {
  const handle = await getStoredHandle()
  return handle !== null
}

export async function clearAutoBackupFolder() {
  _cachedHandle = null
  try {
    await setSetting('_autoBackupDir', null)
  } catch {
    // ignore
  }
}

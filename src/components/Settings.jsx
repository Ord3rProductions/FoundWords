import { useState, useEffect } from 'react'
import {
  getSetting,
  setSetting,
  exportAllData,
  importAllData,
} from '../db/index.js'
import {
  downloadBackup,
  readBackupFile,
  setupAutoBackup,
  hasAutoBackupFolder,
  clearAutoBackupFolder,
  isAutoBackupSupported,
} from '../utils/backup.js'

export default function Settings({ onBack }) {
  // ── PIN change ──────────────────────────────────────────────────────────────
  const [currentPin, setCurrentPin] = useState('')
  const [newPin, setNewPin]         = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [pinMsg, setPinMsg]         = useState(null) // { type: 'success'|'error', text }

  // ── Backup ──────────────────────────────────────────────────────────────────
  const [backupMsg, setBackupMsg]           = useState(null)
  const [autoFolderSet, setAutoFolderSet]   = useState(false)
  const [restoreFile, setRestoreFile]       = useState(null)
  const [confirmRestore, setConfirmRestore] = useState(false)

  useEffect(() => {
    hasAutoBackupFolder().then(setAutoFolderSet)
  }, [])

  // ── PIN handlers ─────────────────────────────────────────────────────────────
  async function handleChangePin() {
    setPinMsg(null)
    if (currentPin.length !== 4 || newPin.length !== 4 || confirmPin.length !== 4) {
      setPinMsg({ type: 'error', text: 'All PINs must be exactly 4 digits.' }); return
    }
    if (!/^\d{4}$/.test(newPin)) {
      setPinMsg({ type: 'error', text: 'PIN must be 4 digits (numbers only).' }); return
    }
    if (newPin !== confirmPin) {
      setPinMsg({ type: 'error', text: 'New PIN and confirmation do not match.' }); return
    }
    const stored = await getSetting('pin')
    if (currentPin !== (stored ?? '1234')) {
      setPinMsg({ type: 'error', text: 'Current PIN is incorrect.' }); return
    }
    await setSetting('pin', newPin)
    setPinMsg({ type: 'success', text: 'PIN updated successfully.' })
    setCurrentPin(''); setNewPin(''); setConfirmPin('')
  }

  // ── Backup handlers ──────────────────────────────────────────────────────────
  async function handleDownload() {
    try {
      const data = await exportAllData()
      downloadBackup(data)
      setBackupMsg({ type: 'success', text: 'Backup downloaded.' })
    } catch {
      setBackupMsg({ type: 'error', text: 'Download failed. Please try again.' })
    }
  }

  async function handleSetAutoFolder() {
    const ok = await setupAutoBackup()
    setAutoFolderSet(ok)
    if (ok) {
      // Trigger an immediate backup
      const data = await exportAllData()
      const { autoBackup } = await import('../utils/backup.js')
      await autoBackup(data)
      setBackupMsg({ type: 'success', text: 'Auto-backup folder set. Backup saved.' })
    } else {
      setBackupMsg({ type: 'error', text: 'Could not set auto-backup folder.' })
    }
  }

  async function handleClearAutoFolder() {
    await clearAutoBackupFolder()
    setAutoFolderSet(false)
    setBackupMsg({ type: 'success', text: 'Auto-backup folder cleared.' })
  }

  function handleRestoreFileSelect(e) {
    const file = e.target.files?.[0]
    if (file) { setRestoreFile(file); setConfirmRestore(true) }
    e.target.value = ''
  }

  async function handleConfirmRestore() {
    setConfirmRestore(false)
    try {
      const data = await readBackupFile(restoreFile)
      await importAllData(data)
      setBackupMsg({ type: 'success', text: 'Backup restored. Reload the page to see changes.' })
    } catch (e) {
      setBackupMsg({ type: 'error', text: `Restore failed: ${e.message}` })
    }
    setRestoreFile(null)
  }

  return (
    <div className="flex flex-col min-h-screen bg-bg page-enter">
      {/* Header */}
      <header className="bg-surface border-b border-border px-4 pt-4 pb-3 safe-top flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-bg transition-colors text-muted"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
        <h1 className="text-lg font-bold text-text">Settings</h1>
      </header>

      <main className="flex-1 px-4 py-6 space-y-8 overflow-y-auto max-w-lg mx-auto w-full">

        {/* ── Change PIN ─────────────────────────────────────────────────── */}
        <Section title="Security" icon="🔒">
          <div className="space-y-3">
            <PinInput label="Current PIN" value={currentPin} onChange={setCurrentPin} />
            <PinInput label="New PIN" value={newPin} onChange={setNewPin} />
            <PinInput label="Confirm New PIN" value={confirmPin} onChange={setConfirmPin} />
            {pinMsg && <Msg {...pinMsg} />}
            <button
              onClick={handleChangePin}
              className="w-full bg-primary text-white rounded-xl py-3 font-semibold active:scale-95 transition-transform"
            >
              Change PIN
            </button>
          </div>
        </Section>

        {/* ── Backup & Restore ───────────────────────────────────────────── */}
        <Section title="Backup &amp; Restore" icon="💾">
          <div className="space-y-3">
            {backupMsg && <Msg {...backupMsg} />}

            {/* Download */}
            <button
              onClick={handleDownload}
              className="w-full bg-surface border border-border rounded-xl py-3.5 font-semibold text-text flex items-center justify-center gap-2 hover:bg-bg active:scale-95 transition-all"
            >
              <span>⬇️</span> Download Backup
            </button>

            {/* Auto-backup */}
            {isAutoBackupSupported() && (
              autoFolderSet ? (
                <div className="bg-success-light border border-success rounded-xl px-4 py-3 flex items-center gap-3">
                  <span className="text-xl">✅</span>
                  <div className="flex-1">
                    <p className="font-semibold text-success text-sm">Auto-backup active</p>
                    <p className="text-xs text-muted">Changes are saved automatically to your chosen folder.</p>
                  </div>
                  <button
                    onClick={handleClearAutoFolder}
                    className="text-xs text-muted hover:text-danger underline shrink-0"
                  >
                    Clear
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleSetAutoFolder}
                  className="w-full bg-surface border border-border rounded-xl py-3.5 font-semibold text-text flex items-center justify-center gap-2 hover:bg-bg active:scale-95 transition-all"
                >
                  <span>📂</span> Set Auto-Backup Folder
                </button>
              )
            )}

            {/* Restore */}
            <label className="w-full bg-surface border border-border rounded-xl py-3.5 font-semibold text-text flex items-center justify-center gap-2 hover:bg-bg active:scale-95 transition-all cursor-pointer">
              <span>⬆️</span> Restore from Backup
              <input
                type="file"
                accept="application/json,.json"
                onChange={handleRestoreFileSelect}
                className="hidden"
              />
            </label>

            <p className="text-xs text-muted text-center">
              Restoring will overwrite all current data.
            </p>
          </div>
        </Section>

        {/* ── Feedback ───────────────────────────────────────────────────── */}
        <Section title="Feedback" icon="✉️">
          <a
            href="mailto:feedback@foundwords.app?subject=Found%20Words%20Feedback"
            className="w-full bg-surface border border-border rounded-xl py-3.5 font-semibold text-text flex items-center justify-center gap-2 hover:bg-bg transition-colors block text-center"
          >
            📨 Send Feedback
          </a>
        </Section>

        {/* ── About ─────────────────────────────────────────────────────── */}
        <Section title="About" icon="ℹ️">
          <div className="space-y-3">
            <div className="bg-primary-xlight rounded-xl px-4 py-4">
              <p className="font-semibold text-primary-dark text-sm mb-1">Privacy Statement</p>
              <p className="text-sm text-text leading-relaxed">
                Your photos and data are stored only on this device.
                Found Words never collects, transmits, or has access to
                your personal information.
              </p>
            </div>
            <p className="text-xs text-muted text-center">Found Words v0.1.0</p>
          </div>
        </Section>
      </main>

      {/* Restore confirm dialog */}
      {confirmRestore && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-6">
          <div className="bg-surface rounded-3xl p-6 w-full max-w-sm shadow-xl">
            <h2 className="text-xl font-bold text-text mb-2">Restore Backup?</h2>
            <p className="text-muted text-sm mb-6">
              This will replace <strong>all</strong> your current categories, items, and settings
              with the contents of <strong>{restoreFile?.name}</strong>. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => { setConfirmRestore(false); setRestoreFile(null) }}
                className="flex-1 bg-bg border border-border rounded-xl py-3 font-semibold text-text"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRestore}
                className="flex-1 bg-danger text-white rounded-xl py-3 font-semibold"
              >
                Restore
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Section({ title, icon, children }) {
  return (
    <div>
      <h2 className="text-base font-bold text-text mb-3 flex items-center gap-2">
        <span>{icon}</span> {title}
      </h2>
      <div className="bg-surface rounded-2xl border border-border p-4 shadow-sm">
        {children}
      </div>
    </div>
  )
}

function PinInput({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-muted mb-1">{label}</label>
      <input
        type="password"
        inputMode="numeric"
        maxLength={4}
        value={value}
        onChange={e => onChange(e.target.value.replace(/\D/g, '').slice(0, 4))}
        placeholder="• • • •"
        className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 text-lg text-text tracking-widest placeholder:text-border focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light text-center"
      />
    </div>
  )
}

function Msg({ type, text }) {
  const styles = {
    success: 'bg-success-light text-success border-success',
    error:   'bg-danger-light text-danger border-danger',
  }
  return (
    <div className={`rounded-xl px-3 py-2.5 text-sm font-medium border ${styles[type]}`}>
      {text}
    </div>
  )
}

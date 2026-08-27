import { useState, useEffect, useRef } from 'react'
import { getItemsByCategory, saveItem } from '../db/index.js'
import { getCategories } from '../db/index.js'

async function resizeImageToDataURL(file, maxPx = 800, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      let { naturalWidth: w, naturalHeight: h } = img
      if (w > maxPx || h > maxPx) {
        if (w >= h) { h = Math.round(h * maxPx / w); w = maxPx }
        else        { w = Math.round(w * maxPx / h); h = maxPx }
      }
      const canvas = document.createElement('canvas')
      canvas.width = w; canvas.height = h
      canvas.getContext('2d').drawImage(img, 0, 0, w, h)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    img.onerror = reject
    img.src = url
  })
}

function blobToDataURL(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('read failed'))
    reader.readAsDataURL(blob)
  })
}

// Pick a recording format the browser actually supports (Safari prefers mp4,
// Chrome/Firefox prefer webm/opus).
function pickAudioMime() {
  if (typeof MediaRecorder === 'undefined') return ''
  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/ogg']
  for (const c of candidates) {
    try { if (MediaRecorder.isTypeSupported(c)) return c } catch { /* ignore */ }
  }
  return ''
}

const MAX_RECORD_MS = 10000

export default function ItemEdit({ itemId, categoryId, onSave, onCancel }) {
  const [label, setLabel] = useState('')
  const [photo, setPhoto] = useState(null)
  const [audio, setAudio] = useState(null)          // data URL of the voice clip, or null
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [category, setCategory] = useState(null)

  // Recording state
  const [recording, setRecording] = useState(false)
  const [elapsedMs, setElapsedMs] = useState(0)
  const [audioError, setAudioError] = useState('')

  const cameraRef = useRef(null)
  const galleryRef = useRef(null)
  const recorderRef = useRef(null)
  const chunksRef = useRef([])
  const streamRef = useRef(null)
  const timerRef = useRef(null)

  const isNew = !itemId

  useEffect(() => {
    getCategories().then(cats => setCategory(cats.find(c => c.id === categoryId) ?? null))

    if (!itemId) return
    getItemsByCategory(categoryId).then(items => {
      const item = items.find(i => i.id === itemId)
      if (item) {
        setLabel(item.label)
        setPhoto(item.photo ?? null)
        setAudio(item.audio ?? null)
      }
    })
  }, [itemId, categoryId])

  // Release the mic / timer if the editor is closed mid-recording.
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      try { recorderRef.current?.state !== 'inactive' && recorderRef.current?.stop() } catch { /* ignore */ }
      stopStream()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function stopStream() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
  }

  async function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const dataUrl = await resizeImageToDataURL(file)
      setPhoto(dataUrl)
    } catch {
      setError('Could not load image. Please try another file.')
    }
    e.target.value = '' // reset so same file can be re-selected
  }

  async function startRecording() {
    setAudioError('')
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setAudioError('Voice recording isn’t supported on this browser. Try Chrome or Safari.')
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const mime = pickAudioMime()
      const recorder = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream)
      chunksRef.current = []
      recorder.ondataavailable = e => { if (e.data && e.data.size) chunksRef.current.push(e.data) }
      recorder.onstop = async () => {
        stopStream()
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' })
        if (!blob.size) { setAudioError('That recording was empty — please try again.'); return }
        try { setAudio(await blobToDataURL(blob)) }
        catch { setAudioError('Could not save the recording. Please try again.') }
      }
      recorder.start()
      recorderRef.current = recorder
      setRecording(true)
      setElapsedMs(0)
      const started = Date.now()
      timerRef.current = setInterval(() => {
        const ms = Date.now() - started
        setElapsedMs(ms)
        if (ms >= MAX_RECORD_MS) stopRecording()
      }, 100)
    } catch (err) {
      stopStream()
      setAudioError(
        err?.name === 'NotAllowedError' || err?.name === 'SecurityError'
          ? 'Microphone access was blocked. Allow the microphone and try again.'
          : 'Could not start recording. Please check your microphone.'
      )
    }
  }

  function stopRecording() {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
    try {
      if (recorderRef.current && recorderRef.current.state !== 'inactive') recorderRef.current.stop()
    } catch { /* ignore */ }
    setRecording(false)
  }

  async function handleSave() {
    const trimmed = label.trim()
    if (!trimmed) { setError('Please enter a label for this item.'); return }
    if (recording) stopRecording()

    setSaving(true)
    try {
      await saveItem(
        itemId
          ? { id: itemId, categoryId, label: trimmed, photo, audio }
          : { categoryId, label: trimmed, photo, audio }
      )
      onSave()
    } catch {
      setError('Failed to save. Please try again.')
      setSaving(false)
    }
  }

  const seconds = (elapsedMs / 1000).toFixed(1)

  return (
    <div className="flex flex-col min-h-screen bg-bg page-enter">
      {/* Header */}
      <header className="bg-surface border-b border-border px-4 pt-4 pb-3 safe-top flex items-center gap-3">
        <button
          onClick={onCancel}
          className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-bg transition-colors text-muted"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-text">{isNew ? 'New Item' : 'Edit Item'}</h1>
          {category && (
            <p className="text-xs text-muted">{category.icon} {category.name}</p>
          )}
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-primary text-white rounded-xl px-4 py-2 font-semibold text-sm disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </header>

      <main className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
        {/* Photo area */}
        <div>
          <label className="block text-sm font-semibold text-muted mb-3">Photo</label>

          {/* Photo preview */}
          <div
            className="w-full max-w-xs mx-auto aspect-square rounded-3xl overflow-hidden bg-primary-xlight flex items-center justify-center border-2 border-dashed border-primary-light mb-4"
          >
            {photo ? (
              <img src={photo} alt={label || 'item'} className="w-full h-full object-cover" />
            ) : (
              <div className="text-center p-6">
                <span className="text-6xl block mb-2">📷</span>
                <p className="text-muted text-sm">No photo yet</p>
              </div>
            )}
          </div>

          {/* Camera / gallery buttons */}
          <div className="flex gap-3 max-w-xs mx-auto">
            <button
              onClick={() => cameraRef.current?.click()}
              className="flex-1 bg-primary text-white rounded-2xl py-3.5 font-semibold text-base flex flex-col items-center gap-1.5 active:scale-95 transition-transform"
            >
              <span className="text-2xl">📸</span>
              <span className="text-sm">Take Photo</span>
            </button>
            <button
              onClick={() => galleryRef.current?.click()}
              className="flex-1 bg-surface border border-border text-text rounded-2xl py-3.5 font-semibold text-base flex flex-col items-center gap-1.5 active:scale-95 transition-transform hover:bg-bg"
            >
              <span className="text-2xl">🖼️</span>
              <span className="text-sm">Upload</span>
            </button>
          </div>

          {/* Hidden file inputs */}
          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFile}
            className="hidden"
          />
          <input
            ref={galleryRef}
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="hidden"
          />

          {photo && (
            <div className="flex justify-center mt-3">
              <button
                onClick={() => setPhoto(null)}
                className="text-danger text-sm font-medium hover:underline"
              >
                Remove photo
              </button>
            </div>
          )}
        </div>

        {/* Label input */}
        <div>
          <label className="block text-sm font-semibold text-muted mb-2">Label</label>
          <input
            type="text"
            value={label}
            onChange={e => { setLabel(e.target.value); setError('') }}
            placeholder="e.g. Apple juice"
            className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-lg text-text placeholder:text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light"
          />
          {error && <p className="text-danger text-sm mt-1">{error}</p>}
        </div>

        {/* Voice recording (optional) */}
        <div>
          <label className="block text-sm font-semibold text-muted mb-1">Voice <span className="font-normal">(optional)</span></label>
          <p className="text-xs text-muted mb-3">
            Record up to 10 seconds — a familiar voice saying this out loud. It plays when the card is tapped.
          </p>

          {!recording && !audio && (
            <button
              onClick={startRecording}
              className="w-full bg-surface border border-border text-text rounded-2xl py-3.5 font-semibold flex items-center justify-center gap-2 active:scale-95 transition-transform hover:bg-bg"
            >
              <span className="text-2xl">🎤</span>
              <span>Record a voice clip</span>
            </button>
          )}

          {recording && (
            <div className="rounded-2xl border border-danger/40 bg-danger-light/60 p-4 flex flex-col items-center gap-3">
              <div className="flex items-center gap-2 text-danger font-semibold">
                <span className="w-3 h-3 rounded-full bg-danger rec-pulse" aria-hidden="true"></span>
                <span>Recording… {seconds}s <span className="text-muted font-normal">/ 10s</span></span>
              </div>
              <button
                onClick={stopRecording}
                className="bg-danger text-white rounded-xl px-6 py-2.5 font-semibold active:scale-95 transition-transform"
              >
                ⏹ Stop
              </button>
            </div>
          )}

          {audio && !recording && (
            <div className="rounded-2xl border border-border bg-surface p-4 space-y-3">
              <div className="flex items-center gap-2 text-accent-dark font-semibold text-sm">
                <span className="text-lg" aria-hidden="true">🔊</span>
                <span>Voice clip saved</span>
              </div>
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <audio src={audio} controls className="w-full" />
              <div className="flex gap-4 justify-center">
                <button onClick={startRecording} className="text-primary-dark text-sm font-medium hover:underline">
                  Re-record
                </button>
                <button onClick={() => { setAudio(null); setAudioError('') }} className="text-danger text-sm font-medium hover:underline">
                  Remove voice
                </button>
              </div>
            </div>
          )}

          {audioError && <p className="text-danger text-sm mt-2">{audioError}</p>}
        </div>

        {/* Preview card */}
        {(label.trim() || photo) && (
          <div>
            <label className="block text-sm font-semibold text-muted mb-3">Preview</label>
            <div className="w-32 rounded-2xl overflow-hidden border border-border shadow-sm bg-surface">
              <div className="relative aspect-square bg-primary-xlight flex items-center justify-center overflow-hidden">
                {photo
                  ? <img src={photo} alt={label} className="w-full h-full object-cover" />
                  : <span className="text-4xl opacity-40">📷</span>
                }
                {audio && (
                  <span className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/55 text-white text-xs flex items-center justify-center" aria-hidden="true">🔊</span>
                )}
              </div>
              <div className="px-2 py-2 text-center">
                <span className="text-sm font-semibold text-text leading-tight">{label || '…'}</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

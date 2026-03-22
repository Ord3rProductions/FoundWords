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

export default function ItemEdit({ itemId, categoryId, onSave, onCancel }) {
  const [label, setLabel] = useState('')
  const [photo, setPhoto] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [category, setCategory] = useState(null)

  const cameraRef = useRef(null)
  const galleryRef = useRef(null)

  const isNew = !itemId

  useEffect(() => {
    getCategories().then(cats => setCategory(cats.find(c => c.id === categoryId) ?? null))

    if (!itemId) return
    getItemsByCategory(categoryId).then(items => {
      const item = items.find(i => i.id === itemId)
      if (item) {
        setLabel(item.label)
        setPhoto(item.photo ?? null)
      }
    })
  }, [itemId, categoryId])

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

  async function handleSave() {
    const trimmed = label.trim()
    if (!trimmed) { setError('Please enter a label for this item.'); return }

    setSaving(true)
    try {
      await saveItem(
        itemId
          ? { id: itemId, categoryId, label: trimmed, photo }
          : { categoryId, label: trimmed, photo }
      )
      onSave()
    } catch {
      setError('Failed to save. Please try again.')
      setSaving(false)
    }
  }

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

        {/* Preview card */}
        {(label.trim() || photo) && (
          <div>
            <label className="block text-sm font-semibold text-muted mb-3">Preview</label>
            <div className="w-32 rounded-2xl overflow-hidden border border-border shadow-sm bg-surface">
              <div className="aspect-square bg-primary-xlight flex items-center justify-center overflow-hidden">
                {photo
                  ? <img src={photo} alt={label} className="w-full h-full object-cover" />
                  : <span className="text-4xl opacity-40">📷</span>
                }
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

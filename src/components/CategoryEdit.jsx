import { useState, useEffect } from 'react'
import { getCategories, saveCategory } from '../db/index.js'

const COLORS = [
  { label: 'Yellow',  value: '#FEF9C3' },
  { label: 'Green',   value: '#DCFCE7' },
  { label: 'Blue',    value: '#DBEAFE' },
  { label: 'Purple',  value: '#EDE9FE' },
  { label: 'Orange',  value: '#FED7AA' },
  { label: 'Pink',    value: '#FCE7F3' },
  { label: 'Teal',    value: '#CCFBF1' },
  { label: 'Red',     value: '#FEE2E2' },
]

const EMOJIS = [
  '🍽️','🥤','🤝','👨‍👩‍👧','⚽','🏠','😊','❤️',
  '🚗','📚','🎵','🌿','💊','🛒','🐾','✈️',
  '💬','🌞','🌙','⭐','🎁','📷','🎨','🔑',
]

export default function CategoryEdit({ categoryId, onSave, onCancel }) {
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('📁')
  const [color, setColor] = useState('#DBEAFE')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const isNew = !categoryId

  useEffect(() => {
    if (!categoryId) return
    getCategories().then(cats => {
      const cat = cats.find(c => c.id === categoryId)
      if (cat) {
        setName(cat.name)
        setIcon(cat.icon ?? '📁')
        setColor(cat.color ?? '#DBEAFE')
      }
    })
  }, [categoryId])

  async function handleSave() {
    const trimmed = name.trim()
    if (!trimmed) { setError('Please enter a category name.'); return }

    setSaving(true)
    try {
      await saveCategory(
        categoryId
          ? { id: categoryId, name: trimmed, icon, color }
          : { name: trimmed, icon, color }
      )
      onSave()
    } catch (e) {
      setError('Failed to save. Please try again.')
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-bg page-enter">
      <header className="bg-surface border-b border-border px-4 pt-4 pb-3 safe-top flex items-center gap-3">
        <button
          onClick={onCancel}
          className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-bg transition-colors text-muted"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
        <h1 className="text-lg font-bold text-text flex-1">{isNew ? 'New Category' : 'Edit Category'}</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-primary text-white rounded-xl px-4 py-2 font-semibold text-sm disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </header>

      <main className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
        {/* Preview */}
        <div className="flex justify-center">
          <div
            className="w-28 h-28 rounded-3xl flex flex-col items-center justify-center gap-2 shadow-sm"
            style={{ backgroundColor: color }}
          >
            <span className="text-5xl">{icon}</span>
            <span className="text-sm font-semibold text-text text-center px-2 truncate w-full text-center">{name || 'Name'}</span>
          </div>
        </div>

        {/* Name input */}
        <div>
          <label className="block text-sm font-semibold text-muted mb-2">Category Name</label>
          <input
            type="text"
            value={name}
            onChange={e => { setName(e.target.value); setError('') }}
            placeholder="e.g. Food & Drink"
            className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-lg text-text placeholder:text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light"
          />
          {error && <p className="text-danger text-sm mt-1">{error}</p>}
        </div>

        {/* Emoji picker */}
        <div>
          <label className="block text-sm font-semibold text-muted mb-2">Icon</label>
          <div className="grid grid-cols-8 gap-1.5">
            {EMOJIS.map(e => (
              <button
                key={e}
                onClick={() => setIcon(e)}
                className={`h-11 rounded-xl text-2xl flex items-center justify-center transition-all ${
                  icon === e ? 'bg-primary-light ring-2 ring-primary scale-110' : 'bg-surface hover:bg-bg'
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        {/* Color picker */}
        <div>
          <label className="block text-sm font-semibold text-muted mb-2">Card Color</label>
          <div className="grid grid-cols-4 gap-3">
            {COLORS.map(c => (
              <button
                key={c.value}
                onClick={() => setColor(c.value)}
                title={c.label}
                className={`h-12 rounded-xl transition-all ${
                  color === c.value ? 'ring-2 ring-primary ring-offset-2 scale-105' : 'hover:scale-105'
                }`}
                style={{ backgroundColor: c.value }}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

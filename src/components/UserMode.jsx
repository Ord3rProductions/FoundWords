import { useState, useEffect, useCallback } from 'react'
import { getCategories, getItemsByCategory } from '../db/index.js'

// ── Category Grid ─────────────────────────────────────────────────────────────

function CategoryGrid({ onSelect, onCaregiverMode }) {
  const [categories, setCategories] = useState([])

  useEffect(() => {
    getCategories().then(setCategories)
  }, [])

  return (
    <div className="flex flex-col min-h-screen bg-bg">
      {/* Top bar */}
      <header className="flex items-center justify-between px-4 pt-4 pb-2 safe-top">
        <div className="flex items-center gap-2">
          <span className="text-2xl">💬</span>
          <h1 className="text-xl font-bold text-text">Found Words</h1>
        </div>
        <button
          onClick={onCaregiverMode}
          aria-label="Caregiver mode"
          className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-border transition-colors text-muted hover:text-text"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
            <path d="M12 2v2m0 16v2M2 12h2m16 0h2"/>
          </svg>
        </button>
      </header>

      {/* Grid */}
      <main className="flex-1 px-4 pb-6 pt-2">
        {categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center px-6">
            <div className="text-5xl mb-4">📷</div>
            <p className="text-xl font-semibold text-text mb-2">No categories yet</p>
            <p className="text-muted">
              Tap the settings icon above to enter Caregiver mode and add photos.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map(cat => (
              <CategoryCard key={cat.id} category={cat} onSelect={onSelect} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function CategoryCard({ category, onSelect }) {
  const [pressed, setPressed] = useState(false)

  return (
    <button
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => { setPressed(false); onSelect(category.id) }}
      onPointerLeave={() => setPressed(false)}
      className="rounded-2xl p-5 flex flex-col items-center justify-center gap-3 min-h-[130px] shadow-sm border border-transparent transition-all duration-150 active:scale-95 select-none"
      style={{
        backgroundColor: category.color ?? '#EBF4FF',
        transform: pressed ? 'scale(0.95)' : 'scale(1)',
      }}
    >
      <span className="text-5xl leading-none">{category.icon || '📁'}</span>
      <span className="text-lg font-semibold text-text text-center leading-tight">{category.name}</span>
    </button>
  )
}

// ── Item Grid ─────────────────────────────────────────────────────────────────

function ItemGrid({ categoryId, selectedItemId, setSelectedItemId, onBack }) {
  const [category, setCategory] = useState(null)
  const [items, setItems] = useState([])

  useEffect(() => {
    getCategories().then(cats => {
      const c = cats.find(c => c.id === categoryId)
      setCategory(c ?? null)
    })
    getItemsByCategory(categoryId).then(setItems)
  }, [categoryId])

  const handleSelectItem = useCallback((id) => {
    setSelectedItemId(prev => prev === id ? null : id)
  }, [setSelectedItemId])

  return (
    <div className="flex flex-col min-h-screen bg-bg">
      {/* Top bar */}
      <header
        className="flex items-center gap-3 px-4 pt-4 pb-3 safe-top shadow-sm"
        style={{ backgroundColor: category?.color ?? 'var(--color-surface)' }}
      >
        <button
          onClick={() => { setSelectedItemId(null); onBack() }}
          aria-label="Back to categories"
          className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-black/10 transition-colors shrink-0"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
        <span className="text-3xl leading-none">{category?.icon}</span>
        <h2 className="text-xl font-bold text-text">{category?.name}</h2>

        {selectedItemId && (
          <button
            onClick={() => setSelectedItemId(null)}
            className="ml-auto w-10 h-10 flex items-center justify-center rounded-full bg-black/10 text-text shrink-0"
            aria-label="Clear selection"
          >
            ✕
          </button>
        )}
      </header>

      {/* Items */}
      <main className="flex-1 px-4 pb-6 pt-4">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center px-6">
            <div className="text-5xl mb-4">📷</div>
            <p className="text-xl font-semibold text-text mb-2">No items yet</p>
            <p className="text-muted">Ask your caregiver to add items to this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map(item => (
              <ItemCard
                key={item.id}
                item={item}
                selected={selectedItemId === item.id}
                onSelect={handleSelectItem}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function ItemCard({ item, selected, onSelect }) {
  return (
    <button
      onClick={() => onSelect(item.id)}
      className={`
        rounded-2xl overflow-hidden flex flex-col shadow-sm transition-all duration-150 active:scale-95 select-none text-left
        ${selected
          ? 'ring-4 ring-primary scale-[1.03] shadow-lg item-selected'
          : 'border border-border hover:border-primary hover:shadow-md'
        }
      `}
      style={{ backgroundColor: 'var(--color-surface)' }}
    >
      {/* Photo */}
      <div className="w-full aspect-square bg-primary-xlight flex items-center justify-center overflow-hidden">
        {item.photo ? (
          <img
            src={item.photo}
            alt={item.label}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <span className="text-5xl opacity-40">📷</span>
        )}
      </div>
      {/* Label */}
      <div className={`px-3 py-3 text-center ${selected ? 'bg-primary-xlight' : ''}`}>
        <span className={`text-lg font-semibold leading-tight ${selected ? 'text-primary-dark' : 'text-text'}`}>
          {item.label}
        </span>
      </div>
    </button>
  )
}

// ── UserMode wrapper ──────────────────────────────────────────────────────────

export default function UserMode({
  categoryId,
  setCategoryId,
  selectedItemId,
  setSelectedItemId,
  onCaregiverMode,
}) {
  if (categoryId) {
    return (
      <ItemGrid
        categoryId={categoryId}
        selectedItemId={selectedItemId}
        setSelectedItemId={setSelectedItemId}
        onBack={() => setCategoryId(null)}
      />
    )
  }

  return (
    <CategoryGrid
      onSelect={id => { setSelectedItemId(null); setCategoryId(id) }}
      onCaregiverMode={onCaregiverMode}
    />
  )
}

import { useState, useEffect, useCallback } from 'react'
import {
  getCategories,
  getItemsByCategory,
  deleteItem,
  moveItemUp,
  moveItemDown,
} from '../db/index.js'

export default function ItemList({ categoryId, onBack, onAddItem, onEditItem }) {
  const [category, setCategory] = useState(null)
  const [items, setItems] = useState([])
  const [busy, setBusy] = useState(false)

  const reload = useCallback(async () => {
    const [cats, its] = await Promise.all([
      getCategories(),
      getItemsByCategory(categoryId),
    ])
    setCategory(cats.find(c => c.id === categoryId) ?? null)
    setItems(its)
  }, [categoryId])

  useEffect(() => { reload() }, [reload])

  async function handleDelete(id, label) {
    if (!window.confirm(`Delete "${label}"? This cannot be undone.`)) return
    setBusy(true)
    await deleteItem(id)
    await reload()
    setBusy(false)
  }

  async function handleMove(id, dir) {
    setBusy(true)
    if (dir === 'up') await moveItemUp(id, categoryId)
    else await moveItemDown(id, categoryId)
    await reload()
    setBusy(false)
  }

  return (
    <div className="flex flex-col min-h-screen bg-bg page-enter">
      {/* Header */}
      <header
        className="flex items-center gap-3 px-4 pt-4 pb-3 safe-top border-b border-border"
        style={{ backgroundColor: category?.color ?? 'var(--color-surface)' }}
      >
        <button
          onClick={onBack}
          className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-black/10 transition-colors"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
        <span className="text-2xl">{category?.icon}</span>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-text">{category?.name}</h1>
          <p className="text-xs text-muted">{items.length} item{items.length !== 1 ? 's' : ''}</p>
        </div>
      </header>

      {/* Items */}
      <main className="flex-1 px-4 py-4 overflow-y-auto">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <div className="text-5xl mb-3">📷</div>
            <p className="text-lg font-semibold text-text mb-1">No items yet</p>
            <p className="text-muted text-sm">Tap "Add Item" to add the first one.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item, idx) => (
              <ItemRow
                key={item.id}
                item={item}
                isFirst={idx === 0}
                isLast={idx === items.length - 1}
                disabled={busy}
                onEdit={() => onEditItem(item.id)}
                onDelete={() => handleDelete(item.id, item.label)}
                onMoveUp={() => handleMove(item.id, 'up')}
                onMoveDown={() => handleMove(item.id, 'down')}
              />
            ))}
          </div>
        )}
      </main>

      {/* Add button */}
      <div className="px-4 py-4 safe-bottom border-t border-border bg-surface">
        <button
          onClick={onAddItem}
          className="w-full bg-primary text-white rounded-2xl py-4 text-lg font-semibold flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-sm"
        >
          <span className="text-2xl">+</span>
          Add Item
        </button>
      </div>
    </div>
  )
}

function ItemRow({ item, isFirst, isLast, disabled, onEdit, onDelete, onMoveUp, onMoveDown }) {
  return (
    <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-sm flex">
      {/* Thumbnail */}
      <div className="w-20 h-20 shrink-0 bg-primary-xlight flex items-center justify-center overflow-hidden">
        {item.photo ? (
          <img src={item.photo} alt={item.label} className="w-full h-full object-cover" />
        ) : (
          <span className="text-3xl opacity-40">📷</span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-between px-3 py-2 min-w-0">
        <p className="font-semibold text-text text-base leading-tight truncate">{item.label}</p>
        <div className="flex gap-2 mt-1">
          <button
            onClick={onEdit}
            className="text-primary text-sm font-medium hover:underline"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="text-danger text-sm font-medium hover:underline"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Reorder */}
      <div className="flex flex-col justify-center gap-0.5 px-2">
        <button
          onClick={onMoveUp}
          disabled={isFirst || disabled}
          aria-label="Move up"
          className="w-8 h-8 flex items-center justify-center rounded-lg text-muted hover:text-text hover:bg-bg disabled:opacity-30 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 15l-6-6-6 6"/></svg>
        </button>
        <button
          onClick={onMoveDown}
          disabled={isLast || disabled}
          aria-label="Move down"
          className="w-8 h-8 flex items-center justify-center rounded-lg text-muted hover:text-text hover:bg-bg disabled:opacity-30 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
        </button>
      </div>
    </div>
  )
}

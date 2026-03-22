import { useState, useEffect, useCallback } from 'react'
import {
  getCategories,
  deleteCategory,
  moveCategoryUp,
  moveCategoryDown,
} from '../db/index.js'

export default function CaregiverDashboard({
  onExit,
  onSettings,
  onEditCategory,
  onNewCategory,
  onManageItems,
}) {
  const [categories, setCategories] = useState([])
  const [busy, setBusy] = useState(false)

  const reload = useCallback(() => getCategories().then(setCategories), [])

  useEffect(() => { reload() }, [reload])

  async function handleDelete(id, name) {
    if (!window.confirm(`Delete "${name}" and all its items? This cannot be undone.`)) return
    setBusy(true)
    await deleteCategory(id)
    await reload()
    setBusy(false)
  }

  async function handleMove(id, dir) {
    setBusy(true)
    if (dir === 'up') await moveCategoryUp(id)
    else await moveCategoryDown(id)
    await reload()
    setBusy(false)
  }

  return (
    <div className="flex flex-col min-h-screen bg-bg page-enter">
      {/* Header */}
      <header className="bg-surface border-b border-border px-4 pt-4 pb-3 safe-top flex items-center gap-3">
        <button
          onClick={onExit}
          aria-label="Exit caregiver mode"
          className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-bg transition-colors text-muted"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-text">Caregiver Mode</h1>
          <p className="text-xs text-muted">Manage categories &amp; items</p>
        </div>
        <button
          onClick={onSettings}
          aria-label="Settings"
          className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-bg transition-colors text-muted"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </button>
      </header>

      {/* Category list */}
      <main className="flex-1 px-4 py-4 overflow-y-auto">
        {categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <div className="text-5xl mb-3">📂</div>
            <p className="text-lg font-semibold text-text mb-1">No categories yet</p>
            <p className="text-muted text-sm">Tap "Add Category" below to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {categories.map((cat, idx) => (
              <CategoryRow
                key={cat.id}
                category={cat}
                isFirst={idx === 0}
                isLast={idx === categories.length - 1}
                disabled={busy}
                onEdit={() => onEditCategory(cat.id)}
                onManage={() => onManageItems(cat.id)}
                onDelete={() => handleDelete(cat.id, cat.name)}
                onMoveUp={() => handleMove(cat.id, 'up')}
                onMoveDown={() => handleMove(cat.id, 'down')}
              />
            ))}
          </div>
        )}
      </main>

      {/* Add button */}
      <div className="px-4 py-4 safe-bottom border-t border-border bg-surface">
        <button
          onClick={onNewCategory}
          className="w-full bg-primary text-white rounded-2xl py-4 text-lg font-semibold flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-sm"
        >
          <span className="text-2xl">+</span>
          Add Category
        </button>
      </div>
    </div>
  )
}

function CategoryRow({ category, isFirst, isLast, disabled, onEdit, onManage, onDelete, onMoveUp, onMoveDown }) {
  return (
    <div
      className="bg-surface rounded-2xl border border-border overflow-hidden shadow-sm"
      style={{ borderLeft: `4px solid ${category.color ?? 'var(--color-primary)'}` }}
    >
      {/* Main row */}
      <div className="flex items-center px-4 py-3 gap-3">
        <span className="text-3xl w-10 text-center">{category.icon || '📁'}</span>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-text text-lg leading-tight truncate">{category.name}</p>
        </div>
        {/* Reorder buttons */}
        <div className="flex flex-col gap-0.5 mr-1">
          <button
            onClick={onMoveUp}
            disabled={isFirst || disabled}
            aria-label="Move up"
            className="w-7 h-7 flex items-center justify-center rounded-lg text-muted hover:text-text hover:bg-bg disabled:opacity-30 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 15l-6-6-6 6"/></svg>
          </button>
          <button
            onClick={onMoveDown}
            disabled={isLast || disabled}
            aria-label="Move down"
            className="w-7 h-7 flex items-center justify-center rounded-lg text-muted hover:text-text hover:bg-bg disabled:opacity-30 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
          </button>
        </div>
      </div>
      {/* Action bar */}
      <div className="border-t border-border flex">
        <button
          onClick={onManage}
          className="flex-1 py-2.5 text-sm font-medium text-primary hover:bg-primary-xlight transition-colors flex items-center justify-center gap-1.5"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
          Manage Items
        </button>
        <div className="w-px bg-border" />
        <button
          onClick={onEdit}
          className="px-5 py-2.5 text-sm font-medium text-muted hover:bg-bg transition-colors"
        >
          Edit
        </button>
        <div className="w-px bg-border" />
        <button
          onClick={onDelete}
          className="px-5 py-2.5 text-sm font-medium text-danger hover:bg-danger-light transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  )
}

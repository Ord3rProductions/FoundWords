import { useState, useEffect, useCallback } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { getDB } from './db/index.js'
import UserMode from './components/UserMode.jsx'
import CaregiverMode from './components/CaregiverMode.jsx'
import UpdateToast from './components/UpdateToast.jsx'

export default function App() {
  const [dbReady, setDbReady] = useState(false)
  const [dbError, setDbError] = useState(null)

  // ── Navigation ──────────────────────────────────────────────────────────────
  // mode: 'user' | 'caregiver'
  const [mode, setMode] = useState('user')
  const [caregiverAuthed, setCaregiverAuthed] = useState(false)

  // User mode: null = category grid, string = items for that category
  const [userCategoryId, setUserCategoryId] = useState(null)
  // Selected item in user mode (visual feedback)
  const [selectedItemId, setSelectedItemId] = useState(null)

  // Caregiver mode views: 'categories' | 'items' | 'editCategory' | 'editItem' | 'settings'
  const [caregiverView, setCaregiverView] = useState('categories')
  const [caregiverCategoryId, setCaregiverCategoryId] = useState(null)
  const [caregiverItemId, setCaregiverItemId] = useState(null) // null = create new

  // ── PWA update toast ────────────────────────────────────────────────────────
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  // ── DB init ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    getDB()
      .then(() => setDbReady(true))
      .catch(err => setDbError(err.message))
  }, [])

  // ── Mode handlers ────────────────────────────────────────────────────────────
  const enterCaregiverMode = useCallback(() => {
    setMode('caregiver')
    setCaregiverAuthed(false)
    setCaregiverView('categories')
    setCaregiverCategoryId(null)
    setCaregiverItemId(null)
  }, [])

  const exitCaregiverMode = useCallback(() => {
    setMode('user')
    setCaregiverAuthed(false)
    setUserCategoryId(null)
    setSelectedItemId(null)
  }, [])

  // ── Render ───────────────────────────────────────────────────────────────────
  if (dbError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg px-6">
        <div className="text-center max-w-sm">
          <div className="text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-text mb-2">Could not open storage</h1>
          <p className="text-muted mb-4">
            Found Words needs IndexedDB access. Please use a modern browser and ensure you
            are not in a private/incognito mode that blocks local storage.
          </p>
          <p className="text-sm text-muted">{dbError}</p>
        </div>
      </div>
    )
  }

  if (!dbReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg">
        <div className="text-center">
          <div className="spinner mx-auto mb-4" />
          <p className="text-lg text-muted">Loading Found Words…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {mode === 'user' ? (
        <UserMode
          categoryId={userCategoryId}
          setCategoryId={setUserCategoryId}
          selectedItemId={selectedItemId}
          setSelectedItemId={setSelectedItemId}
          onCaregiverMode={enterCaregiverMode}
        />
      ) : (
        <CaregiverMode
          authed={caregiverAuthed}
          setAuthed={setCaregiverAuthed}
          view={caregiverView}
          setView={setCaregiverView}
          categoryId={caregiverCategoryId}
          setCategoryId={setCaregiverCategoryId}
          itemId={caregiverItemId}
          setItemId={setCaregiverItemId}
          onExit={exitCaregiverMode}
        />
      )}

      {needRefresh && (
        <UpdateToast onUpdate={() => updateServiceWorker(true)} />
      )}
    </div>
  )
}

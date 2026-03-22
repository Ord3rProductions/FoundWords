import { openDB } from 'idb'

const DB_NAME = 'foundwords'
const DB_VERSION = 1

let _db = null

export async function getDB() {
  if (_db) return _db

  _db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('categories')) {
        const s = db.createObjectStore('categories', { keyPath: 'id' })
        s.createIndex('order', 'order')
      }
      if (!db.objectStoreNames.contains('items')) {
        const s = db.createObjectStore('items', { keyPath: 'id' })
        s.createIndex('categoryId', 'categoryId')
        s.createIndex('order', 'order')
      }
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' })
      }
    },
  })

  // Seed default settings
  const pinRecord = await _db.get('settings', 'pin')
  if (!pinRecord) {
    await _db.put('settings', { key: 'pin', value: '1234' })
  }

  // Seed default categories on first run
  const cats = await _db.getAll('categories')
  if (cats.length === 0) {
    const defaults = [
      { id: crypto.randomUUID(), name: 'Food & Drink', icon: '🍽️', color: '#FEF9C3', order: 0 },
      { id: crypto.randomUUID(), name: 'Needs',        icon: '🤝',  color: '#DCFCE7', order: 1 },
      { id: crypto.randomUUID(), name: 'People',       icon: '👨‍👩‍👧', color: '#EDE9FE', order: 2 },
      { id: crypto.randomUUID(), name: 'Activities',   icon: '⚽',  color: '#FED7AA', order: 3 },
    ]
    const tx = _db.transaction('categories', 'readwrite')
    for (const c of defaults) await tx.store.put(c)
    await tx.done
  }

  return _db
}

// ── Categories ────────────────────────────────────────────────────────────────

export async function getCategories() {
  const db = await getDB()
  const all = await db.getAll('categories')
  return all.sort((a, b) => a.order - b.order)
}

export async function saveCategory(category) {
  const db = await getDB()
  if (!category.id) {
    const all = await getCategories()
    category = { ...category, id: crypto.randomUUID(), order: all.length }
  }
  await db.put('categories', category)
  return category
}

export async function deleteCategory(id) {
  const db = await getDB()
  const items = await getItemsByCategory(id)
  const tx = db.transaction(['categories', 'items'], 'readwrite')
  await tx.objectStore('categories').delete(id)
  for (const item of items) {
    await tx.objectStore('items').delete(item.id)
  }
  await tx.done
}

export async function moveCategoryUp(id) {
  const cats = await getCategories()
  const idx = cats.findIndex(c => c.id === id)
  if (idx <= 0) return
  const db = await getDB()
  const tx = db.transaction('categories', 'readwrite')
  cats[idx].order = idx - 1
  cats[idx - 1].order = idx
  await tx.store.put(cats[idx])
  await tx.store.put(cats[idx - 1])
  await tx.done
}

export async function moveCategoryDown(id) {
  const cats = await getCategories()
  const idx = cats.findIndex(c => c.id === id)
  if (idx < 0 || idx >= cats.length - 1) return
  const db = await getDB()
  const tx = db.transaction('categories', 'readwrite')
  cats[idx].order = idx + 1
  cats[idx + 1].order = idx
  await tx.store.put(cats[idx])
  await tx.store.put(cats[idx + 1])
  await tx.done
}

// ── Items ─────────────────────────────────────────────────────────────────────

export async function getItemsByCategory(categoryId) {
  const db = await getDB()
  const all = await db.getAllFromIndex('items', 'categoryId', categoryId)
  return all.sort((a, b) => a.order - b.order)
}

export async function saveItem(item) {
  const db = await getDB()
  if (!item.id) {
    const existing = await getItemsByCategory(item.categoryId)
    item = { ...item, id: crypto.randomUUID(), order: existing.length }
  }
  await db.put('items', item)
  return item
}

export async function deleteItem(id) {
  const db = await getDB()
  await db.delete('items', id)
}

export async function moveItemUp(id, categoryId) {
  const items = await getItemsByCategory(categoryId)
  const idx = items.findIndex(i => i.id === id)
  if (idx <= 0) return
  const db = await getDB()
  const tx = db.transaction('items', 'readwrite')
  items[idx].order = idx - 1
  items[idx - 1].order = idx
  await tx.store.put(items[idx])
  await tx.store.put(items[idx - 1])
  await tx.done
}

export async function moveItemDown(id, categoryId) {
  const items = await getItemsByCategory(categoryId)
  const idx = items.findIndex(i => i.id === id)
  if (idx < 0 || idx >= items.length - 1) return
  const db = await getDB()
  const tx = db.transaction('items', 'readwrite')
  items[idx].order = idx + 1
  items[idx + 1].order = idx
  await tx.store.put(items[idx])
  await tx.store.put(items[idx + 1])
  await tx.done
}

// ── Settings ──────────────────────────────────────────────────────────────────

export async function getSetting(key) {
  const db = await getDB()
  const rec = await db.get('settings', key)
  return rec?.value
}

export async function setSetting(key, value) {
  const db = await getDB()
  await db.put('settings', { key, value })
}

// ── Backup / Restore ──────────────────────────────────────────────────────────

export async function exportAllData() {
  const db = await getDB()
  const categories = await db.getAll('categories')
  const items = await db.getAll('items')
  const pin = await getSetting('pin')
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    settings: { pin },
    categories,
    items,
  }
}

export async function importAllData(data) {
  const db = await getDB()
  const tx = db.transaction(['categories', 'items', 'settings'], 'readwrite')
  await tx.objectStore('categories').clear()
  await tx.objectStore('items').clear()
  for (const c of (data.categories ?? [])) await tx.objectStore('categories').put(c)
  for (const i of (data.items ?? [])) await tx.objectStore('items').put(i)
  if (data.settings?.pin) {
    await tx.objectStore('settings').put({ key: 'pin', value: data.settings.pin })
  }
  await tx.done
}

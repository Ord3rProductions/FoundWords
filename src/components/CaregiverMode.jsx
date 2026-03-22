import PinScreen from './PinScreen.jsx'
import CaregiverDashboard from './CaregiverDashboard.jsx'
import CategoryEdit from './CategoryEdit.jsx'
import ItemList from './ItemList.jsx'
import ItemEdit from './ItemEdit.jsx'
import Settings from './Settings.jsx'

export default function CaregiverMode({
  authed,
  setAuthed,
  view,
  setView,
  categoryId,
  setCategoryId,
  itemId,
  setItemId,
  onExit,
}) {
  if (!authed) {
    return (
      <PinScreen
        onSuccess={() => setAuthed(true)}
        onCancel={onExit}
      />
    )
  }

  if (view === 'editCategory') {
    return (
      <CategoryEdit
        categoryId={categoryId}
        onSave={() => { setCategoryId(null); setView('categories') }}
        onCancel={() => { setCategoryId(null); setView('categories') }}
      />
    )
  }

  if (view === 'items') {
    return (
      <ItemList
        categoryId={categoryId}
        onBack={() => { setCategoryId(null); setView('categories') }}
        onAddItem={() => { setItemId(null); setView('editItem') }}
        onEditItem={id => { setItemId(id); setView('editItem') }}
      />
    )
  }

  if (view === 'editItem') {
    return (
      <ItemEdit
        itemId={itemId}
        categoryId={categoryId}
        onSave={() => setView('items')}
        onCancel={() => setView('items')}
      />
    )
  }

  if (view === 'settings') {
    return (
      <Settings onBack={() => setView('categories')} />
    )
  }

  // Default: categories dashboard
  return (
    <CaregiverDashboard
      onExit={onExit}
      onSettings={() => setView('settings')}
      onEditCategory={id => { setCategoryId(id); setView('editCategory') }}
      onNewCategory={() => { setCategoryId(null); setView('editCategory') }}
      onManageItems={id => { setCategoryId(id); setView('items') }}
    />
  )
}

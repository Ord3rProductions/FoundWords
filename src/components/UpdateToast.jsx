export default function UpdateToast({ onUpdate }) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 w-full max-w-sm">
      <div className="bg-primary text-white rounded-2xl shadow-xl px-5 py-4 flex items-center gap-4">
        <span className="text-2xl">🔄</span>
        <div className="flex-1">
          <p className="font-semibold text-base leading-tight">Update available</p>
          <p className="text-sm opacity-85 mt-0.5">Tap to refresh for the latest version</p>
        </div>
        <button
          onClick={onUpdate}
          className="bg-white text-primary font-semibold text-sm rounded-xl px-3 py-2 shrink-0"
        >
          Refresh
        </button>
      </div>
    </div>
  )
}

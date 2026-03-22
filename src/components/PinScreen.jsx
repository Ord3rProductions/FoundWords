import { useState } from 'react'
import { getSetting } from '../db/index.js'

const DIGITS = ['1','2','3','4','5','6','7','8','9','','0','⌫']

export default function PinScreen({ onSuccess, onCancel }) {
  const [entered, setEntered] = useState('')
  const [error, setError] = useState(false)
  const [shaking, setShaking] = useState(false)

  async function handleDigit(d) {
    if (d === '⌫') {
      setEntered(p => p.slice(0, -1))
      setError(false)
      return
    }
    if (d === '') return

    const next = entered + d
    setEntered(next)
    setError(false)

    if (next.length === 4) {
      const pin = await getSetting('pin')
      if (next === (pin ?? '1234')) {
        onSuccess()
      } else {
        setShaking(true)
        setError(true)
        setTimeout(() => {
          setEntered('')
          setShaking(false)
        }, 600)
      }
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-bg px-6 page-enter">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="text-5xl mb-3">🔒</div>
        <h1 className="text-2xl font-bold text-text">Caregiver Mode</h1>
        <p className="text-muted mt-1">Enter your PIN to continue</p>
      </div>

      {/* PIN dots */}
      <div
        className={`flex gap-4 mb-8 transition-all ${shaking ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}
        style={shaking ? { animation: 'shake 0.5s ease-in-out' } : {}}
      >
        {[0,1,2,3].map(i => (
          <div
            key={i}
            className={`w-5 h-5 rounded-full border-2 transition-all duration-150 ${
              i < entered.length
                ? error
                  ? 'bg-danger border-danger'
                  : 'bg-primary border-primary'
                : 'bg-transparent border-border'
            }`}
          />
        ))}
      </div>

      {error && (
        <p className="text-danger text-sm font-medium mb-4 -mt-4">Incorrect PIN</p>
      )}

      {/* Numpad */}
      <div className="grid grid-cols-3 gap-3 w-full max-w-xs mb-6">
        {DIGITS.map((d, i) => (
          <button
            key={i}
            onClick={() => handleDigit(d)}
            disabled={d === ''}
            className={`
              h-16 rounded-2xl text-xl font-semibold transition-all active:scale-95
              ${d === '' ? 'invisible' : ''}
              ${d === '⌫'
                ? 'bg-border text-muted hover:bg-slate-200 text-2xl'
                : 'bg-surface text-text shadow-sm border border-border hover:bg-primary-xlight hover:border-primary hover:text-primary'
              }
            `}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Cancel */}
      <button
        onClick={onCancel}
        className="text-muted hover:text-text text-base py-2 px-4"
      >
        Cancel
      </button>
    </div>
  )
}

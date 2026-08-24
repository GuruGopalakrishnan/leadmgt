import { useState } from 'react'

export default function PhoneChips({ phones }) {
  const [copiedNumber, setCopiedNumber] = useState(null)

  if (!phones || phones.length === 0) return <span className="muted">—</span>

  async function copyNumber(number) {
    try {
      await navigator.clipboard.writeText(number)
    } catch {
      // clipboard permission denied — chip label still shows the number
    }
    setCopiedNumber(number)
    setTimeout(() => setCopiedNumber((current) => (current === number ? null : current)), 1200)
  }

  return (
    <div className="chip-list">
      {phones.map((number) => (
        <button
          key={number}
          type="button"
          className="phone-chip"
          onClick={(e) => {
            e.stopPropagation()
            copyNumber(number)
          }}
          title="Copy number"
        >
          {copiedNumber === number ? 'Copied ✓' : number}
        </button>
      ))}
    </div>
  )
}

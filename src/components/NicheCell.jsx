import { useState } from 'react'

export default function NicheCell({ lead, onSave }) {
  const [value, setValue] = useState(lead.niche || '')

  function commit() {
    if (value.trim() === (lead.niche || '')) return
    onSave({ ...lead, niche: value.trim() || null })
  }

  return (
    <input
      type="text"
      className="inline-text-input"
      value={value}
      placeholder="Niche / industry"
      onChange={(e) => setValue(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
    />
  )
}

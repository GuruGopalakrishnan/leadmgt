import { useState } from 'react'
import { DEFAULT_SOURCES } from '../utils/constants'

export default function SourceCell({ lead, onSave }) {
  const knownSource = lead.source && DEFAULT_SOURCES.includes(lead.source)
  const isCustom = Boolean(lead.source) && !knownSource
  const [editingCustom, setEditingCustom] = useState(false)
  const [customValue, setCustomValue] = useState(isCustom ? lead.source : '')

  function handleSelect(value) {
    if (value === 'Other') {
      setCustomValue(isCustom ? lead.source : '')
      setEditingCustom(true)
      return
    }
    onSave({ ...lead, source: value || null })
  }

  function commitCustom() {
    setEditingCustom(false)
    onSave({ ...lead, source: customValue.trim() || null })
  }

  if (editingCustom) {
    return (
      <input
        type="text"
        className="inline-source-input"
        autoFocus
        value={customValue}
        placeholder="Custom source"
        onChange={(e) => setCustomValue(e.target.value)}
        onBlur={commitCustom}
        onKeyDown={(e) => e.key === 'Enter' && commitCustom()}
      />
    )
  }

  return (
    <select
      className="inline-select"
      value={isCustom ? 'Other' : lead.source || ''}
      onChange={(e) => handleSelect(e.target.value)}
    >
      <option value="">—</option>
      {DEFAULT_SOURCES.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
      <option value="Other">{isCustom ? lead.source : 'Other'}</option>
    </select>
  )
}

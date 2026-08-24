import { useMemo, useState } from 'react'
import { toCSV } from '../utils/csv'
import { DEFAULT_SOURCES } from '../utils/constants'

const HEADERS = ['Name', 'Phone Number', 'Other Links', 'Source']

function linksToCell(links) {
  return (links || []).map((l) => `${l.type}:${l.url}`).join(';')
}

export default function ExportDialog({ leads, stages, onClose }) {
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [stageId, setStageId] = useState('')
  const [source, setSource] = useState('')

  const filtered = useMemo(() => {
    return leads.filter((lead) => {
      const created = lead.created_at.slice(0, 10)
      if (fromDate && created < fromDate) return false
      if (toDate && created > toDate) return false
      if (stageId && String(lead.stage_id) !== stageId) return false
      if (source === 'Other') {
        if (!lead.source || DEFAULT_SOURCES.includes(lead.source)) return false
      } else if (source && lead.source !== source) {
        return false
      }
      return true
    })
  }, [leads, fromDate, toDate, stageId, source])

  function handleExport() {
    const rows = filtered.map((lead) => [
      lead.name,
      (lead.phones || []).join(';'),
      linksToCell(lead.links),
      lead.source || '',
    ])
    const csv = toCSV(HEADERS, rows)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal export-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Export Contacts</h2>
          <button type="button" className="btn-icon" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className="import-preview-body">
          <div className="form-row">
            <label>
              From date
              <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
            </label>
            <label>
              To date
              <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
            </label>
          </div>
          <div className="form-row">
            <label>
              Stage
              <select value={stageId} onChange={(e) => setStageId(e.target.value)}>
                <option value="">All stages</option>
                {stages.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Source
              <select value={source} onChange={(e) => setSource(e.target.value)}>
                <option value="">All sources</option>
                {DEFAULT_SOURCES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
                <option value="Other">Other</option>
              </select>
            </label>
          </div>

          <p className="import-summary">
            {filtered.length} lead{filtered.length === 1 ? '' : 's'} match{filtered.length === 1 ? 'es' : ''} these
            filters.
          </p>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="button" className="btn-primary" onClick={handleExport} disabled={filtered.length === 0}>
              Export {filtered.length}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

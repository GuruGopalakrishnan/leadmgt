import { useMemo, useState } from 'react'
import { LINK_TYPES } from '../utils/constants'

const TARGET_FIELDS = [
  { key: 'name', label: 'Name', required: true, guesses: ['name'] },
  { key: 'phone', label: 'Phone Number', required: false, guesses: ['phone number', 'phone', 'phone numbers'] },
  { key: 'email', label: 'Email', required: false, guesses: ['email', 'emails', 'email address'] },
  { key: 'links', label: 'Other Links', required: false, guesses: ['other links', 'links', 'link'] },
  { key: 'niche', label: 'Niche/Industry', required: false, guesses: ['niche', 'industry', 'niche/industry', 'niche / industry'] },
  { key: 'source', label: 'Source', required: false, guesses: ['source'] },
]

function guessColumn(headerRow, guesses) {
  const idx = headerRow.findIndex((h) => guesses.includes(h.trim().toLowerCase()))
  return idx === -1 ? '' : String(idx)
}

function cellToPhones(cell) {
  if (!cell) return []
  return cell.split(';').map((p) => p.trim()).filter(Boolean)
}

function cellToEmails(cell) {
  if (!cell) return []
  return cell.split(';').map((e) => e.trim()).filter(Boolean)
}

function cellToLinks(cell) {
  if (!cell) return []
  const typePattern = new RegExp(`^(${LINK_TYPES.join('|')})\\s*:\\s*(.+)$`, 'i')
  return cell
    .split(';')
    .map((token) => token.trim())
    .filter(Boolean)
    .map((token) => {
      const match = token.match(typePattern)
      if (match) {
        const type = LINK_TYPES.find((t) => t.toLowerCase() === match[1].toLowerCase())
        return { type, url: match[2].trim() }
      }
      return { type: 'Other', url: token }
    })
}

export default function ImportPreviewModal({ headerRow, dataRows, onCancel, onConfirm }) {
  const [columnMap, setColumnMap] = useState(() =>
    Object.fromEntries(TARGET_FIELDS.map((f) => [f.key, guessColumn(headerRow, f.guesses)])),
  )
  const [importing, setImporting] = useState(false)

  const mappedRows = useMemo(() => {
    const idx = (key) => (columnMap[key] === '' ? -1 : Number(columnMap[key]))
    return dataRows.map((row) => ({
      name: idx('name') !== -1 ? (row[idx('name')] || '').trim() : '',
      phones: idx('phone') !== -1 ? cellToPhones(row[idx('phone')]) : [],
      emails: idx('email') !== -1 ? cellToEmails(row[idx('email')]) : [],
      links: idx('links') !== -1 ? cellToLinks(row[idx('links')]) : [],
      niche: idx('niche') !== -1 ? row[idx('niche')] || null : null,
      source: idx('source') !== -1 ? row[idx('source')] || null : null,
    }))
  }, [dataRows, columnMap])

  const validCount = mappedRows.filter((r) => r.name).length
  const skippedCount = mappedRows.length - validCount

  async function handleConfirm() {
    setImporting(true)
    try {
      await onConfirm(mappedRows)
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal import-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Import Contacts</h2>
          <button type="button" className="btn-icon" onClick={onCancel} aria-label="Close">
            ×
          </button>
        </div>
        <div className="import-preview-body">
          <p>
            Found <strong>{dataRows.length}</strong> contact{dataRows.length === 1 ? '' : 's'} in this document.
            Match each column below, then import.
          </p>

          <fieldset className="form-fieldset export-filters">
            <legend>Column mapping</legend>
            <div className="column-map-grid">
              {TARGET_FIELDS.map((field) => (
                <label key={field.key}>
                  {field.label}
                  {field.required && ' *'}
                  <select
                    value={columnMap[field.key]}
                    onChange={(e) => setColumnMap((prev) => ({ ...prev, [field.key]: e.target.value }))}
                  >
                    <option value="">Not in document</option>
                    {headerRow.map((h, i) => (
                      <option key={i} value={i}>
                        {h || `Column ${i + 1}`}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="import-preview-table-wrap">
            <table className="leads-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone Numbers</th>
                  <th>Email</th>
                  <th>Other Links</th>
                  <th>Niche/Industry</th>
                  <th>Source</th>
                </tr>
              </thead>
              <tbody>
                {mappedRows.slice(0, 8).map((row, i) => (
                  <tr key={i} className={row.name ? '' : 'import-row-skipped'}>
                    <td className="lead-name-cell">{row.name || <span className="muted">(no name — skipped)</span>}</td>
                    <td>{row.phones.join(', ') || <span className="muted">—</span>}</td>
                    <td>{row.emails.join(', ') || <span className="muted">—</span>}</td>
                    <td>{row.links.map((l) => l.url).join(', ') || <span className="muted">—</span>}</td>
                    <td>{row.niche || <span className="muted">—</span>}</td>
                    <td>{row.source || <span className="muted">—</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {mappedRows.length > 8 && <p className="import-preview-more">+ {mappedRows.length - 8} more row(s)</p>}
          </div>

          <div className="export-summary-banner">
            <span className="export-summary-count">{validCount}</span>
            <span>
              contact{validCount === 1 ? '' : 's'} will be imported
              {skippedCount > 0 && ` · ${skippedCount} skipped (no name)`}
            </span>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onCancel}>
              Cancel
            </button>
            <button type="button" className="btn-primary" onClick={handleConfirm} disabled={validCount === 0 || importing}>
              {importing ? 'Importing…' : `Import ${validCount}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

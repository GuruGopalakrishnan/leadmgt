import { useRef, useState } from 'react'
import { parseCSV, toCSV } from '../utils/csv'
import { api } from '../api/client'
import { LINK_TYPES } from '../utils/constants'

const HEADERS = ['Name', 'Phone Number', 'Other Links', 'Source']

function linksToCell(links) {
  return (links || []).map((l) => `${l.type}:${l.url}`).join(';')
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

function cellToPhones(cell) {
  if (!cell) return []
  return cell
    .split(';')
    .map((p) => p.trim())
    .filter(Boolean)
}

function findColumn(headerRow, name) {
  return headerRow.findIndex((h) => h.trim().toLowerCase() === name.toLowerCase())
}

export default function ImportExportBar({ leads, onImported }) {
  const fileInputRef = useRef(null)
  const [status, setStatus] = useState('')

  function handleExport() {
    const rows = leads.map((lead) => [
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
  }

  function handleImportClick() {
    fileInputRef.current?.click()
  }

  async function handleFileChange(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    const text = await file.text()
    const table = parseCSV(text)
    if (table.length === 0) {
      setStatus('The file is empty.')
      return
    }

    const [headerRow, ...dataRows] = table
    const nameCol = findColumn(headerRow, 'Name')
    const phoneCol = findColumn(headerRow, 'Phone Number')
    const linksCol = findColumn(headerRow, 'Other Links')
    const sourceCol = findColumn(headerRow, 'Source')

    if (nameCol === -1) {
      setStatus('CSV must have a "Name" column.')
      return
    }

    const rows = dataRows.map((row) => ({
      name: row[nameCol] || '',
      phones: phoneCol !== -1 ? cellToPhones(row[phoneCol]) : [],
      links: linksCol !== -1 ? cellToLinks(row[linksCol]) : [],
      source: sourceCol !== -1 ? row[sourceCol] || null : null,
    }))

    setStatus('Importing...')
    try {
      const result = await api.importLeads(rows)
      setStatus(
        `Imported ${result.created} lead${result.created === 1 ? '' : 's'}.` +
          (result.errors.length ? ` ${result.errors.length} row(s) skipped (missing name).` : ''),
      )
      onImported()
    } catch (err) {
      setStatus(err.message)
    }
  }

  return (
    <div className="import-export-bar">
      <button type="button" className="btn-secondary" onClick={handleExport}>
        Export CSV
      </button>
      <button type="button" className="btn-secondary" onClick={handleImportClick}>
        Import CSV
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      {status && <span className="import-status">{status}</span>}
    </div>
  )
}

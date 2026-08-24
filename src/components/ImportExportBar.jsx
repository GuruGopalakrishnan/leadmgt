import { useRef, useState } from 'react'
import { parseCSV } from '../utils/csv'
import { api } from '../api/client'
import ImportPreviewModal from './ImportPreviewModal'
import ExportDialog from './ExportDialog'

export default function ImportExportBar({ allLeads, stages, onImported }) {
  const fileInputRef = useRef(null)
  const [status, setStatus] = useState('')
  const [pendingImport, setPendingImport] = useState(null)
  const [showExport, setShowExport] = useState(false)

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
    setPendingImport({ headerRow, dataRows })
  }

  async function handleConfirmImport(mappedRows) {
    setStatus('Importing...')
    try {
      const result = await api.importLeads(mappedRows.filter((r) => r.name))
      setStatus(
        `Imported ${result.created} lead${result.created === 1 ? '' : 's'}.` +
          (result.errors.length ? ` ${result.errors.length} row(s) skipped.` : ''),
      )
      setPendingImport(null)
      onImported()
    } catch (err) {
      setStatus(err.message)
    }
  }

  return (
    <div className="import-export-bar">
      <button type="button" className="btn-secondary" onClick={() => setShowExport(true)}>
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

      {pendingImport && (
        <ImportPreviewModal
          headerRow={pendingImport.headerRow}
          dataRows={pendingImport.dataRows}
          onCancel={() => setPendingImport(null)}
          onConfirm={handleConfirmImport}
        />
      )}

      {showExport && <ExportDialog leads={allLeads} stages={stages} onClose={() => setShowExport(false)} />}
    </div>
  )
}

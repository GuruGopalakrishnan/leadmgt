import { useEffect, useState } from 'react'
import PhonesCell from './PhonesCell'
import EmailsCell from './EmailsCell'
import LinksCell from './LinksCell'
import NicheCell from './NicheCell'
import SourceCell from './SourceCell'
import StageCell from './StageCell'
import ReminderCell from './ReminderCell'
import ImportExportBar from './ImportExportBar'
import { DEFAULT_SOURCES, FOLLOWUP_FILTERS } from '../utils/constants'

export default function LeadTable({
  leads,
  allLeads,
  loading,
  stages,
  filters,
  onFilterChange,
  onEdit,
  onDelete,
  onQuickUpdate,
  onImported,
}) {
  const [search, setSearch] = useState(filters.search || '')
  const [pageSize, setPageSize] = useState(25)
  const [page, setPage] = useState(1)

  function submitSearch(e) {
    e.preventDefault()
    onFilterChange({ ...filters, search })
  }

  useEffect(() => {
    setPage(1)
  }, [filters, leads.length, pageSize])

  const totalPages = Math.max(1, Math.ceil(leads.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const pageLeads = leads.slice((safePage - 1) * pageSize, safePage * pageSize)

  return (
    <div className="leads-panel">
      <ImportExportBar allLeads={allLeads} stages={stages} onImported={onImported} />

      <form className="filters-bar" onSubmit={submitSearch}>
        <input
          type="search"
          placeholder="Search name or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onBlur={submitSearch}
          className="search-input"
        />
        <select
          value={filters.source || ''}
          onChange={(e) => onFilterChange({ ...filters, source: e.target.value })}
        >
          <option value="">All sources</option>
          {DEFAULT_SOURCES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
          <option value="Other">Other</option>
        </select>
        <select
          value={filters.stage_id || ''}
          onChange={(e) => onFilterChange({ ...filters, stage_id: e.target.value })}
        >
          <option value="">All stages</option>
          {stages.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <select
          value={filters.followup || ''}
          onChange={(e) => onFilterChange({ ...filters, followup: e.target.value, date: '' })}
        >
          {FOLLOWUP_FILTERS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={filters.date || ''}
          onChange={(e) => onFilterChange({ ...filters, date: e.target.value, followup: '' })}
          title="Filter by exact reminder date"
        />
      </form>

      <div className="table-wrap">
        <table className="leads-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone Numbers</th>
              <th>Email</th>
              <th>Other Links</th>
              <th>Niche/Industry</th>
              <th>Source</th>
              <th>Stage</th>
              <th>Reminder</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {pageLeads.map((lead) => (
              <tr key={lead.id}>
                <td className="lead-name-cell">{lead.name}</td>
                <td>
                  <PhonesCell lead={lead} onSave={onQuickUpdate} />
                </td>
                <td>
                  <EmailsCell lead={lead} onSave={onQuickUpdate} />
                </td>
                <td>
                  <LinksCell lead={lead} onSave={onQuickUpdate} />
                </td>
                <td>
                  <NicheCell lead={lead} onSave={onQuickUpdate} />
                </td>
                <td>
                  <SourceCell lead={lead} onSave={onQuickUpdate} />
                </td>
                <td>
                  <StageCell lead={lead} stages={stages} onSave={onQuickUpdate} />
                </td>
                <td>
                  <ReminderCell lead={lead} onSave={onQuickUpdate} />
                </td>
                <td className="row-actions">
                  <button type="button" className="btn-link" onClick={() => onEdit(lead)}>
                    Edit
                  </button>
                  <button type="button" className="btn-link danger" onClick={() => onDelete(lead.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {!loading && leads.length === 0 && (
              <tr>
                <td colSpan={9} className="no-results">
                  No leads match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {leads.length > 0 && (
        <div className="pagination-bar">
          <label className="pagination-page-size">
            Show
            <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
              {[25, 50, 75, 100].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            per page
          </label>
          <span className="pagination-summary">
            {(safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, leads.length)} of {leads.length}
          </span>
          <div className="pagination-controls">
            <button type="button" className="btn-secondary" onClick={() => setPage((p) => p - 1)} disabled={safePage <= 1}>
              Previous
            </button>
            <span className="pagination-page-indicator">
              Page {safePage} of {totalPages}
            </span>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setPage((p) => p + 1)}
              disabled={safePage >= totalPages}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

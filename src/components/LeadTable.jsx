import { useState } from 'react'
import PhoneChips from './PhoneChips'
import LinkChips from './LinkChips'
import StageBadge from './StageBadge'
import { DEFAULT_SOURCES, FOLLOWUP_FILTERS, formatReminder } from '../utils/constants'

export default function LeadTable({ leads, loading, stages, filters, onFilterChange, onEdit, onDelete }) {
  const [search, setSearch] = useState(filters.search || '')

  function submitSearch(e) {
    e.preventDefault()
    onFilterChange({ ...filters, search })
  }

  return (
    <div className="leads-panel">
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
              <th>Other Links</th>
              <th>Source</th>
              <th>Stage</th>
              <th>Reminder</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id}>
                <td className="lead-name-cell">{lead.name}</td>
                <td>
                  <PhoneChips phones={lead.phones} leadName={lead.name} />
                </td>
                <td>
                  <LinkChips links={lead.links} />
                </td>
                <td>{lead.source || <span className="muted">—</span>}</td>
                <td>
                  <StageBadge name={stages.find((s) => s.id === lead.stage_id)?.name} />
                </td>
                <td>
                  {formatReminder(lead.reminder_date, lead.reminder_time) || <span className="muted">—</span>}
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
                <td colSpan={7} className="no-results">
                  No leads match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

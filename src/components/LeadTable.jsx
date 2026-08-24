import { useMemo, useState } from 'react'
import StatusBadge from './StatusBadge'
import { SOURCES, STATUSES } from '../utils/constants'

export default function LeadTable({ leads, onEdit, onDelete, onLoadSample }) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [sourceFilter, setSourceFilter] = useState('All')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return leads.filter((lead) => {
      if (statusFilter !== 'All' && lead.status !== statusFilter) return false
      if (sourceFilter !== 'All' && lead.source !== sourceFilter) return false
      if (!q) return true
      return (
        lead.name.toLowerCase().includes(q) ||
        lead.company?.toLowerCase().includes(q) ||
        lead.email?.toLowerCase().includes(q)
      )
    })
  }, [leads, search, statusFilter, sourceFilter])

  if (leads.length === 0) {
    return (
      <div className="empty-state">
        <p>No leads yet.</p>
        <button type="button" className="btn-secondary" onClick={onLoadSample}>
          Load sample data
        </button>
      </div>
    )
  }

  return (
    <div className="leads-panel">
      <div className="filters-bar">
        <input
          type="search"
          placeholder="Search name, company, or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="All">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)}>
          <option value="All">All sources</option>
          {SOURCES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="table-wrap">
        <table className="leads-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Company</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Source</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((lead) => (
              <tr key={lead.id}>
                <td>{lead.name}</td>
                <td>{lead.company}</td>
                <td>{lead.email}</td>
                <td>{lead.phone}</td>
                <td>{lead.source}</td>
                <td>
                  <StatusBadge status={lead.status} />
                </td>
                <td className="row-actions">
                  <button type="button" className="btn-link" onClick={() => onEdit(lead)}>
                    Edit
                  </button>
                  <button
                    type="button"
                    className="btn-link danger"
                    onClick={() => onDelete(lead.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
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

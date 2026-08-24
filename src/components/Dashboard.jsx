import { useMemo } from 'react'
import StatusBadge from './StatusBadge'
import { STATUSES } from '../utils/constants'

export default function Dashboard({ leads }) {
  const stats = useMemo(() => {
    const byStatus = Object.fromEntries(STATUSES.map((s) => [s, 0]))
    for (const lead of leads) {
      if (byStatus[lead.status] !== undefined) byStatus[lead.status] += 1
    }
    const total = leads.length
    const won = byStatus.Won || 0
    const closed = won + (byStatus.Lost || 0)
    const conversionRate = closed > 0 ? Math.round((won / closed) * 100) : 0
    return { byStatus, total, conversionRate }
  }, [leads])

  const recent = useMemo(
    () =>
      [...leads]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5),
    [leads],
  )

  return (
    <div className="dashboard">
      <div className="stat-cards">
        <div className="stat-card">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Leads</div>
        </div>
        {STATUSES.map((status) => (
          <div className="stat-card" key={status}>
            <div className="stat-value">{stats.byStatus[status]}</div>
            <div className="stat-label">{status}</div>
          </div>
        ))}
        <div className="stat-card">
          <div className="stat-value">{stats.conversionRate}%</div>
          <div className="stat-label">Win Rate</div>
        </div>
      </div>

      <div className="dashboard-recent">
        <h2>Recent Leads</h2>
        {recent.length === 0 ? (
          <p className="empty-hint">No leads yet. Add your first lead to get started.</p>
        ) : (
          <ul className="recent-list">
            {recent.map((lead) => (
              <li key={lead.id} className="recent-item">
                <div>
                  <div className="recent-name">{lead.name}</div>
                  <div className="recent-company">{lead.company}</div>
                </div>
                <StatusBadge status={lead.status} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

import { useMemo } from 'react'
import StageBadge from './StageBadge'

export default function Dashboard({ leads, stages }) {
  const stats = useMemo(() => {
    const byStage = Object.fromEntries(stages.map((s) => [s.id, 0]))
    let noReminder = 0
    let todayCount = 0
    const today = new Date().toISOString().slice(0, 10)
    for (const lead of leads) {
      if (lead.stage_id != null && byStage[lead.stage_id] !== undefined) byStage[lead.stage_id] += 1
      if (!lead.reminder_date) noReminder += 1
      if (lead.reminder_date === today) todayCount += 1
    }
    return { byStage, noReminder, todayCount, total: leads.length }
  }, [leads, stages])

  const recent = useMemo(
    () => [...leads].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5),
    [leads],
  )

  return (
    <div className="dashboard">
      <div className="stat-cards">
        <div className="stat-card">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Leads</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.todayCount}</div>
          <div className="stat-label">Today's Follow-ups</div>
        </div>
        {stages.map((s) => (
          <div className="stat-card" key={s.id}>
            <div className="stat-value">{stats.byStage[s.id] || 0}</div>
            <div className="stat-label">{s.name}</div>
          </div>
        ))}
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
                  <div className="recent-company">{lead.source}</div>
                </div>
                <StageBadge name={stages.find((s) => s.id === lead.stage_id)?.name} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

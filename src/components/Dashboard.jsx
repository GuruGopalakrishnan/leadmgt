import { useMemo } from 'react'
import ConversionTracker from './ConversionTracker'

export default function Dashboard({ leads, stages, onNavigate }) {
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

  return (
    <div className="dashboard">
      <div className="stat-cards">
        <div className="stat-card">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Leads</div>
        </div>
        <div className="stat-card stat-card-highlight">
          <div className="stat-value">{stats.todayCount}</div>
          <div className="stat-label">Today's Follow-ups</div>
          <div className="stat-card-action">
            <button type="button" className="btn-link" onClick={() => onNavigate('followups')}>
              See all →
            </button>
          </div>
        </div>
        {stages.map((s) => (
          <div className="stat-card" key={s.id}>
            <div className="stat-value">{stats.byStage[s.id] || 0}</div>
            <div className="stat-label">{s.name}</div>
          </div>
        ))}
      </div>

      <ConversionTracker leads={leads} stages={stages} />
    </div>
  )
}

import { useMemo } from 'react'
import ConversionTracker from './ConversionTracker'
import StageBreakdown from './StageBreakdown'
import NicheBreakdown from './NicheBreakdown'

export default function Dashboard({ leads, stages, onNavigate }) {
  const stats = useMemo(() => {
    let todayCount = 0
    const today = new Date().toISOString().slice(0, 10)
    for (const lead of leads) {
      if (lead.reminder_date === today) todayCount += 1
    }
    return { todayCount, total: leads.length }
  }, [leads])

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
      </div>

      <div className="dashboard-columns">
        <div className="dashboard-section">
          <h2>Stage Breakdown</h2>
          <StageBreakdown leads={leads} stages={stages} />
        </div>
        <div className="dashboard-section">
          <h2>Niche / Industry Performance</h2>
          <NicheBreakdown leads={leads} stages={stages} />
        </div>
      </div>

      <ConversionTracker leads={leads} stages={stages} />
    </div>
  )
}

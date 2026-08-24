import { useMemo } from 'react'
import { useLeads } from '../hooks/useLeads'
import PhoneChips from './PhoneChips'
import StageBadge from './StageBadge'

export default function TodayFollowups({ stages, onEdit }) {
  const { leads, loading } = useLeads({ followup: 'today' })

  const sorted = useMemo(
    () => [...leads].sort((a, b) => (a.reminder_time || '').localeCompare(b.reminder_time || '')),
    [leads],
  )

  if (loading) return null

  if (sorted.length === 0) {
    return (
      <div className="empty-state">
        <p>No follow-ups scheduled for today. 🎉</p>
      </div>
    )
  }

  return (
    <div className="followups-list">
      {sorted.map((lead) => (
        <div key={lead.id} className="followup-card" onClick={() => onEdit(lead)}>
          <div className="followup-time">{lead.reminder_time || '—'}</div>
          <div className="followup-body">
            <div className="followup-name">{lead.name}</div>
            {lead.reminder_note && <div className="followup-note">{lead.reminder_note}</div>}
            <div onClick={(e) => e.stopPropagation()}>
              <PhoneChips phones={lead.phones} leadName={lead.name} />
            </div>
          </div>
          <StageBadge name={stages.find((s) => s.id === lead.stage_id)?.name} />
        </div>
      ))}
    </div>
  )
}

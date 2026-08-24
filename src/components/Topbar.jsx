import { BellIcon } from './icons'

const TITLES = {
  dashboard: 'Dashboard',
  leads: 'Leads',
  pipeline: 'Pipeline',
  followups: "Today's Follow-ups",
  stages: 'Stages',
}

export default function Topbar({ activeTab, onAddLead, notifyPermission, onEnableNotify }) {
  return (
    <div className="topbar">
      <h1 className="topbar-title">{TITLES[activeTab]}</h1>
      <div className="topbar-actions">
        {notifyPermission === 'default' && (
          <button type="button" className="btn-icon-outline" title="Enable notifications" onClick={onEnableNotify}>
            <BellIcon />
          </button>
        )}
        <button type="button" className="btn-primary" onClick={onAddLead}>
          + Add Lead
        </button>
      </div>
    </div>
  )
}

import { BellIcon, RowsIcon, PipelineIcon } from './icons'

const TITLES = {
  dashboard: 'Dashboard',
  leads: 'Leads',
  followups: "Today's Follow-ups",
  journey: 'Journey Tracking',
  stages: 'Stages',
}

export default function Topbar({ activeTab, leadsView, onLeadsViewChange, onAddLead, notifyPermission, onEnableNotify }) {
  return (
    <div className="topbar">
      <h1 className="topbar-title">{TITLES[activeTab]}</h1>
      <div className="topbar-actions">
        {activeTab === 'leads' && (
          <div className="view-toggle">
            <button
              type="button"
              className={`view-toggle-btn${leadsView === 'row' ? ' active' : ''}`}
              title="Row view"
              onClick={() => onLeadsViewChange('row')}
            >
              <RowsIcon />
              Row
            </button>
            <button
              type="button"
              className={`view-toggle-btn${leadsView === 'grid' ? ' active' : ''}`}
              title="Grid view"
              onClick={() => onLeadsViewChange('grid')}
            >
              <PipelineIcon />
              Grid
            </button>
          </div>
        )}
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

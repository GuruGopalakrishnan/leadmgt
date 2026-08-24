const TABS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'leads', label: 'Leads' },
  { id: 'pipeline', label: 'Pipeline' },
  { id: 'followups', label: "Today's Follow-ups" },
  { id: 'stages', label: 'Stages' },
]

export default function Header({ activeTab, onTabChange, onAddLead, notifyPermission, onEnableNotify }) {
  return (
    <header className="app-header">
      <h1 className="app-title">Lead Manager</h1>
      <nav className="app-nav">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`nav-tab${activeTab === tab.id ? ' active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>
      {notifyPermission === 'default' && (
        <button type="button" className="btn-secondary" onClick={onEnableNotify}>
          Enable notifications
        </button>
      )}
      <button type="button" className="btn-primary" onClick={onAddLead}>
        + Add Lead
      </button>
    </header>
  )
}

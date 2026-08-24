import { DashboardIcon, LeadsIcon, PipelineIcon, FollowupsIcon, StagesIcon } from './icons'

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', Icon: DashboardIcon },
  { id: 'leads', label: 'Leads', Icon: LeadsIcon },
  { id: 'pipeline', label: 'Pipeline', Icon: PipelineIcon },
  { id: 'followups', label: 'Follow-ups', Icon: FollowupsIcon },
  { id: 'stages', label: 'Stages', Icon: StagesIcon },
]

export default function Sidebar({ activeTab, onTabChange }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="sidebar-logo">D</span>
        <span className="sidebar-wordmark">DAS</span>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            className={`sidebar-link${activeTab === id ? ' active' : ''}`}
            onClick={() => onTabChange(id)}
          >
            <Icon />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </aside>
  )
}

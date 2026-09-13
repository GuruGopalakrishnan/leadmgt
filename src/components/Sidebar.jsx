import { DashboardIcon, LeadsIcon, FollowupsIcon, StagesIcon, JourneyIcon } from './icons'

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', Icon: DashboardIcon },
  { id: 'leads', label: 'Leads', Icon: LeadsIcon },
  { id: 'followups', label: 'Follow-ups', Icon: FollowupsIcon },
  { id: 'journey', label: 'Journey', Icon: JourneyIcon },
  { id: 'stages', label: 'Stages', Icon: StagesIcon },
]

export default function Sidebar({ activeTab, onTabChange }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="brand-wordmark">DAS</span>
        <svg className="brand-underline" viewBox="0 0 120 16" preserveAspectRatio="none" aria-hidden="true">
          <path d="M2 14 Q60 -6 118 14" fill="none" stroke="currentColor" strokeWidth="1" />
        </svg>
        <span className="brand-tagline">Deploy &amp; Scale</span>
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

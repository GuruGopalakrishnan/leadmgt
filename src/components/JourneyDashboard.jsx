import { useEffect, useMemo, useState } from 'react'
import { INITIAL_SESSIONS, SOURCE_COLORS, STATUS_META, createLiveEvent } from '../utils/journeyMockData'

function timeAgo(minutes) {
  if (minutes <= 0) return 'Just now'
  if (minutes === 1) return '1 min ago'
  return `${minutes} min ago`
}

function PlatformBadge({ platform }) {
  const c = SOURCE_COLORS[platform] || SOURCE_COLORS.GTM
  return (
    <span className="platform-badge" style={{ color: c.fg, background: c.bg, borderColor: c.border }}>
      {platform}
    </span>
  )
}

export default function JourneyDashboard() {
  const [sessions, setSessions] = useState(INITIAL_SESSIONS)
  const [feed, setFeed] = useState(() =>
    INITIAL_SESSIONS.flatMap((s) => s.events.map((e) => ({ ...e, sessionId: s.id, visitor: s.visitor }))).sort(
      (a, b) => a.minutesAgo - b.minutesAgo,
    ),
  )
  const [selectedId, setSelectedId] = useState('s1')

  useEffect(() => {
    const interval = setInterval(() => {
      setSessions((prev) => {
        const event = createLiveEvent(prev)
        if (!event) return prev
        setFeed((prevFeed) => [event, ...prevFeed].slice(0, 30))
        return prev.map((s) =>
          s.id === event.sessionId
            ? { ...s, events: [...s.events, event], status: s.status === 'checkout' ? 'checkout' : 'browsing' }
            : s,
        )
      })
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const stats = useMemo(() => {
    const activeNow = sessions.filter((s) => s.status === 'browsing' || s.status === 'checkout').length
    const checkoutStarted = sessions.filter((s) => s.status === 'checkout' || s.status === 'purchased').length
    const purchased = sessions.filter((s) => s.status === 'purchased').length
    const totalEvents = sessions.reduce((sum, s) => sum + s.events.length, 0)
    return { activeNow, checkoutStarted, purchased, totalEvents }
  }, [sessions])

  const selected = sessions.find((s) => s.id === selectedId) || sessions[0]

  return (
    <div className="journey-dashboard">
      <div className="journey-sample-note">
        <span className="live-dot" aria-hidden="true" />
        Sample data — this view is wired to mock events until the collector and event store are connected.
      </div>

      <div className="stat-cards">
        <div className="stat-card">
          <div className="stat-value">{stats.activeNow}</div>
          <div className="stat-label">Active visitors now</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.checkoutStarted}</div>
          <div className="stat-label">Checkouts started today</div>
        </div>
        <div className="stat-card stat-card-highlight">
          <div className="stat-value">{stats.purchased}</div>
          <div className="stat-label">Purchases today</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.totalEvents}</div>
          <div className="stat-label">Events captured today</div>
        </div>
      </div>

      <div className="journey-columns">
        <div className="dashboard-section journey-feed-section">
          <h2>Live event feed</h2>
          <div className="table-wrap journey-feed">
            {feed.map((e, i) => (
              <div className="journey-feed-row" key={`${e.sessionId}-${i}`}>
                <span className="journey-feed-time">{timeAgo(e.minutesAgo)}</span>
                <span className="journey-feed-visitor">{e.visitor}</span>
                <PlatformBadge platform={e.platform} />
                <span className="journey-feed-label">{e.label}</span>
                <span className="journey-feed-page muted">{e.page}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-section journey-visitors-section">
          <h2>Active visitors</h2>
          <div className="journey-visitor-list">
            {sessions.map((s) => {
              const meta = STATUS_META[s.status]
              return (
                <button
                  type="button"
                  key={s.id}
                  className={`journey-visitor-card${s.id === selectedId ? ' active' : ''}`}
                  onClick={() => setSelectedId(s.id)}
                >
                  <div className="journey-visitor-card-top">
                    <span className="journey-visitor-name">{s.visitor}</span>
                    <span className="stage-badge" style={{ color: meta.fg, background: meta.bg, borderColor: meta.fg }}>
                      {meta.label}
                    </span>
                  </div>
                  <div className="muted journey-visitor-meta">
                    {s.source} · {s.device}
                  </div>
                  <div className="muted journey-visitor-meta">Landed on {s.entryPage}</div>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {selected && (
        <div className="dashboard-section">
          <h2>{selected.visitor}'s journey</h2>
          <div className="journey-timeline">
            {selected.events.map((e, i) => (
              <div className="journey-timeline-item" key={i}>
                <div className="journey-timeline-dot" />
                <div className="journey-timeline-body">
                  <div className="journey-timeline-top">
                    <span className="journey-timeline-label">{e.label}</span>
                    <PlatformBadge platform={e.platform} />
                  </div>
                  <div className="muted journey-timeline-meta">
                    {timeAgo(e.minutesAgo)} · {e.page}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

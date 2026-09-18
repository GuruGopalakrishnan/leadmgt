import { useEffect, useState } from 'react'
import { useJourneyEvents } from '../hooks/useJourneyEvents'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

const EVENT_META = {
  page_view: { label: 'Page view', fg: '#2f7bd4', bg: 'rgba(47, 123, 212, 0.1)' },
  form_view: { label: 'Viewed form', fg: '#7048e8', bg: 'rgba(112, 72, 232, 0.1)' },
  form_start: { label: 'Started form', fg: '#7048e8', bg: 'rgba(112, 72, 232, 0.1)' },
  lead_submitted: { label: 'Lead submitted', fg: '#1a9e52', bg: 'rgba(37, 211, 102, 0.1)' },
  whatsapp_click: { label: 'WhatsApp click', fg: '#1a9e52', bg: 'rgba(37, 211, 102, 0.1)' },
  call_click: { label: 'Call click', fg: '#e8590c', bg: 'rgba(232, 89, 12, 0.1)' },
}

const CAPI_META = {
  sent: { label: 'Meta CAPI: sent', fg: '#1a9e52', bg: 'rgba(37, 211, 102, 0.1)' },
  failed: { label: 'Meta CAPI: failed', fg: '#c0392b', bg: 'rgba(192, 57, 43, 0.1)' },
  skipped: { label: 'Meta CAPI: skipped', fg: '#8a6a1f', bg: 'rgba(138, 106, 31, 0.1)' },
}

function timeAgo(iso) {
  const diffMs = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diffMs / 60000)
  if (minutes <= 0) return 'Just now'
  if (minutes === 1) return '1 min ago'
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.floor(minutes / 60)
  return `${hours} hr ago`
}

function shortVisitor(id) {
  return id ? id.slice(0, 8) : '—'
}

function EventBadge({ eventName }) {
  const meta = EVENT_META[eventName] || { label: eventName, fg: '#8a6a1f', bg: 'rgba(138, 106, 31, 0.1)' }
  return (
    <span className="platform-badge" style={{ color: meta.fg, background: meta.bg, borderColor: meta.fg }}>
      {meta.label}
    </span>
  )
}

function CapiBadge({ status }) {
  if (!status || status === 'skipped') return null
  const meta = CAPI_META[status] || CAPI_META.skipped
  return (
    <span className="platform-badge" style={{ color: meta.fg, background: meta.bg, borderColor: meta.fg }}>
      {meta.label}
    </span>
  )
}

export default function JourneyDashboard() {
  const { feed, sessions, stats, loading, error } = useJourneyEvents()
  const [selectedVisitor, setSelectedVisitor] = useState(null)
  const [timeline, setTimeline] = useState([])

  useEffect(() => {
    if (!selectedVisitor && sessions.length > 0) {
      setSelectedVisitor(sessions[0].visitor_id)
    }
  }, [sessions, selectedVisitor])

  useEffect(() => {
    if (!selectedVisitor) return
    let cancelled = false

    function loadTimeline() {
      fetch(`${API_BASE}/events/visitor/${selectedVisitor}`)
        .then((res) => res.json())
        .then((rows) => {
          if (!cancelled) setTimeline(rows)
        })
        .catch(() => {})
    }

    loadTimeline()
    const interval = setInterval(loadTimeline, 4000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [selectedVisitor])

  return (
    <div className="journey-dashboard">
      <div className="journey-sample-note">
        <span className="live-dot" aria-hidden="true" />
        Live first-party events — tracked via the <code>/tracker.js</code> snippet, relayed to Meta CAPI server-side.
        {error && ` (${error})`}
      </div>

      <div className="stat-cards">
        <div className="stat-card">
          <div className="stat-value">{stats?.active_now ?? 0}</div>
          <div className="stat-label">Active visitors now</div>
        </div>
        <div className="stat-card stat-card-highlight">
          <div className="stat-value">{stats?.leads_today ?? 0}</div>
          <div className="stat-label">Leads submitted today</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats?.touchpoints_today ?? 0}</div>
          <div className="stat-label">WhatsApp/Call clicks today</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats?.events_today ?? 0}</div>
          <div className="stat-label">Events captured today</div>
        </div>
      </div>

      <div className="journey-columns">
        <div className="dashboard-section journey-feed-section">
          <h2>Live event feed</h2>
          <div className="table-wrap journey-feed">
            {!loading && feed.length === 0 && (
              <p className="muted" style={{ padding: 16 }}>
                No visitor events yet. Add <code>&lt;script src="{'{your-api-url}'}/tracker.js"&gt;&lt;/script&gt;</code> to
                your lead-gen website to start seeing real-time journeys here.
              </p>
            )}
            {feed.map((e) => (
              <div className="journey-feed-row" key={e.event_id}>
                <span className="journey-feed-time">{timeAgo(e.created_at)}</span>
                <span className="journey-feed-visitor">{shortVisitor(e.visitor_id)}</span>
                <EventBadge eventName={e.event_name} />
                <CapiBadge status={e.capi_status} />
                <span className="journey-feed-page muted">{e.page_url || '—'}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-section journey-visitors-section">
          <h2>Active visitors</h2>
          <div className="journey-visitor-list">
            {sessions.map((s) => (
              <button
                type="button"
                key={s.visitor_id}
                className={`journey-visitor-card${s.visitor_id === selectedVisitor ? ' active' : ''}`}
                onClick={() => setSelectedVisitor(s.visitor_id)}
              >
                <div className="journey-visitor-card-top">
                  <span className="journey-visitor-name">{shortVisitor(s.visitor_id)}</span>
                  {s.lead_id ? (
                    <span className="stage-badge" style={{ color: '#1a9e52', background: 'rgba(37, 211, 102, 0.1)', borderColor: '#1a9e52' }}>
                      Lead #{s.lead_id}
                    </span>
                  ) : (
                    <EventBadge eventName={s.last_event} />
                  )}
                </div>
                <div className="muted journey-visitor-meta">{s.device || 'Unknown device'}</div>
                <div className="muted journey-visitor-meta">Landed on {s.entry_page || '—'}</div>
              </button>
            ))}
            {sessions.length === 0 && <p className="muted">No active visitors in this window.</p>}
          </div>
        </div>
      </div>

      {selectedVisitor && timeline.length > 0 && (
        <div className="dashboard-section">
          <h2>Visitor {shortVisitor(selectedVisitor)}'s journey</h2>
          <div className="journey-timeline">
            {timeline.map((e) => (
              <div className="journey-timeline-item" key={e.event_id}>
                <div className="journey-timeline-dot" />
                <div className="journey-timeline-body">
                  <div className="journey-timeline-top">
                    <EventBadge eventName={e.event_name} />
                    <CapiBadge status={e.capi_status} />
                  </div>
                  <div className="muted journey-timeline-meta">
                    {timeAgo(e.created_at)} · {e.page_url || '—'}
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

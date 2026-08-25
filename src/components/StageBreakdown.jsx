import { useMemo } from 'react'
import { usePreviousStageDistribution } from '../hooks/usePreviousStageDistribution'

function rawPct(part, whole) {
  return whole ? (part / whole) * 100 : 0
}

function fmtPct(value) {
  return `${value.toFixed(1)}%`
}

const BRONZE = { label: 'Bronze', color: '#b45309' }
const SILVER = { label: 'Silver', color: '#94a3b8' }
const GOLD = { label: 'Gold', color: '#eab308' }
const DIAMOND = { label: 'Diamond', color: '#38bdf8' }

function levelFor(percent) {
  if (percent < 20) return BRONZE
  if (percent < 40) return SILVER
  if (percent <= 75) return GOLD
  return DIAMOND
}

const HIGHLIGHTS = [
  {
    match: /open/i,
    color: '#3b82f6',
    messages: {
      Bronze: 'Improve your pitch and messaging.',
      Silver: 'Open rate is picking up — keep sharpening your opening line.',
      Gold: 'Good open rate. Keep it up.',
      Diamond: 'Excellent open rate. Keep it up.',
    },
  },
  {
    match: /repl/i,
    color: '#8b5cf6',
    messages: {
      Bronze: 'Improve your follow-up messaging to get more replies.',
      Silver: 'Replies are improving — keep following up consistently.',
      Gold: 'Good reply rate. Keep it up.',
      Diamond: 'Strong reply rate. Keep it up.',
    },
  },
  {
    match: /book/i,
    color: '#f59e0b',
    messages: {
      Bronze: 'Your offer may not be creating enough urgency or interest — improve your pitch and offer.',
      Silver: 'Bookings are improving — tighten your call-to-action.',
      Gold: 'Good booking rate. Keep it up.',
      Diamond: 'Strong offer. Keep it up.',
    },
  },
  {
    match: /show/i,
    color: '#ec4899',
    messages: {
      Bronze: 'Improve your follow-up process to increase show-ups.',
      Silver: 'Show-ups are improving — send reminders before the call.',
      Gold: 'Good show-up rate. Keep it up.',
      Diamond: 'Great show-up rate. Keep it up.',
    },
  },
  {
    match: /client/i,
    color: '#10b981',
    messages: {
      Bronze: 'Improve your closing pitch to convert more meetings into clients.',
      Silver: 'Conversions are improving — refine your closing pitch.',
      Gold: 'Good conversion rate. Keep it up.',
      Diamond: 'Excellent conversion. Keep it up.',
    },
  },
]

function highlightFor(stageName) {
  return HIGHLIGHTS.find((h) => h.match.test(stageName))
}

export default function StageBreakdown({ leads, stages }) {
  const previous = usePreviousStageDistribution(7)

  const rows = useMemo(() => {
    const total = leads.length
    return stages.map((stage) => {
      const count = leads.filter((l) => l.stage_id === stage.id).length
      const prevCount = previous.byStage[stage.id] || 0
      const change = count - prevCount
      const percent = rawPct(count, total)
      return {
        stage,
        count,
        percent,
        percentLabel: fmtPct(percent),
        level: levelFor(percent),
        prevCount,
        prevPercent: fmtPct(rawPct(prevCount, previous.total)),
        change,
      }
    })
  }, [leads, stages, previous])

  if (stages.length === 0) return null

  return (
    <div className="table-wrap">
      <table className="leads-table">
        <thead>
          <tr>
            <th>Stage</th>
            <th>Number</th>
            <th>% of Total</th>
            <th>Level</th>
            <th>Previous Week</th>
            <th>Change</th>
            <th>What to Improve</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const highlight = highlightFor(row.stage.name)
            const color = highlight?.color
            const style = color
              ? { background: `${color}14`, boxShadow: `inset 3px 0 0 0 ${color}` }
              : undefined
            const improvement = highlight ? highlight.messages[row.level.label] : null
            return (
              <tr key={row.stage.id} style={style}>
                <td className="lead-name-cell" style={color ? { color } : undefined}>
                  {row.stage.name}
                </td>
                <td>{row.count}</td>
                <td>{row.percentLabel}</td>
                <td>
                  <span
                    className="level-badge"
                    style={{ color: row.level.color, background: `${row.level.color}1a`, borderColor: `${row.level.color}55` }}
                  >
                    {row.level.label}
                  </span>
                </td>
                <td>
                  {row.prevCount} <span className="muted">({row.prevPercent})</span>
                </td>
                <td>
                  {row.change > 0 && <span className="stage-change up">▲ {row.change}</span>}
                  {row.change < 0 && <span className="stage-change down">▼ {Math.abs(row.change)}</span>}
                  {row.change === 0 && <span className="muted">—</span>}
                </td>
                <td className="improve-cell">
                  {improvement || <span className="muted">—</span>}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

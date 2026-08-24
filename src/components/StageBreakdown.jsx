import { useMemo } from 'react'
import { usePreviousStageDistribution } from '../hooks/usePreviousStageDistribution'

function pct(part, whole) {
  if (!whole) return '0%'
  return `${((part / whole) * 100).toFixed(1)}%`
}

const HIGHLIGHTS = [
  { match: /open/i, color: '#3b82f6' },
  { match: /repl/i, color: '#8b5cf6' },
  { match: /book/i, color: '#f59e0b' },
  { match: /show/i, color: '#ec4899' },
  { match: /client/i, color: '#10b981' },
]

function highlightColor(stageName) {
  return HIGHLIGHTS.find((h) => h.match.test(stageName))?.color
}

export default function StageBreakdown({ leads, stages }) {
  const previous = usePreviousStageDistribution(7)

  const rows = useMemo(() => {
    const total = leads.length
    return stages.map((stage) => {
      const count = leads.filter((l) => l.stage_id === stage.id).length
      const prevCount = previous.byStage[stage.id] || 0
      const change = count - prevCount
      return {
        stage,
        count,
        percent: pct(count, total),
        prevCount,
        prevPercent: pct(prevCount, previous.total),
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
            <th>Previous Week</th>
            <th>Change</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const color = highlightColor(row.stage.name)
            const style = color
              ? { background: `${color}14`, boxShadow: `inset 3px 0 0 0 ${color}` }
              : undefined
            return (
              <tr key={row.stage.id} style={style}>
                <td className="lead-name-cell" style={color ? { color } : undefined}>
                  {row.stage.name}
                </td>
                <td>{row.count}</td>
                <td>{row.percent}</td>
                <td>
                  {row.prevCount} <span className="muted">({row.prevPercent})</span>
                </td>
                <td>
                  {row.change > 0 && <span className="stage-change up">▲ {row.change}</span>}
                  {row.change < 0 && <span className="stage-change down">▼ {Math.abs(row.change)}</span>}
                  {row.change === 0 && <span className="muted">—</span>}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

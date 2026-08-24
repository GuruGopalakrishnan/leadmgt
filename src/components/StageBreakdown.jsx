import { useMemo } from 'react'
import { usePreviousStageDistribution } from '../hooks/usePreviousStageDistribution'

function pct(part, whole) {
  if (!whole) return '0%'
  return `${((part / whole) * 100).toFixed(1)}%`
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
          {rows.map((row) => (
            <tr key={row.stage.id}>
              <td className="lead-name-cell">{row.stage.name}</td>
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
          ))}
        </tbody>
      </table>
    </div>
  )
}

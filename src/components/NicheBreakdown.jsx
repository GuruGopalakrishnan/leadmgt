import { useMemo } from 'react'

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

export default function NicheBreakdown({ leads, stages }) {
  const clientStage = useMemo(() => stages.find((s) => /client/i.test(s.name)), [stages])

  const rows = useMemo(() => {
    const groups = new Map()
    for (const lead of leads) {
      const niche = (lead.niche || '').trim()
      if (!niche) continue
      if (!groups.has(niche)) groups.set(niche, { total: 0, converted: 0 })
      const group = groups.get(niche)
      group.total += 1
      if (clientStage && lead.stage_id === clientStage.id) group.converted += 1
    }
    return Array.from(groups.entries())
      .map(([niche, group]) => {
        const percent = rawPct(group.converted, group.total)
        return {
          niche,
          total: group.total,
          converted: group.converted,
          percentLabel: fmtPct(percent),
          level: levelFor(percent),
          percent,
        }
      })
      .sort((a, b) => b.percent - a.percent || b.total - a.total)
  }, [leads, clientStage])

  if (rows.length === 0) {
    return (
      <div className="table-wrap">
        <p className="empty-hint muted">Add a Niche / Industry to your leads to see performance here.</p>
      </div>
    )
  }

  return (
    <div className="table-wrap">
      <table className="leads-table">
        <thead>
          <tr>
            <th>Niche / Industry</th>
            <th>Leads</th>
            <th>New Clients</th>
            <th>Conversion</th>
            <th>Level</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.niche}>
              <td className="lead-name-cell">{row.niche}</td>
              <td>{row.total}</td>
              <td>{row.converted}</td>
              <td>{row.percentLabel}</td>
              <td>
                <span
                  className="level-badge"
                  style={{ color: row.level.color, background: `${row.level.color}1a`, borderColor: `${row.level.color}55` }}
                >
                  {row.level.label}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

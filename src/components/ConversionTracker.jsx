import { useMemo, useState } from 'react'
import { computeFunnelFromLeads } from '../utils/conversionFunnel'

export default function ConversionTracker({ leads, stages }) {
  const [range, setRange] = useState('30')
  const today = new Date().toISOString().slice(0, 10)
  const [customStart, setCustomStart] = useState(today)
  const [customEnd, setCustomEnd] = useState(today)

  const funnel = useMemo(
    () => computeFunnelFromLeads(leads, stages, range, customStart, customEnd),
    [leads, stages, range, customStart, customEnd],
  )

  const cards = [{ label: 'Total Outreach', value: funnel.total_outreach }, ...funnel.steps]

  function pct(part, whole) {
    if (!whole) return '0%'
    return `${((part / whole) * 100).toFixed(1)}%`
  }

  return (
    <div className="conversion-tracker">
      <div className="tracker-header">
        <h2>Client Conversion Tracker</h2>
        <div className="tracker-controls">
          <select value={range} onChange={(e) => setRange(e.target.value)}>
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="this_month">This Month</option>
            <option value="custom">Custom Range</option>
          </select>
          {range === 'custom' && (
            <>
              <input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} />
              <input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} />
            </>
          )}
        </div>
      </div>

      {stages.length === 0 ? (
        <p className="empty-hint">Add at least one stage to see the funnel.</p>
      ) : (
        <div className="tracker-body">
          <div className="funnel-row">
            {cards.map((card, i) => (
              <div className="funnel-stage" key={card.label}>
                <div className="funnel-card">
                  <div className="funnel-value">{card.value.toLocaleString()}</div>
                  <div className="funnel-label">{card.label}</div>
                  {i > 0 && (
                    <div className="funnel-pct">
                      <span className="funnel-pct-total">{pct(card.value, cards[0].value)} of total</span>
                      <span className="funnel-pct-prev">{pct(card.value, cards[i - 1].value)} from prev</span>
                    </div>
                  )}
                </div>
                {i < cards.length - 1 && <span className="funnel-arrow">→</span>}
              </div>
            ))}
          </div>
          <p className="tracker-note">
            Leads added {funnel.range.start} to {funnel.range.end}. Each step counts leads currently at or past
            that stage in your Stages list order.
          </p>
        </div>
      )}
    </div>
  )
}

export const FUNNEL_STEP_LABELS = ['Opens', 'Replies', 'Calls Booked', 'Show-ups', 'New Clients']

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

export function rangeToDates(range, customStart, customEnd) {
  const end = range === 'custom' ? customEnd : todayStr()
  let start
  if (range === '7') {
    start = new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10)
  } else if (range === '30') {
    start = new Date(Date.now() - 29 * 86400000).toISOString().slice(0, 10)
  } else if (range === 'this_month') {
    const now = new Date()
    start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
  } else {
    start = customStart
  }
  return { start, end }
}

export function computeFunnelFromLeads(leads, stages, range, customStart, customEnd) {
  const { start, end } = rangeToDates(range, customStart, customEnd)

  const inRange = leads.filter((lead) => {
    const created = lead.created_at.slice(0, 10)
    return created >= start && created <= end
  })

  const positionById = Object.fromEntries(stages.map((s) => [s.id, s.position]))
  const funnelStages = stages.slice(0, 5)

  const steps = funnelStages.map((stage) => {
    const count = inRange.filter((lead) => {
      const pos = positionById[lead.stage_id]
      return pos !== undefined && pos >= stage.position
    }).length
    return count
  })

  return {
    range: { start, end },
    total_outreach: inRange.length,
    steps: funnelStages.map((stage, i) => ({
      label: FUNNEL_STEP_LABELS[i] || stage.name,
      stageName: stage.name,
      value: steps[i],
    })),
  }
}

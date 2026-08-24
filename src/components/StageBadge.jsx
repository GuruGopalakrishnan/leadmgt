import { stageColor } from '../utils/stageColor'

export default function StageBadge({ name }) {
  if (!name) return <span className="stage-badge stage-badge-empty">No stage</span>
  const color = stageColor(name)
  return (
    <span className="stage-badge" style={{ color, background: `${color}1a`, borderColor: `${color}55` }}>
      {name}
    </span>
  )
}

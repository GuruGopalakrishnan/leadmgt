import { STATUS_COLORS } from '../utils/constants'

export default function StatusBadge({ status }) {
  const color = STATUS_COLORS[status] || '#6b7280'
  return (
    <span
      className="status-badge"
      style={{ color, background: `${color}1a`, borderColor: `${color}55` }}
    >
      {status}
    </span>
  )
}

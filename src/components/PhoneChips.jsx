import { waLink } from '../utils/constants'

export default function PhoneChips({ phones }) {
  if (!phones || phones.length === 0) return <span className="muted">—</span>
  return (
    <div className="chip-list">
      {phones.map((number) => (
        <a
          key={number}
          href={waLink(number)}
          target="_blank"
          rel="noreferrer"
          className="phone-chip"
          title="Open WhatsApp chat"
        >
          {number}
        </a>
      ))}
    </div>
  )
}

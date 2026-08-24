function normalizeUrl(url) {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`
}

export default function LinkChips({ links }) {
  if (!links || links.length === 0) return <span className="muted">—</span>
  return (
    <div className="chip-list">
      {links.map((link) => (
        <a
          key={link.id}
          href={normalizeUrl(link.url)}
          target="_blank"
          rel="noreferrer"
          className="link-chip"
        >
          {link.type}
        </a>
      ))}
    </div>
  )
}

import { useState } from 'react'

export default function EmailChips({ emails }) {
  const [copiedEmail, setCopiedEmail] = useState(null)

  if (!emails || emails.length === 0) return <span className="muted">—</span>

  async function copyEmail(email) {
    try {
      await navigator.clipboard.writeText(email)
    } catch {
      // clipboard permission denied — chip label still shows the email
    }
    setCopiedEmail(email)
    setTimeout(() => setCopiedEmail((current) => (current === email ? null : current)), 1200)
  }

  return (
    <div className="chip-list">
      {emails.map((email) => (
        <button
          key={email}
          type="button"
          className="email-chip"
          onClick={(e) => {
            e.stopPropagation()
            copyEmail(email)
          }}
          title="Copy email"
        >
          {copiedEmail === email ? 'Copied ✓' : email}
        </button>
      ))}
    </div>
  )
}

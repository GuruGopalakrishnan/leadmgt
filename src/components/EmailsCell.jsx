import { useRef, useState } from 'react'
import EmailChips from './EmailChips'
import CellPopover from './CellPopover'

export default function EmailsCell({ lead, onSave }) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState([''])
  const anchorRef = useRef(null)

  function openEditor(addBlank) {
    const base = lead.emails.length ? [...lead.emails] : []
    setDraft(addBlank ? [...base, ''] : base.length ? base : [''])
    setOpen(true)
  }

  function setEmail(i, value) {
    setDraft((prev) => prev.map((e, idx) => (idx === i ? value : e)))
  }

  function removeEmail(i) {
    setDraft((prev) => prev.filter((_, idx) => idx !== i))
  }

  function handleSave() {
    const cleaned = draft.map((e) => e.trim()).filter(Boolean)
    onSave({ ...lead, emails: cleaned })
    setOpen(false)
  }

  return (
    <div className="cell-with-actions" ref={anchorRef}>
      <EmailChips emails={lead.emails} />
      <button type="button" className="icon-btn-sm" title="Edit emails" onClick={() => openEditor(false)}>
        ✎
      </button>
      <button type="button" className="icon-btn-sm" title="Add email" onClick={() => openEditor(true)}>
        +
      </button>

      <CellPopover open={open} onClose={() => setOpen(false)} anchorRef={anchorRef}>
        {draft.map((email, i) => (
          <div className="dynamic-row" key={i}>
            <input
              type="email"
              autoFocus={i === draft.length - 1}
              value={email}
              onChange={(e) => setEmail(i, e.target.value)}
            />
            {draft.length > 1 && (
              <button type="button" className="btn-icon" onClick={() => removeEmail(i)} aria-label="Remove">
                ×
              </button>
            )}
          </div>
        ))}
        <button type="button" className="btn-link" onClick={() => setDraft((prev) => [...prev, ''])}>
          + Add another email
        </button>
        <div className="cell-popover-actions">
          <button type="button" className="btn-secondary" onClick={() => setOpen(false)}>
            Cancel
          </button>
          <button type="button" className="btn-primary" onClick={handleSave}>
            Save
          </button>
        </div>
      </CellPopover>
    </div>
  )
}

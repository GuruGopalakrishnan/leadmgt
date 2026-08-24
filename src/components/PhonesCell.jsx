import { useRef, useState } from 'react'
import PhoneChips from './PhoneChips'
import CellPopover from './CellPopover'

export default function PhonesCell({ lead, onSave }) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState([''])
  const anchorRef = useRef(null)

  function openEditor(addBlank) {
    const base = lead.phones.length ? [...lead.phones] : []
    setDraft(addBlank ? [...base, ''] : base.length ? base : [''])
    setOpen(true)
  }

  function setPhone(i, value) {
    setDraft((prev) => prev.map((p, idx) => (idx === i ? value : p)))
  }

  function removePhone(i) {
    setDraft((prev) => prev.filter((_, idx) => idx !== i))
  }

  function handleSave() {
    const cleaned = draft.map((p) => p.trim()).filter(Boolean)
    onSave({ ...lead, phones: cleaned })
    setOpen(false)
  }

  return (
    <div className="cell-with-actions" ref={anchorRef}>
      <PhoneChips phones={lead.phones} />
      <button type="button" className="icon-btn-sm" title="Edit numbers" onClick={() => openEditor(false)}>
        ✎
      </button>
      <button type="button" className="icon-btn-sm" title="Add number" onClick={() => openEditor(true)}>
        +
      </button>

      <CellPopover open={open} onClose={() => setOpen(false)} anchorRef={anchorRef}>
        {draft.map((phone, i) => (
          <div className="dynamic-row" key={i}>
            <input
              type="tel"
              autoFocus={i === draft.length - 1}
              value={phone}
              onChange={(e) => setPhone(i, e.target.value)}
            />
            {draft.length > 1 && (
              <button type="button" className="btn-icon" onClick={() => removePhone(i)} aria-label="Remove">
                ×
              </button>
            )}
          </div>
        ))}
        <button type="button" className="btn-link" onClick={() => setDraft((prev) => [...prev, ''])}>
          + Add another number
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

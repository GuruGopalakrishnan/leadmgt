import { useRef, useState } from 'react'
import LinkChips from './LinkChips'
import CellPopover from './CellPopover'
import { LINK_TYPES } from '../utils/constants'

export default function LinksCell({ lead, onSave }) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState([{ type: LINK_TYPES[0], url: '' }])
  const anchorRef = useRef(null)

  function openEditor(addBlank) {
    const base = lead.links.length ? lead.links.map((l) => ({ type: l.type, url: l.url })) : []
    setDraft(addBlank ? [...base, { type: LINK_TYPES[0], url: '' }] : base.length ? base : [{ type: LINK_TYPES[0], url: '' }])
    setOpen(true)
  }

  function setLink(i, field, value) {
    setDraft((prev) => prev.map((l, idx) => (idx === i ? { ...l, [field]: value } : l)))
  }

  function removeLink(i) {
    setDraft((prev) => prev.filter((_, idx) => idx !== i))
  }

  function handleSave() {
    const cleaned = draft.map((l) => ({ type: l.type, url: l.url.trim() })).filter((l) => l.url)
    onSave({ ...lead, links: cleaned })
    setOpen(false)
  }

  return (
    <div className="cell-with-actions" ref={anchorRef}>
      <LinkChips links={lead.links} />
      <button type="button" className="icon-btn-sm" title="Edit links" onClick={() => openEditor(false)}>
        ✎
      </button>
      <button type="button" className="icon-btn-sm" title="Add link" onClick={() => openEditor(true)}>
        +
      </button>

      <CellPopover open={open} onClose={() => setOpen(false)} anchorRef={anchorRef}>
        {draft.map((link, i) => (
          <div className="dynamic-row" key={i}>
            <select value={link.type} onChange={(e) => setLink(i, 'type', e.target.value)}>
              {LINK_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="https://..."
              autoFocus={i === draft.length - 1}
              value={link.url}
              onChange={(e) => setLink(i, 'url', e.target.value)}
            />
            {draft.length > 1 && (
              <button type="button" className="btn-icon" onClick={() => removeLink(i)} aria-label="Remove">
                ×
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          className="btn-link"
          onClick={() => setDraft((prev) => [...prev, { type: LINK_TYPES[0], url: '' }])}
        >
          + Add another link
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

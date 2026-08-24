import { useRef, useState } from 'react'
import CellPopover from './CellPopover'

export default function ReminderCell({ lead, onSave }) {
  const [open, setOpen] = useState(false)
  const [date, setDate] = useState(lead.reminder_date || '')
  const [time, setTime] = useState(lead.reminder_time || '')
  const [note, setNote] = useState(lead.reminder_note || '')
  const anchorRef = useRef(null)

  function openEditor() {
    setDate(lead.reminder_date || '')
    setTime(lead.reminder_time || '')
    setNote(lead.reminder_note || '')
    setOpen(true)
  }

  function handleSave() {
    onSave({
      ...lead,
      reminder_date: date || null,
      reminder_time: date ? time || null : null,
      reminder_note: note.trim() || null,
    })
    setOpen(false)
  }

  function handleRemove() {
    onSave({ ...lead, reminder_date: null, reminder_time: null, reminder_note: null })
    setOpen(false)
  }

  const hasReminder = Boolean(lead.reminder_date)

  return (
    <div className="cell-with-actions" ref={anchorRef}>
      {hasReminder ? (
        <>
          <span className="reminder-note-text" title={lead.reminder_note || ''}>
            {lead.reminder_note || <span className="muted">No note</span>}
          </span>
          <button type="button" className="icon-btn-sm" title="Edit reminder" onClick={openEditor}>
            ✎
          </button>
        </>
      ) : (
        <button type="button" className="btn-link" onClick={openEditor}>
          + Add
        </button>
      )}

      <CellPopover open={open} onClose={() => setOpen(false)} anchorRef={anchorRef}>
        <div className="form-row">
          <label>
            Date
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
          <label>
            Time
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} disabled={!date} />
          </label>
        </div>
        <label>
          Follow-up notes
          <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="What to follow up about" />
        </label>
        <div className="cell-popover-actions">
          {hasReminder && (
            <button type="button" className="btn-link danger" onClick={handleRemove}>
              Remove
            </button>
          )}
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

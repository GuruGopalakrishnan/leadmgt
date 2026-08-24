import { useState } from 'react'
import { DEFAULT_SOURCES, LINK_TYPES } from '../utils/constants'

function toFormState(lead, stages) {
  const knownSource = lead?.source && DEFAULT_SOURCES.includes(lead.source)
  return {
    name: lead?.name || '',
    source: lead ? (knownSource ? lead.source : lead.source ? 'Other' : DEFAULT_SOURCES[0]) : DEFAULT_SOURCES[0],
    customSource: lead && !knownSource ? lead.source || '' : '',
    stage_id: lead?.stage_id ?? stages[0]?.id ?? '',
    reminder_date: lead?.reminder_date || '',
    reminder_time: lead?.reminder_time || '',
    reminder_note: lead?.reminder_note || '',
    phones: lead?.phones?.length ? [...lead.phones] : [''],
    links: lead?.links?.length ? lead.links.map((l) => ({ type: l.type, url: l.url })) : [{ type: LINK_TYPES[0], url: '' }],
  }
}

export default function LeadForm({ lead, stages, onSave, onClose }) {
  const [form, setForm] = useState(() => toFormState(lead, stages))
  const [error, setError] = useState('')

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function setPhone(i, value) {
    setForm((prev) => ({ ...prev, phones: prev.phones.map((p, idx) => (idx === i ? value : p)) }))
  }

  function addPhone() {
    setForm((prev) => ({ ...prev, phones: [...prev.phones, ''] }))
  }

  function removePhone(i) {
    setForm((prev) => ({ ...prev, phones: prev.phones.filter((_, idx) => idx !== i) }))
  }

  function setLink(i, field, value) {
    setForm((prev) => ({
      ...prev,
      links: prev.links.map((l, idx) => (idx === i ? { ...l, [field]: value } : l)),
    }))
  }

  function addLink() {
    setForm((prev) => ({ ...prev, links: [...prev.links, { type: LINK_TYPES[0], url: '' }] }))
  }

  function removeLink(i) {
    setForm((prev) => ({ ...prev, links: prev.links.filter((_, idx) => idx !== i) }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) {
      setError('Name is required.')
      return
    }
    const source = form.source === 'Other' ? form.customSource.trim() : form.source
    onSave({
      name: form.name.trim(),
      source: source || null,
      stage_id: form.stage_id || null,
      reminder_date: form.reminder_date || null,
      reminder_time: form.reminder_date ? form.reminder_time || null : null,
      reminder_note: form.reminder_note || null,
      phones: form.phones.map((p) => p.trim()).filter(Boolean),
      links: form.links.map((l) => ({ type: l.type, url: l.url.trim() })).filter((l) => l.url),
    })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{lead ? 'Edit Lead' : 'Add Lead'}</h2>
          <button type="button" className="btn-icon" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="lead-form">
          {error && <p className="form-error">{error}</p>}

          <label>
            Name *
            <input type="text" value={form.name} onChange={(e) => set('name', e.target.value)} autoFocus />
          </label>

          <fieldset className="form-fieldset">
            <legend>Phone numbers</legend>
            {form.phones.map((phone, i) => (
              <div className="dynamic-row" key={i}>
                <input
                  type="tel"
                  placeholder="e.g. 91XXXXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(i, e.target.value)}
                />
                {form.phones.length > 1 && (
                  <button type="button" className="btn-icon" onClick={() => removePhone(i)} aria-label="Remove phone">
                    ×
                  </button>
                )}
              </div>
            ))}
            <button type="button" className="btn-link" onClick={addPhone}>
              + Add another number
            </button>
          </fieldset>

          <fieldset className="form-fieldset">
            <legend>Links</legend>
            {form.links.map((link, i) => (
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
                  value={link.url}
                  onChange={(e) => setLink(i, 'url', e.target.value)}
                />
                {form.links.length > 1 && (
                  <button type="button" className="btn-icon" onClick={() => removeLink(i)} aria-label="Remove link">
                    ×
                  </button>
                )}
              </div>
            ))}
            <button type="button" className="btn-link" onClick={addLink}>
              + Add another link
            </button>
          </fieldset>

          <div className="form-row">
            <label>
              Source
              <select value={form.source} onChange={(e) => set('source', e.target.value)}>
                {DEFAULT_SOURCES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
                <option value="Other">Other</option>
              </select>
            </label>
            <label>
              Stage
              <select value={form.stage_id} onChange={(e) => set('stage_id', Number(e.target.value))}>
                {stages.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {form.source === 'Other' && (
            <label>
              Custom source
              <input
                type="text"
                value={form.customSource}
                onChange={(e) => set('customSource', e.target.value)}
                placeholder="Where did this lead come from?"
              />
            </label>
          )}

          <fieldset className="form-fieldset">
            <legend>Reminder</legend>
            <div className="form-row">
              <label>
                Date
                <input type="date" value={form.reminder_date} onChange={(e) => set('reminder_date', e.target.value)} />
              </label>
              <label>
                Time
                <input
                  type="time"
                  value={form.reminder_time}
                  onChange={(e) => set('reminder_time', e.target.value)}
                  disabled={!form.reminder_date}
                />
              </label>
            </div>
            <label>
              Note
              <input
                type="text"
                value={form.reminder_note}
                onChange={(e) => set('reminder_note', e.target.value)}
                placeholder="What to follow up about"
              />
            </label>
          </fieldset>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {lead ? 'Save Changes' : 'Add Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

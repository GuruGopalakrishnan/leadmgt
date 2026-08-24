import { useState } from 'react'
import { SOURCES, STATUSES } from '../utils/constants'

const EMPTY = {
  name: '',
  company: '',
  email: '',
  phone: '',
  source: SOURCES[0],
  status: STATUSES[0],
  notes: '',
}

export default function LeadForm({ lead, onSave, onClose }) {
  const [form, setForm] = useState(lead ? { ...EMPTY, ...lead } : EMPTY)
  const [error, setError] = useState('')

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) {
      setError('Name is required.')
      return
    }
    onSave(form)
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
          <div className="form-row">
            <label>
              Name *
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                autoFocus
              />
            </label>
            <label>
              Company
              <input
                type="text"
                value={form.company}
                onChange={(e) => handleChange('company', e.target.value)}
              />
            </label>
          </div>
          <div className="form-row">
            <label>
              Email
              <input
                type="email"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
              />
            </label>
            <label>
              Phone
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
              />
            </label>
          </div>
          <div className="form-row">
            <label>
              Source
              <select
                value={form.source}
                onChange={(e) => handleChange('source', e.target.value)}
              >
                {SOURCES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Status
              <select
                value={form.status}
                onChange={(e) => handleChange('status', e.target.value)}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label>
            Notes
            <textarea
              rows={3}
              value={form.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
            />
          </label>
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

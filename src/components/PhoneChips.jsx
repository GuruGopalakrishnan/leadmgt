import { useState } from 'react'
import { waLink } from '../utils/constants'

export default function PhoneChips({ phones, leadName }) {
  const [activeNumber, setActiveNumber] = useState(null)

  if (!phones || phones.length === 0) return <span className="muted">—</span>

  return (
    <>
      <div className="chip-list">
        {phones.map((number) => (
          <button
            key={number}
            type="button"
            className="phone-chip"
            onClick={(e) => {
              e.stopPropagation()
              setActiveNumber(number)
            }}
          >
            {number}
          </button>
        ))}
      </div>

      {activeNumber && (
        <div className="modal-overlay" onClick={() => setActiveNumber(null)}>
          <div className="modal whatsapp-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Open WhatsApp</h2>
              <button
                type="button"
                className="btn-icon"
                onClick={() => setActiveNumber(null)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="whatsapp-dialog-body">
              <p>
                Chat with <strong>{leadName || activeNumber}</strong>
                {leadName && <span className="muted"> ({activeNumber})</span>}?
              </p>
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setActiveNumber(null)}>
                  Cancel
                </button>
                <a
                  href={waLink(activeNumber)}
                  className="btn-primary"
                  onClick={() => setActiveNumber(null)}
                >
                  Open WhatsApp Chat
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

import { useState } from 'react'
import { STATUSES } from '../utils/constants'

export default function PipelineBoard({ leads, onEdit, onSetStatus }) {
  const [dragOverStatus, setDragOverStatus] = useState(null)

  function handleDrop(e, status) {
    e.preventDefault()
    const id = e.dataTransfer.getData('text/lead-id')
    if (id) onSetStatus(id, status)
    setDragOverStatus(null)
  }

  return (
    <div className="pipeline-board">
      {STATUSES.map((status) => {
        const columnLeads = leads.filter((lead) => lead.status === status)
        return (
          <div
            key={status}
            className={`pipeline-column${dragOverStatus === status ? ' drag-over' : ''}`}
            onDragOver={(e) => {
              e.preventDefault()
              setDragOverStatus(status)
            }}
            onDragLeave={() => setDragOverStatus(null)}
            onDrop={(e) => handleDrop(e, status)}
          >
            <div className="pipeline-column-header">
              <span>{status}</span>
              <span className="pipeline-count">{columnLeads.length}</span>
            </div>
            <div className="pipeline-cards">
              {columnLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="pipeline-card"
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData('text/lead-id', lead.id)}
                  onClick={() => onEdit(lead)}
                >
                  <div className="pipeline-card-name">{lead.name}</div>
                  {lead.company && <div className="pipeline-card-company">{lead.company}</div>}
                  <div className="pipeline-card-source">{lead.source}</div>
                </div>
              ))}
              {columnLeads.length === 0 && <div className="pipeline-empty">Drop leads here</div>}
            </div>
          </div>
        )
      })}
    </div>
  )
}

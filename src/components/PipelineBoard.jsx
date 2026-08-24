import { useState } from 'react'
import PhoneChips from './PhoneChips'

export default function PipelineBoard({ leads, stages, onEdit, onMoveStage }) {
  const [dragOverStage, setDragOverStage] = useState(null)

  function handleDrop(e, stageId) {
    e.preventDefault()
    const leadId = e.dataTransfer.getData('text/lead-id')
    if (leadId) onMoveStage(leadId, stageId)
    setDragOverStage(null)
  }

  return (
    <div className="pipeline-board" style={{ gridTemplateColumns: `repeat(${stages.length}, minmax(220px, 1fr))` }}>
      {stages.map((stage) => {
        const columnLeads = leads.filter((lead) => lead.stage_id === stage.id)
        return (
          <div
            key={stage.id}
            className={`pipeline-column${dragOverStage === stage.id ? ' drag-over' : ''}`}
            onDragOver={(e) => {
              e.preventDefault()
              setDragOverStage(stage.id)
            }}
            onDragLeave={() => setDragOverStage(null)}
            onDrop={(e) => handleDrop(e, stage.id)}
          >
            <div className="pipeline-column-header">
              <span>{stage.name}</span>
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
                  {lead.source && <div className="pipeline-card-company">{lead.source}</div>}
                  <div onClick={(e) => e.stopPropagation()}>
                    <PhoneChips phones={lead.phones} />
                  </div>
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

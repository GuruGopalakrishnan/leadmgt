import { useState } from 'react'
import Header from './components/Header'
import Dashboard from './components/Dashboard'
import LeadTable from './components/LeadTable'
import PipelineBoard from './components/PipelineBoard'
import TodayFollowups from './components/TodayFollowups'
import StagesManager from './components/StagesManager'
import LeadForm from './components/LeadForm'
import { useLeads } from './hooks/useLeads'
import { useStages } from './hooks/useStages'
import { useReminderNotifications } from './hooks/useReminderNotifications'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [filters, setFilters] = useState({})
  const [editingLead, setEditingLead] = useState(null)
  const [showForm, setShowForm] = useState(false)

  const { stages, addStage, renameStage, deleteStage, reorderStages } = useStages()
  const { leads: allLeads, refetch: refetchAll } = useLeads({})
  const { leads: filteredLeads, loading, addLead, updateLead, deleteLead } = useLeads(filters)
  const { permission, requestPermission } = useReminderNotifications()

  function openAddForm() {
    setEditingLead(null)
    setShowForm(true)
  }

  function openEditForm(lead) {
    setEditingLead(lead)
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditingLead(null)
  }

  async function handleSave(data) {
    if (editingLead) {
      await updateLead(editingLead.id, data)
    } else {
      await addLead(data)
    }
    refetchAll()
    closeForm()
  }

  async function handleDelete(id) {
    if (!confirm('Delete this lead?')) return
    await deleteLead(id)
    refetchAll()
  }

  async function handleQuickUpdate(updatedLead) {
    await updateLead(updatedLead.id, updatedLead)
    refetchAll()
  }

  async function handleMoveStage(leadId, stageId) {
    const lead = allLeads.find((l) => l.id === Number(leadId))
    if (!lead) return
    await updateLead(leadId, {
      name: lead.name,
      source: lead.source,
      stage_id: stageId,
      reminder_date: lead.reminder_date,
      reminder_time: lead.reminder_time,
      reminder_note: lead.reminder_note,
      phones: lead.phones,
      links: lead.links,
    })
    refetchAll()
  }

  return (
    <div className="app-shell">
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onAddLead={openAddForm}
        notifyPermission={permission}
        onEnableNotify={requestPermission}
      />

      <main className="app-main">
        {activeTab === 'dashboard' && <Dashboard leads={allLeads} stages={stages} />}

        {activeTab === 'leads' && (
          <LeadTable
            leads={filteredLeads}
            loading={loading}
            stages={stages}
            filters={filters}
            onFilterChange={setFilters}
            onEdit={openEditForm}
            onDelete={handleDelete}
            onQuickUpdate={handleQuickUpdate}
          />
        )}

        {activeTab === 'pipeline' && (
          <PipelineBoard leads={allLeads} stages={stages} onEdit={openEditForm} onMoveStage={handleMoveStage} />
        )}

        {activeTab === 'followups' && <TodayFollowups stages={stages} onEdit={openEditForm} />}

        {activeTab === 'stages' && (
          <StagesManager
            stages={stages}
            onAdd={addStage}
            onRename={renameStage}
            onDelete={deleteStage}
            onReorder={reorderStages}
          />
        )}
      </main>

      {showForm && <LeadForm lead={editingLead} stages={stages} onSave={handleSave} onClose={closeForm} />}
    </div>
  )
}

export default App

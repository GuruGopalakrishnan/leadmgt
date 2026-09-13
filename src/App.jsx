import { useState } from 'react'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import Dashboard from './components/Dashboard'
import LeadTable from './components/LeadTable'
import PipelineBoard from './components/PipelineBoard'
import TodayFollowups from './components/TodayFollowups'
import JourneyDashboard from './components/JourneyDashboard'
import StagesManager from './components/StagesManager'
import LeadForm from './components/LeadForm'
import { useLeads } from './hooks/useLeads'
import { useStages } from './hooks/useStages'
import { useReminderNotifications } from './hooks/useReminderNotifications'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [leadsView, setLeadsView] = useState('row')
  const [filters, setFilters] = useState({})
  const [editingLead, setEditingLead] = useState(null)
  const [showForm, setShowForm] = useState(false)

  const { stages, addStage, renameStage, deleteStage, reorderStages } = useStages()
  const { leads: allLeads, setLeads: setAllLeads, refetch: refetchAll } = useLeads({})
  const {
    leads: filteredLeads,
    loading,
    addLead,
    updateLead,
    deleteLead,
    refetch: refetchFiltered,
  } = useLeads(filters)
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
      const saved = await updateLead(editingLead.id, data)
      setAllLeads((prev) => prev.map((l) => (l.id === saved.id ? saved : l)))
    } else {
      const created = await addLead(data)
      setAllLeads((prev) => [created, ...prev])
    }
    closeForm()
  }

  async function handleDelete(id) {
    if (!confirm('Delete this lead?')) return
    await deleteLead(id)
    setAllLeads((prev) => prev.filter((l) => String(l.id) !== String(id)))
  }

  async function handleQuickUpdate(updatedLead) {
    const saved = await updateLead(updatedLead.id, updatedLead)
    setAllLeads((prev) => prev.map((l) => (l.id === saved.id ? saved : l)))
  }

  function handleImported() {
    refetchFiltered()
    refetchAll()
  }

  async function handleMoveStage(leadId, stageId) {
    const lead = allLeads.find((l) => l.id === Number(leadId))
    if (!lead) return
    const saved = await updateLead(leadId, {
      name: lead.name,
      source: lead.source,
      niche: lead.niche,
      stage_id: stageId,
      reminder_date: lead.reminder_date,
      reminder_time: lead.reminder_time,
      reminder_note: lead.reminder_note,
      phones: lead.phones,
      emails: lead.emails,
      links: lead.links,
    })
    setAllLeads((prev) => prev.map((l) => (l.id === saved.id ? saved : l)))
  }

  return (
    <div className="app-shell">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="app-content">
        <Topbar
          activeTab={activeTab}
          leadsView={leadsView}
          onLeadsViewChange={setLeadsView}
          onAddLead={openAddForm}
          notifyPermission={permission}
          onEnableNotify={requestPermission}
        />

        <main className="app-main">
          {activeTab === 'dashboard' && (
            <Dashboard leads={allLeads} stages={stages} onNavigate={setActiveTab} />
          )}

          {activeTab === 'leads' && leadsView === 'row' && (
            <LeadTable
              leads={filteredLeads}
              allLeads={allLeads}
              loading={loading}
              stages={stages}
              filters={filters}
              onFilterChange={setFilters}
              onEdit={openEditForm}
              onDelete={handleDelete}
              onQuickUpdate={handleQuickUpdate}
              onImported={handleImported}
            />
          )}

          {activeTab === 'leads' && leadsView === 'grid' && (
            <PipelineBoard leads={allLeads} stages={stages} onEdit={openEditForm} onMoveStage={handleMoveStage} />
          )}

          {activeTab === 'followups' && <TodayFollowups stages={stages} onEdit={openEditForm} />}

          {activeTab === 'journey' && <JourneyDashboard />}

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
      </div>

      {showForm && <LeadForm lead={editingLead} stages={stages} onSave={handleSave} onClose={closeForm} />}
    </div>
  )
}

export default App

import { useState } from 'react'
import Header from './components/Header'
import Dashboard from './components/Dashboard'
import LeadTable from './components/LeadTable'
import PipelineBoard from './components/PipelineBoard'
import LeadForm from './components/LeadForm'
import { useLeads } from './hooks/useLeads'
import './App.css'

function App() {
  const { leads, addLead, updateLead, deleteLead, setStatus, loadSampleData } = useLeads()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [editingLead, setEditingLead] = useState(null)
  const [showForm, setShowForm] = useState(false)

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

  function handleSave(data) {
    if (editingLead) {
      updateLead(editingLead.id, data)
    } else {
      addLead(data)
    }
    closeForm()
  }

  function handleDelete(id) {
    if (confirm('Delete this lead?')) deleteLead(id)
  }

  return (
    <div className="app-shell">
      <Header activeTab={activeTab} onTabChange={setActiveTab} onAddLead={openAddForm} />

      <main className="app-main">
        {activeTab === 'dashboard' && <Dashboard leads={leads} />}
        {activeTab === 'leads' && (
          <LeadTable
            leads={leads}
            onEdit={openEditForm}
            onDelete={handleDelete}
            onLoadSample={loadSampleData}
          />
        )}
        {activeTab === 'pipeline' && (
          <PipelineBoard leads={leads} onEdit={openEditForm} onSetStatus={setStatus} />
        )}
      </main>

      {showForm && (
        <LeadForm lead={editingLead} onSave={handleSave} onClose={closeForm} />
      )}
    </div>
  )
}

export default App

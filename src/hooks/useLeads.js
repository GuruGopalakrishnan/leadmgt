import { useEffect, useState } from 'react'

const STORAGE_KEY = 'leadmgt.leads'

function loadLeads() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function makeId() {
  return crypto.randomUUID()
}

export function useLeads() {
  const [leads, setLeads] = useState(loadLeads)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(leads))
  }, [leads])

  function addLead(data) {
    const now = new Date().toISOString()
    const lead = {
      id: makeId(),
      status: 'New',
      createdAt: now,
      updatedAt: now,
      ...data,
    }
    setLeads((prev) => [lead, ...prev])
    return lead
  }

  function updateLead(id, data) {
    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === id
          ? { ...lead, ...data, updatedAt: new Date().toISOString() }
          : lead,
      ),
    )
  }

  function deleteLead(id) {
    setLeads((prev) => prev.filter((lead) => lead.id !== id))
  }

  function setStatus(id, status) {
    updateLead(id, { status })
  }

  function loadSampleData() {
    const samples = [
      { name: 'Ava Thompson', company: 'Northwind Traders', email: 'ava@northwind.com', phone: '555-0101', source: 'Website', status: 'New', notes: 'Downloaded pricing sheet.' },
      { name: 'Marcus Lee', company: 'Contoso Ltd', email: 'marcus@contoso.com', phone: '555-0142', source: 'Referral', status: 'Contacted', notes: 'Referred by existing customer.' },
      { name: 'Priya Nair', company: 'Globex Corp', email: 'priya@globex.com', phone: '555-0198', source: 'Event', status: 'Qualified', notes: 'Met at trade show, budget confirmed.' },
      { name: 'Diego Alvarez', company: 'Initech', email: 'diego@initech.com', phone: '555-0175', source: 'Cold Call', status: 'Won', notes: 'Signed annual contract.' },
      { name: 'Sofia Rossi', company: 'Umbrella Inc', email: 'sofia@umbrella.com', phone: '555-0133', source: 'Social Media', status: 'Lost', notes: 'Went with a competitor.' },
    ]
    const now = new Date().toISOString()
    setLeads((prev) => [
      ...samples.map((s) => ({ id: makeId(), createdAt: now, updatedAt: now, ...s })),
      ...prev,
    ])
  }

  return { leads, addLead, updateLead, deleteLead, setStatus, loadSampleData }
}

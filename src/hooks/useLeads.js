import { useCallback, useEffect, useState } from 'react'
import { api } from '../api/client'

export function useLeads(filters) {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const filtersKey = JSON.stringify(filters)
  const refetch = useCallback(async () => {
    setLoading(true)
    try {
      const data = await api.getLeads(JSON.parse(filtersKey))
      setLeads(data)
      setError('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [filtersKey])

  useEffect(() => {
    refetch()
  }, [refetch])

  async function addLead(data) {
    const created = await api.createLead(data)
    setLeads((prev) => [created, ...prev])
    return created
  }

  async function updateLead(id, data) {
    setLeads((prev) => prev.map((l) => (String(l.id) === String(id) ? { ...l, ...data } : l)))
    try {
      const updated = await api.updateLead(id, data)
      setLeads((prev) => prev.map((l) => (String(l.id) === String(id) ? updated : l)))
      return updated
    } catch (err) {
      setError(err.message)
      await refetch()
      throw err
    }
  }

  async function deleteLead(id) {
    setLeads((prev) => prev.filter((l) => String(l.id) !== String(id)))
    try {
      await api.deleteLead(id)
    } catch (err) {
      setError(err.message)
      await refetch()
      throw err
    }
  }

  return { leads, setLeads, loading, error, refetch, addLead, updateLead, deleteLead }
}

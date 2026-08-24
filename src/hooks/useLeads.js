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
    await api.createLead(data)
    await refetch()
  }

  async function updateLead(id, data) {
    await api.updateLead(id, data)
    await refetch()
  }

  async function deleteLead(id) {
    await api.deleteLead(id)
    await refetch()
  }

  return { leads, loading, error, refetch, addLead, updateLead, deleteLead }
}

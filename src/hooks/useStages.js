import { useCallback, useEffect, useState } from 'react'
import { api } from '../api/client'

export function useStages() {
  const [stages, setStages] = useState([])
  const [loading, setLoading] = useState(true)

  const refetch = useCallback(async () => {
    setLoading(true)
    const data = await api.getStages()
    setStages(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  async function addStage(name) {
    await api.createStage(name)
    await refetch()
  }

  async function renameStage(id, name) {
    await api.updateStage(id, name)
    await refetch()
  }

  async function deleteStage(id) {
    await api.deleteStage(id)
    await refetch()
  }

  async function reorderStages(order) {
    setStages((prev) => {
      const byId = Object.fromEntries(prev.map((s) => [s.id, s]))
      return order.map((id) => byId[id])
    })
    await api.reorderStages(order)
    await refetch()
  }

  return { stages, loading, refetch, addStage, renameStage, deleteStage, reorderStages }
}

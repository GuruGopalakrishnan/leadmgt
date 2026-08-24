import { useEffect, useState } from 'react'
import { api } from '../api/client'

export function usePreviousStageDistribution(daysAgo = 7) {
  const [data, setData] = useState({ total: 0, byStage: {} })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    api.getStageDistributionAt(daysAgo).then((result) => {
      if (!cancelled) {
        setData(result)
        setLoading(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [daysAgo])

  return { ...data, loading }
}

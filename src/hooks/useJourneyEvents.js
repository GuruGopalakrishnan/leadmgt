import { useEffect, useState } from 'react'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

export function useJourneyEvents() {
  const [data, setData] = useState({ feed: [], sessions: [], stats: null })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function poll() {
      try {
        const res = await fetch(`${API_BASE}/events/dashboard`)
        if (!res.ok) throw new Error(`Request failed: ${res.status}`)
        const json = await res.json()
        if (!cancelled) {
          setData(json)
          setError('')
        }
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    poll()
    const interval = setInterval(poll, 4000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [])

  return { ...data, loading, error }
}

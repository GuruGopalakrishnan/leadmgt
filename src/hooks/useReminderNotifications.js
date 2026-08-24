import { useEffect, useState } from 'react'
import { api } from '../api/client'

const POLL_MS = 30000

export function useReminderNotifications() {
  const [permission, setPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported',
  )

  function requestPermission() {
    if (typeof Notification === 'undefined') return
    Notification.requestPermission().then(setPermission)
  }

  useEffect(() => {
    let cancelled = false

    async function poll() {
      try {
        const due = await api.getDueLeads()
        if (cancelled) return
        for (const lead of due) {
          if (permission === 'granted' && typeof Notification !== 'undefined') {
            new Notification(`Follow up: ${lead.name}`, {
              body: lead.reminder_note || 'It’s time to follow up on this lead.',
              tag: `lead-${lead.id}`,
            })
          }
          await api.markNotified(lead.id)
        }
      } catch {
        // network hiccup — try again on the next tick
      }
    }

    poll()
    const id = setInterval(poll, POLL_MS)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [permission])

  return { permission, requestPermission }
}

export const DEFAULT_SOURCES = ['Google GMB', 'BNI', 'Udemy', 'Website', 'Instagram', 'LinkedIn']

export const LINK_TYPES = ['Website', 'LinkedIn', 'Instagram', 'Other']

export const FOLLOWUP_FILTERS = [
  { value: '', label: 'All' },
  { value: 'today', label: 'Today' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'none', label: 'No reminder' },
]

export function waLink(number) {
  const digits = number.replace(/[^\d]/g, '')
  return `https://wa.me/${digits}`
}

export function formatReminder(date, time) {
  if (!date) return null
  const d = new Date(`${date}T${time || '00:00'}`)
  const dateStr = d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
  if (!time) return dateStr
  const timeStr = d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
  return `${dateStr} – ${timeStr}`
}

const API_BASE = import.meta.env.VITE_API_URL || '/api'

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `Request failed: ${res.status}`)
  }
  if (res.status === 204) return null
  return res.json()
}

export const api = {
  getLeads: (params = {}) => {
    const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v))
    const suffix = qs.toString() ? `?${qs}` : ''
    return request(`/leads${suffix}`)
  },
  getDueLeads: () => request('/leads/due/now'),
  getStageDistributionAt: (daysAgo) => request(`/leads/stage-distribution/at?daysAgo=${daysAgo}`),
  createLead: (data) => request('/leads', { method: 'POST', body: JSON.stringify(data) }),
  updateLead: (id, data) => request(`/leads/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteLead: (id) => request(`/leads/${id}`, { method: 'DELETE' }),
  markNotified: (id) => request(`/leads/${id}/notified`, { method: 'POST' }),

  getStages: () => request('/stages'),
  createStage: (name) => request('/stages', { method: 'POST', body: JSON.stringify({ name }) }),
  updateStage: (id, name) => request(`/stages/${id}`, { method: 'PUT', body: JSON.stringify({ name }) }),
  deleteStage: (id) => request(`/stages/${id}`, { method: 'DELETE' }),
  reorderStages: (order) => request('/stages/reorder', { method: 'PUT', body: JSON.stringify({ order }) }),

  getSources: () => request('/sources'),
}

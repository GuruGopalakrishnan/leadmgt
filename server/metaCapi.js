import crypto from 'node:crypto'

const GRAPH_VERSION = 'v21.0'

const CAPI_EVENT_NAMES = {
  lead_submitted: 'Lead',
  whatsapp_click: 'Contact',
  call_click: 'Contact',
}

function sha256(value) {
  if (!value) return undefined
  return crypto.createHash('sha256').update(String(value).trim().toLowerCase()).digest('hex')
}

function isConfigured() {
  const pixelId = process.env.META_PIXEL_ID
  const token = process.env.META_CAPI_ACCESS_TOKEN
  if (!pixelId || !token) return false
  if (token.startsWith('DUMMY')) return false
  return true
}

export function isConversionEvent(eventName) {
  return Object.prototype.hasOwnProperty.call(CAPI_EVENT_NAMES, eventName)
}

export async function sendToMetaCapi(event) {
  if (!isConversionEvent(event.event_name)) {
    return { status: 'skipped', reason: 'Not a conversion event' }
  }
  if (!isConfigured()) {
    return { status: 'skipped', reason: 'Meta Pixel ID / CAPI access token not configured (dummy)' }
  }

  const pixelId = process.env.META_PIXEL_ID
  const token = process.env.META_CAPI_ACCESS_TOKEN

  const payload = {
    data: [
      {
        event_name: CAPI_EVENT_NAMES[event.event_name],
        event_time: Math.floor(new Date(event.created_at).getTime() / 1000),
        event_id: event.event_id,
        event_source_url: event.page_url || undefined,
        action_source: 'website',
        user_data: {
          em: sha256(event.email) ? [sha256(event.email)] : undefined,
          ph: sha256(event.phone) ? [sha256(event.phone)] : undefined,
          fbp: event.fbp || undefined,
          fbc: event.fbc || undefined,
        },
      },
    ],
  }

  try {
    const res = await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${pixelId}/events?access_token=${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const body = await res.json().catch(() => ({}))
    if (!res.ok) {
      return { status: 'failed', reason: body?.error?.message || `HTTP ${res.status}` }
    }
    return { status: 'sent', reason: null }
  } catch (err) {
    return { status: 'failed', reason: err.message }
  }
}

import { Router } from 'express'
import crypto from 'node:crypto'
import db from './db.js'
import { sendToMetaCapi, isConversionEvent } from './metaCapi.js'

const router = Router()

const ALLOWED_EVENTS = new Set([
  'page_view',
  'form_view',
  'form_start',
  'lead_submitted',
  'whatsapp_click',
  'call_click',
])

function clip(value, max) {
  if (typeof value !== 'string') return null
  return value.trim().slice(0, max) || null
}

router.post('/', async (req, res) => {
  const body = req.body || {}
  const eventName = body.event_name
  if (!ALLOWED_EVENTS.has(eventName)) {
    return res.status(400).json({ error: `Unknown event_name. Allowed: ${[...ALLOWED_EVENTS].join(', ')}` })
  }
  const visitorId = clip(body.visitor_id, 100)
  const sessionId = clip(body.session_id, 100)
  if (!visitorId || !sessionId) {
    return res.status(400).json({ error: 'visitor_id and session_id are required.' })
  }

  const eventId = clip(body.event_id, 100) || crypto.randomUUID()
  const now = new Date().toISOString()
  const name = clip(body.name, 200)
  const phone = clip(body.phone, 40)
  const email = clip(body.email, 200)

  let leadId = null
  if (eventName === 'lead_submitted' && (name || phone || email)) {
    const leadName = name || phone || email || 'Website Lead'
    const source = clip(body.utm_source, 100) ? `Website Tracking (${clip(body.utm_source, 100)})` : 'Website Tracking'
    const info = await db.execute({
      sql: `INSERT INTO leads (name, source, niche, stage_id, reminder_date, reminder_time, reminder_note, reminder_notified, created_at, updated_at)
            VALUES (?, ?, NULL, NULL, NULL, NULL, NULL, 0, ?, ?)`,
      args: [leadName, source, now, now],
    })
    leadId = Number(info.lastInsertRowid)
    if (phone) {
      await db.execute({ sql: 'INSERT INTO phones (lead_id, number) VALUES (?, ?)', args: [leadId, phone] })
    }
    if (email) {
      await db.execute({ sql: 'INSERT INTO emails (lead_id, email) VALUES (?, ?)', args: [leadId, email] })
    }
    await db.execute({
      sql: 'INSERT INTO stage_history (lead_id, stage_id, changed_at) VALUES (?, NULL, ?)',
      args: [leadId, now],
    })
  }

  let capiStatus = 'skipped'
  let capiReason = 'Not a conversion event'
  if (isConversionEvent(eventName)) {
    const result = await sendToMetaCapi({
      event_id: eventId,
      event_name: eventName,
      created_at: now,
      page_url: body.page_url,
      phone,
      email,
      fbp: clip(body.fbp, 100),
      fbc: clip(body.fbc, 100),
    })
    capiStatus = result.status
    capiReason = result.reason
  }

  try {
    await db.execute({
      sql: `INSERT INTO events (event_id, visitor_id, session_id, event_name, page_url, referrer, utm_source, utm_medium, utm_campaign, device, name, phone, email, fbp, fbc, lead_id, capi_status, capi_reason, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        eventId,
        visitorId,
        sessionId,
        eventName,
        clip(body.page_url, 500),
        clip(body.referrer, 500),
        clip(body.utm_source, 100),
        clip(body.utm_medium, 100),
        clip(body.utm_campaign, 100),
        clip(body.device, 100),
        name,
        phone,
        email,
        clip(body.fbp, 100),
        clip(body.fbc, 100),
        leadId,
        capiStatus,
        capiReason,
        now,
      ],
    })
  } catch (err) {
    if (!/unique/i.test(err.message)) throw err
    // duplicate event_id (retry from the tracker) — ignore, already recorded
  }

  res.status(201).json({ ok: true, lead_id: leadId, capi_status: capiStatus })
})

router.get('/visitor/:visitorId', async (req, res) => {
  const result = await db.execute({
    sql: 'SELECT * FROM events WHERE visitor_id = ? ORDER BY created_at ASC LIMIT 200',
    args: [req.params.visitorId],
  })
  res.json(result.rows)
})

router.get('/dashboard', async (req, res) => {
  const minutes = Number(req.query.minutes) || 60
  const since = new Date(Date.now() - minutes * 60000).toISOString()
  const activeSince = new Date(Date.now() - 5 * 60000).toISOString()
  const todayStart = new Date().toISOString().slice(0, 10) + 'T00:00:00.000Z'

  const [feedResult, sessionsResult, statsResult] = await Promise.all([
    db.execute({
      sql: 'SELECT * FROM events WHERE created_at >= ? ORDER BY created_at DESC LIMIT 40',
      args: [since],
    }),
    db.execute({
      sql: `SELECT
              visitor_id,
              COUNT(*) AS event_count,
              MIN(created_at) AS first_seen,
              MAX(created_at) AS last_seen,
              (SELECT page_url FROM events e2 WHERE e2.visitor_id = e1.visitor_id ORDER BY e2.created_at ASC LIMIT 1) AS entry_page,
              (SELECT device FROM events e3 WHERE e3.visitor_id = e1.visitor_id AND e3.device IS NOT NULL ORDER BY e3.created_at DESC LIMIT 1) AS device,
              (SELECT event_name FROM events e4 WHERE e4.visitor_id = e1.visitor_id ORDER BY e4.created_at DESC LIMIT 1) AS last_event,
              (SELECT lead_id FROM events e5 WHERE e5.visitor_id = e1.visitor_id AND e5.lead_id IS NOT NULL ORDER BY e5.created_at DESC LIMIT 1) AS lead_id
            FROM events e1
            WHERE created_at >= ?
            GROUP BY visitor_id
            ORDER BY last_seen DESC
            LIMIT 30`,
      args: [since],
    }),
    db.execute({
      sql: `SELECT
              (SELECT COUNT(DISTINCT visitor_id) FROM events WHERE created_at >= ?) AS active_now,
              (SELECT COUNT(*) FROM events WHERE event_name = 'lead_submitted' AND created_at >= ?) AS leads_today,
              (SELECT COUNT(*) FROM events WHERE event_name IN ('whatsapp_click','call_click') AND created_at >= ?) AS touchpoints_today,
              (SELECT COUNT(*) FROM events WHERE created_at >= ?) AS events_today`,
      args: [activeSince, todayStart, todayStart, todayStart],
    }),
  ])

  res.json({
    feed: feedResult.rows,
    sessions: sessionsResult.rows,
    stats: statsResult.rows[0],
  })
})

export default router

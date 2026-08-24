import { Router } from 'express'
import db from './db.js'

const router = Router()

const DEFAULT_SOURCES = [
  'Google GMB',
  'BNI',
  'Udemy',
  'Website',
  'Instagram',
  'LinkedIn',
  'ICF',
  'Facebook Group',
  'LinkedIn Group',
  'Boolean - Insta',
  'Boolean - Facebook',
  'Boolean - LinkedIn',
  'Boolean - SERP',
]

function todayParts() {
  const now = new Date()
  const date = now.toISOString().slice(0, 10)
  const time = now.toTimeString().slice(0, 5)
  return { date, time }
}

function logStageChange(leadId, stageId, at) {
  db.prepare('INSERT INTO stage_history (lead_id, stage_id, changed_at) VALUES (?, ?, ?)').run(
    leadId,
    stageId,
    at,
  )
}

function attachPhonesAndLinks(lead) {
  lead.phones = db
    .prepare('SELECT id, number FROM phones WHERE lead_id = ? ORDER BY id')
    .all(lead.id)
    .map((p) => p.number)
  lead.links = db
    .prepare('SELECT id, type, url FROM links WHERE lead_id = ? ORDER BY id')
    .all(lead.id)
  return lead
}

router.get('/', (req, res) => {
  const { search, source, stage_id, followup, date } = req.query
  const { date: today, time: nowTime } = todayParts()

  let sql = 'SELECT DISTINCT leads.* FROM leads LEFT JOIN phones ON phones.lead_id = leads.id WHERE 1=1'
  const params = []

  if (search) {
    sql += ' AND (leads.name LIKE ? OR phones.number LIKE ?)'
    params.push(`%${search}%`, `%${search}%`)
  }
  if (source === 'Other') {
    sql += ` AND leads.source IS NOT NULL AND leads.source NOT IN (${DEFAULT_SOURCES.map(() => '?').join(',')})`
    params.push(...DEFAULT_SOURCES)
  } else if (source) {
    sql += ' AND leads.source = ?'
    params.push(source)
  }
  if (stage_id) {
    sql += ' AND leads.stage_id = ?'
    params.push(stage_id)
  }
  if (date) {
    sql += ' AND leads.reminder_date = ?'
    params.push(date)
  } else if (followup === 'today') {
    sql += ' AND leads.reminder_date = ?'
    params.push(today)
  } else if (followup === 'overdue') {
    sql += ' AND leads.reminder_date IS NOT NULL AND (leads.reminder_date < ? OR (leads.reminder_date = ? AND leads.reminder_time < ?))'
    params.push(today, today, nowTime)
  } else if (followup === 'upcoming') {
    sql += ' AND leads.reminder_date IS NOT NULL AND (leads.reminder_date > ? OR (leads.reminder_date = ? AND leads.reminder_time >= ?))'
    params.push(today, today, nowTime)
  } else if (followup === 'none') {
    sql += ' AND leads.reminder_date IS NULL'
  }

  sql += ' ORDER BY leads.created_at DESC'

  const leads = db.prepare(sql).all(...params)
  res.json(leads.map(attachPhonesAndLinks))
})

router.get('/due/now', (req, res) => {
  const { date: today, time: nowTime } = todayParts()
  const due = db
    .prepare(
      `SELECT * FROM leads WHERE reminder_notified = 0 AND reminder_date IS NOT NULL
       AND (reminder_date < ? OR (reminder_date = ? AND reminder_time <= ?))`,
    )
    .all(today, today, nowTime)
  res.json(due.map(attachPhonesAndLinks))
})

router.get('/stage-distribution/at', (req, res) => {
  const daysAgo = Number(req.query.daysAgo) || 7
  const asOf = new Date(Date.now() - daysAgo * 86400000).toISOString()

  const rows = db
    .prepare(
      `SELECT h.stage_id AS stage_id, COUNT(*) AS count
       FROM stage_history h
       INNER JOIN (
         SELECT lead_id, MAX(changed_at) AS max_changed_at
         FROM stage_history
         WHERE changed_at <= ?
         GROUP BY lead_id
       ) latest ON h.lead_id = latest.lead_id AND h.changed_at = latest.max_changed_at
       GROUP BY h.stage_id`,
    )
    .all(asOf)

  const byStage = {}
  let total = 0
  for (const row of rows) {
    if (row.stage_id !== null) byStage[row.stage_id] = row.count
    total += row.count
  }

  res.json({ asOf, total, byStage })
})

router.get('/:id', (req, res) => {
  const lead = db.prepare('SELECT * FROM leads WHERE id = ?').get(req.params.id)
  if (!lead) return res.status(404).json({ error: 'Lead not found.' })
  res.json(attachPhonesAndLinks(lead))
})

function saveContacts(leadId, phones, links) {
  db.prepare('DELETE FROM phones WHERE lead_id = ?').run(leadId)
  db.prepare('DELETE FROM links WHERE lead_id = ?').run(leadId)
  const insertPhone = db.prepare('INSERT INTO phones (lead_id, number) VALUES (?, ?)')
  const insertLink = db.prepare('INSERT INTO links (lead_id, type, url) VALUES (?, ?, ?)')
  for (const number of phones || []) {
    if (number && number.trim()) insertPhone.run(leadId, number.trim())
  }
  for (const link of links || []) {
    if (link.url && link.url.trim()) insertLink.run(leadId, link.type || 'Other', link.url.trim())
  }
}

router.post('/', (req, res) => {
  const { name, source, stage_id, reminder_date, reminder_time, reminder_note, phones, links } = req.body
  if (!name || !name.trim()) return res.status(400).json({ error: 'Name is required.' })

  const now = new Date().toISOString()
  const info = db
    .prepare(
      `INSERT INTO leads (name, source, stage_id, reminder_date, reminder_time, reminder_note, reminder_notified, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)`,
    )
    .run(name.trim(), source || null, stage_id || null, reminder_date || null, reminder_time || null, reminder_note || null, now, now)

  saveContacts(info.lastInsertRowid, phones, links)
  logStageChange(info.lastInsertRowid, stage_id || null, now)
  const lead = db.prepare('SELECT * FROM leads WHERE id = ?').get(info.lastInsertRowid)
  res.status(201).json(attachPhonesAndLinks(lead))
})

router.put('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM leads WHERE id = ?').get(req.params.id)
  if (!existing) return res.status(404).json({ error: 'Lead not found.' })

  const { name, source, stage_id, reminder_date, reminder_time, reminder_note, phones, links } = req.body
  if (!name || !name.trim()) return res.status(400).json({ error: 'Name is required.' })

  const reminderChanged =
    reminder_date !== existing.reminder_date || reminder_time !== existing.reminder_time
  const notified = reminderChanged ? 0 : existing.reminder_notified
  const newStageId = stage_id || null
  const now = new Date().toISOString()

  db.prepare(
    `UPDATE leads SET name = ?, source = ?, stage_id = ?, reminder_date = ?, reminder_time = ?, reminder_note = ?, reminder_notified = ?, updated_at = ?
     WHERE id = ?`,
  ).run(
    name.trim(),
    source || null,
    newStageId,
    reminder_date || null,
    reminder_time || null,
    reminder_note || null,
    notified,
    now,
    req.params.id,
  )

  if (newStageId !== existing.stage_id) {
    logStageChange(req.params.id, newStageId, now)
  }

  saveContacts(req.params.id, phones, links)
  const lead = db.prepare('SELECT * FROM leads WHERE id = ?').get(req.params.id)
  res.json(attachPhonesAndLinks(lead))
})

router.post('/:id/notified', (req, res) => {
  db.prepare('UPDATE leads SET reminder_notified = 1 WHERE id = ?').run(req.params.id)
  res.status(204).end()
})

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM leads WHERE id = ?').run(req.params.id)
  res.status(204).end()
})

export default router

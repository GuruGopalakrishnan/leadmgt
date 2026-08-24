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

async function logStageChange(executor, leadId, stageId, at) {
  await executor.execute({
    sql: 'INSERT INTO stage_history (lead_id, stage_id, changed_at) VALUES (?, ?, ?)',
    args: [leadId, stageId, at],
  })
}

async function attachContacts(lead) {
  const phones = await db.execute({ sql: 'SELECT id, number FROM phones WHERE lead_id = ? ORDER BY id', args: [lead.id] })
  const emails = await db.execute({ sql: 'SELECT id, email FROM emails WHERE lead_id = ? ORDER BY id', args: [lead.id] })
  const links = await db.execute({ sql: 'SELECT id, type, url FROM links WHERE lead_id = ? ORDER BY id', args: [lead.id] })
  lead.phones = phones.rows.map((p) => p.number)
  lead.emails = emails.rows.map((e) => e.email)
  lead.links = links.rows
  return lead
}

router.get('/', async (req, res) => {
  const { search, source, stage_id, followup, date } = req.query
  const { date: today, time: nowTime } = todayParts()

  let sql = `SELECT DISTINCT leads.* FROM leads
    LEFT JOIN phones ON phones.lead_id = leads.id
    LEFT JOIN emails ON emails.lead_id = leads.id
    WHERE 1=1`
  const params = []

  if (search) {
    sql += ' AND (leads.name LIKE ? OR phones.number LIKE ? OR emails.email LIKE ?)'
    params.push(`%${search}%`, `%${search}%`, `%${search}%`)
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

  const leads = (await db.execute({ sql, args: params })).rows
  res.json(await Promise.all(leads.map(attachContacts)))
})

router.get('/due/now', async (req, res) => {
  const { date: today, time: nowTime } = todayParts()
  const due = (
    await db.execute({
      sql: `SELECT * FROM leads WHERE reminder_notified = 0 AND reminder_date IS NOT NULL
            AND (reminder_date < ? OR (reminder_date = ? AND reminder_time <= ?))`,
      args: [today, today, nowTime],
    })
  ).rows
  res.json(await Promise.all(due.map(attachContacts)))
})

router.get('/stage-distribution/at', async (req, res) => {
  const daysAgo = Number(req.query.daysAgo) || 7
  const asOf = new Date(Date.now() - daysAgo * 86400000).toISOString()

  const rows = (
    await db.execute({
      sql: `SELECT h.stage_id AS stage_id, COUNT(*) AS count
            FROM stage_history h
            INNER JOIN (
              SELECT lead_id, MAX(changed_at) AS max_changed_at
              FROM stage_history
              WHERE changed_at <= ?
              GROUP BY lead_id
            ) latest ON h.lead_id = latest.lead_id AND h.changed_at = latest.max_changed_at
            GROUP BY h.stage_id`,
      args: [asOf],
    })
  ).rows

  const byStage = {}
  let total = 0
  for (const row of rows) {
    if (row.stage_id !== null) byStage[row.stage_id] = row.count
    total += row.count
  }

  res.json({ asOf, total, byStage })
})

router.get('/:id', async (req, res) => {
  const result = await db.execute({ sql: 'SELECT * FROM leads WHERE id = ?', args: [req.params.id] })
  const lead = result.rows[0]
  if (!lead) return res.status(404).json({ error: 'Lead not found.' })
  res.json(await attachContacts(lead))
})

async function saveContacts(executor, leadId, phones, emails, links) {
  await executor.execute({ sql: 'DELETE FROM phones WHERE lead_id = ?', args: [leadId] })
  await executor.execute({ sql: 'DELETE FROM emails WHERE lead_id = ?', args: [leadId] })
  await executor.execute({ sql: 'DELETE FROM links WHERE lead_id = ?', args: [leadId] })
  for (const number of phones || []) {
    if (number && number.trim()) {
      await executor.execute({ sql: 'INSERT INTO phones (lead_id, number) VALUES (?, ?)', args: [leadId, number.trim()] })
    }
  }
  for (const email of emails || []) {
    if (email && email.trim()) {
      await executor.execute({ sql: 'INSERT INTO emails (lead_id, email) VALUES (?, ?)', args: [leadId, email.trim()] })
    }
  }
  for (const link of links || []) {
    if (link.url && link.url.trim()) {
      await executor.execute({
        sql: 'INSERT INTO links (lead_id, type, url) VALUES (?, ?, ?)',
        args: [leadId, link.type || 'Other', link.url.trim()],
      })
    }
  }
}

router.post('/', async (req, res) => {
  const { name, source, niche, stage_id, reminder_date, reminder_time, reminder_note, phones, emails, links } = req.body
  if (!name || !name.trim()) return res.status(400).json({ error: 'Name is required.' })

  const now = new Date().toISOString()
  const info = await db.execute({
    sql: `INSERT INTO leads (name, source, niche, stage_id, reminder_date, reminder_time, reminder_note, reminder_notified, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`,
    args: [
      name.trim(),
      source || null,
      niche || null,
      stage_id || null,
      reminder_date || null,
      reminder_time || null,
      reminder_note || null,
      now,
      now,
    ],
  })
  const leadId = Number(info.lastInsertRowid)

  await saveContacts(db, leadId, phones, emails, links)
  await logStageChange(db, leadId, stage_id || null, now)
  const created = (await db.execute({ sql: 'SELECT * FROM leads WHERE id = ?', args: [leadId] })).rows[0]
  res.status(201).json(await attachContacts(created))
})

router.post('/import', async (req, res) => {
  const { rows } = req.body
  if (!Array.isArray(rows)) return res.status(400).json({ error: 'rows must be an array.' })

  let created = 0
  const errors = []
  const tx = await db.transaction('write')
  try {
    for (let i = 0; i < rows.length; i++) {
      const entry = rows[i]
      const name = (entry.name || '').trim()
      if (!name) {
        errors.push({ row: i + 1, message: 'Missing name.' })
        continue
      }
      const now = new Date().toISOString()
      const info = await tx.execute({
        sql: `INSERT INTO leads (name, source, niche, stage_id, reminder_date, reminder_time, reminder_note, reminder_notified, created_at, updated_at)
              VALUES (?, ?, ?, NULL, NULL, NULL, NULL, 0, ?, ?)`,
        args: [name, entry.source || null, entry.niche || null, now, now],
      })
      const leadId = Number(info.lastInsertRowid)
      await saveContacts(tx, leadId, entry.phones, entry.emails, entry.links)
      await logStageChange(tx, leadId, null, now)
      created += 1
    }
    await tx.commit()
  } catch (err) {
    await tx.rollback()
    throw err
  } finally {
    tx.close()
  }

  res.status(201).json({ created, errors })
})

router.put('/:id', async (req, res) => {
  const existing = (await db.execute({ sql: 'SELECT * FROM leads WHERE id = ?', args: [req.params.id] })).rows[0]
  if (!existing) return res.status(404).json({ error: 'Lead not found.' })

  const { name, source, niche, stage_id, reminder_date, reminder_time, reminder_note, phones, emails, links } = req.body
  if (!name || !name.trim()) return res.status(400).json({ error: 'Name is required.' })

  const reminderChanged =
    reminder_date !== existing.reminder_date || reminder_time !== existing.reminder_time
  const notified = reminderChanged ? 0 : existing.reminder_notified
  const newStageId = stage_id || null
  const now = new Date().toISOString()

  await db.execute({
    sql: `UPDATE leads SET name = ?, source = ?, niche = ?, stage_id = ?, reminder_date = ?, reminder_time = ?, reminder_note = ?, reminder_notified = ?, updated_at = ?
          WHERE id = ?`,
    args: [
      name.trim(),
      source || null,
      niche || null,
      newStageId,
      reminder_date || null,
      reminder_time || null,
      reminder_note || null,
      notified,
      now,
      req.params.id,
    ],
  })

  if (newStageId !== existing.stage_id) {
    await logStageChange(db, req.params.id, newStageId, now)
  }

  await saveContacts(db, req.params.id, phones, emails, links)
  const updated = (await db.execute({ sql: 'SELECT * FROM leads WHERE id = ?', args: [req.params.id] })).rows[0]
  res.json(await attachContacts(updated))
})

router.post('/:id/notified', async (req, res) => {
  await db.execute({ sql: 'UPDATE leads SET reminder_notified = 1 WHERE id = ?', args: [req.params.id] })
  res.status(204).end()
})

router.delete('/:id', async (req, res) => {
  await db.execute({ sql: 'DELETE FROM leads WHERE id = ?', args: [req.params.id] })
  res.status(204).end()
})

export default router

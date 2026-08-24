import { Router } from 'express'
import db from './db.js'

const router = Router()

router.get('/', (req, res) => {
  const stages = db.prepare('SELECT * FROM stages ORDER BY position').all()
  res.json(stages)
})

router.post('/', (req, res) => {
  const { name } = req.body
  if (!name || !name.trim()) return res.status(400).json({ error: 'Name is required.' })
  const maxPos = db.prepare('SELECT COALESCE(MAX(position), -1) AS m FROM stages').get().m
  try {
    const info = db
      .prepare('INSERT INTO stages (name, position) VALUES (?, ?)')
      .run(name.trim(), maxPos + 1)
    res.status(201).json(db.prepare('SELECT * FROM stages WHERE id = ?').get(info.lastInsertRowid))
  } catch {
    res.status(400).json({ error: 'A stage with that name already exists.' })
  }
})

router.put('/:id', (req, res) => {
  const { name } = req.body
  if (!name || !name.trim()) return res.status(400).json({ error: 'Name is required.' })
  try {
    db.prepare('UPDATE stages SET name = ? WHERE id = ?').run(name.trim(), req.params.id)
    res.json(db.prepare('SELECT * FROM stages WHERE id = ?').get(req.params.id))
  } catch {
    res.status(400).json({ error: 'A stage with that name already exists.' })
  }
})

router.put('/reorder', (req, res) => {
  const { order } = req.body
  if (!Array.isArray(order)) return res.status(400).json({ error: 'order must be an array of stage ids.' })
  const update = db.prepare('UPDATE stages SET position = ? WHERE id = ?')
  const run = db.transaction((ids) => {
    ids.forEach((id, i) => update.run(i, id))
  })
  run(order)
  res.json(db.prepare('SELECT * FROM stages ORDER BY position').all())
})

router.delete('/:id', (req, res) => {
  const inUse = db.prepare('SELECT COUNT(*) AS n FROM leads WHERE stage_id = ?').get(req.params.id).n
  if (inUse > 0) {
    return res.status(400).json({ error: `${inUse} lead(s) are using this stage. Reassign them first.` })
  }
  db.prepare('DELETE FROM stages WHERE id = ?').run(req.params.id)
  res.status(204).end()
})

export default router

import { Router } from 'express'
import db from './db.js'

const router = Router()

router.get('/', async (req, res) => {
  const result = await db.execute('SELECT * FROM stages ORDER BY position')
  res.json(result.rows)
})

router.post('/', async (req, res) => {
  const { name } = req.body
  if (!name || !name.trim()) return res.status(400).json({ error: 'Name is required.' })
  const maxPos = (await db.execute('SELECT COALESCE(MAX(position), -1) AS m FROM stages')).rows[0].m
  try {
    const info = await db.execute({
      sql: 'INSERT INTO stages (name, position) VALUES (?, ?)',
      args: [name.trim(), maxPos + 1],
    })
    const created = await db.execute({
      sql: 'SELECT * FROM stages WHERE id = ?',
      args: [Number(info.lastInsertRowid)],
    })
    res.status(201).json(created.rows[0])
  } catch {
    res.status(400).json({ error: 'A stage with that name already exists.' })
  }
})

router.put('/reorder', async (req, res) => {
  const { order } = req.body
  if (!Array.isArray(order)) return res.status(400).json({ error: 'order must be an array of stage ids.' })
  await db.batch(
    order.map((id, i) => ({ sql: 'UPDATE stages SET position = ? WHERE id = ?', args: [i, id] })),
    'write',
  )
  const result = await db.execute('SELECT * FROM stages ORDER BY position')
  res.json(result.rows)
})

router.put('/:id', async (req, res) => {
  const { name } = req.body
  if (!name || !name.trim()) return res.status(400).json({ error: 'Name is required.' })
  try {
    await db.execute({ sql: 'UPDATE stages SET name = ? WHERE id = ?', args: [name.trim(), req.params.id] })
    const updated = await db.execute({ sql: 'SELECT * FROM stages WHERE id = ?', args: [req.params.id] })
    res.json(updated.rows[0])
  } catch {
    res.status(400).json({ error: 'A stage with that name already exists.' })
  }
})

router.delete('/:id', async (req, res) => {
  const inUse = (
    await db.execute({ sql: 'SELECT COUNT(*) AS n FROM leads WHERE stage_id = ?', args: [req.params.id] })
  ).rows[0].n
  if (inUse > 0) {
    return res.status(400).json({ error: `${inUse} lead(s) are using this stage. Reassign them first.` })
  }
  await db.execute({ sql: 'DELETE FROM stages WHERE id = ?', args: [req.params.id] })
  res.status(204).end()
})

export default router

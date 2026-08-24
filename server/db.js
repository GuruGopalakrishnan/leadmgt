import { createClient } from '@libsql/client'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const url = process.env.TURSO_DATABASE_URL || `file:${path.join(__dirname, 'leadmgt.db')}`
const authToken = process.env.TURSO_AUTH_TOKEN

const db = createClient(authToken ? { url, authToken } : { url })

await db.execute('PRAGMA foreign_keys = ON')

await db.executeMultiple(`
  CREATE TABLE IF NOT EXISTS stages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    position INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    source TEXT,
    stage_id INTEGER REFERENCES stages(id) ON DELETE SET NULL,
    reminder_date TEXT,
    reminder_time TEXT,
    reminder_note TEXT,
    reminder_notified INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS phones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lead_id INTEGER NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    number TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lead_id INTEGER NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    url TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS stage_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lead_id INTEGER NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    stage_id INTEGER REFERENCES stages(id) ON DELETE SET NULL,
    changed_at TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_stage_history_lead ON stage_history(lead_id, changed_at);
`)

const stageCount = (await db.execute('SELECT COUNT(*) AS n FROM stages')).rows[0].n
if (stageCount === 0) {
  const defaults = ['First Message Sent', 'Follow-up', 'Interested', 'Meeting', 'Won', 'Lost']
  await db.batch(
    defaults.map((name, i) => ({
      sql: 'INSERT INTO stages (name, position) VALUES (?, ?)',
      args: [name, i],
    })),
    'write',
  )
}

export default db

import { createClient } from '@libsql/client'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

function localFileUrl() {
  // import.meta.url doesn't survive bundling to CommonJS (as this file is,
  // for the Netlify Function build) — fall back to a cwd-relative path in
  // that case. Production always sets TURSO_DATABASE_URL, so this only
  // matters for local dev, where import.meta.url works fine.
  try {
    const dir = path.dirname(fileURLToPath(import.meta.url))
    return `file:${path.join(dir, 'leadmgt.db')}`
  } catch {
    return 'file:leadmgt.db'
  }
}

const url = process.env.TURSO_DATABASE_URL || localFileUrl()
const authToken = process.env.TURSO_AUTH_TOKEN

const db = createClient(authToken ? { url, authToken } : { url })

let readyPromise = null

export function ready() {
  if (!readyPromise) {
    readyPromise = init()
  }
  return readyPromise
}

async function init() {
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

    CREATE TABLE IF NOT EXISTS emails (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lead_id INTEGER NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
      email TEXT NOT NULL
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

    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id TEXT NOT NULL UNIQUE,
      visitor_id TEXT NOT NULL,
      session_id TEXT NOT NULL,
      event_name TEXT NOT NULL,
      page_url TEXT,
      referrer TEXT,
      utm_source TEXT,
      utm_medium TEXT,
      utm_campaign TEXT,
      device TEXT,
      name TEXT,
      phone TEXT,
      email TEXT,
      fbp TEXT,
      fbc TEXT,
      lead_id INTEGER REFERENCES leads(id) ON DELETE SET NULL,
      capi_status TEXT,
      capi_reason TEXT,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_events_created ON events(created_at);
    CREATE INDEX IF NOT EXISTS idx_events_visitor ON events(visitor_id, created_at);
  `)

  try {
    await db.execute('ALTER TABLE leads ADD COLUMN niche TEXT')
  } catch (err) {
    if (!/duplicate column/i.test(err.message)) throw err
  }

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
}

export default db

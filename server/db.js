import Database from 'better-sqlite3'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const db = new Database(path.join(__dirname, 'leadmgt.db'))

db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

db.exec(`
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
`)

const stageCount = db.prepare('SELECT COUNT(*) AS n FROM stages').get().n
if (stageCount === 0) {
  const insertStage = db.prepare('INSERT INTO stages (name, position) VALUES (?, ?)')
  const defaults = ['First Message Sent', 'Follow-up', 'Interested', 'Meeting', 'Won', 'Lost']
  const insertMany = db.transaction((names) => {
    names.forEach((name, i) => insertStage.run(name, i))
  })
  insertMany(defaults)
}

export default db

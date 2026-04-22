import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'database.sqlite');
const db = new Database(dbPath);

// Enable WAL mode for better concurrent performance
db.pragma('journal_mode = WAL');

// Initialize database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    gender TEXT NOT NULL DEFAULT '',
    region TEXT NOT NULL DEFAULT '',
    birth_date TEXT NOT NULL DEFAULT '',
    whatsapp TEXT NOT NULL DEFAULT '',
    profession TEXT NOT NULL DEFAULT '',
    contact_status TEXT NOT NULL DEFAULT 'Pendente',
    last_contact_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Migration: Add gender column if it doesn't exist
  PRAGMA table_info(users);
`);

// Check if gender column exists, if not add it
const tableInfo = db.prepare("PRAGMA table_info(users)").all();
const hasGender = tableInfo.some(col => col.name === 'gender');
if (!hasGender) {
  try {
    db.exec("ALTER TABLE users ADD COLUMN gender TEXT NOT NULL DEFAULT ''");
    console.log('[DB] Migration: Added gender column to users table');
  } catch (err) {
    console.error('[DB] Error during migration (gender):', err);
  }
}

const hasContactStatus = tableInfo.some(col => col.name === 'contact_status');
if (!hasContactStatus) {
  try {
    db.exec("ALTER TABLE users ADD COLUMN contact_status TEXT NOT NULL DEFAULT 'Pendente'");
    db.exec("ALTER TABLE users ADD COLUMN last_contact_at DATETIME");
    console.log('[DB] Migration: Added contact status columns to users table');
  } catch (err) {
    console.error('[DB] Error during migration (contact_status):', err);
  }
}

db.exec(`
  CREATE TABLE IF NOT EXISTS incomes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_email TEXT NOT NULL,
    description TEXT NOT NULL,
    amount REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_email TEXT NOT NULL,
    description TEXT NOT NULL,
    amount REAL NOT NULL,
    category TEXT NOT NULL DEFAULT 'outros',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS behavioral_answers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_email TEXT UNIQUE NOT NULL,
    answers TEXT NOT NULL DEFAULT '{}',
    total_score INTEGER NOT NULL DEFAULT 0,
    total_percentage INTEGER NOT NULL DEFAULT 0,
    level TEXT NOT NULL DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS custom_buttons (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    config TEXT NOT NULL DEFAULT '{}'
  );

  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS interactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_email TEXT,
    action TEXT NOT NULL,
    created_at DATETIME DEFAULT (datetime('now', 'localtime'))
  );

  -- Seed default custom buttons config
  INSERT OR IGNORE INTO custom_buttons (id, config) VALUES (1, '{"negative":{"visible":false,"label":"","url":"","message":""},"neutral":{"visible":false,"label":"","url":"","message":""},"positive":{"visible":false,"label":"","url":"","message":""}}');
`);

// Seed master admin
const masterEmail = 'exdevedor@exdevedor.com.br';
const masterPassword = 'Gr@nd34rtun@';
const hash = crypto.createHash('sha256').update(masterPassword).digest('hex');
db.prepare('INSERT OR IGNORE INTO admins (email, password_hash) VALUES (?, ?)').run(masterEmail, hash);

console.log(`[DB] SQLite database initialized at ${dbPath}`);

export default db;

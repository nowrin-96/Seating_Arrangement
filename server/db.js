const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, '..', 'database');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'bench_rotation.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS config (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS admin (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS benches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      column TEXT NOT NULL DEFAULT 'C1',
      gender TEXT CHECK(gender IN ('female', 'male')) NOT NULL,
      capacity INTEGER NOT NULL DEFAULT 2,
      position INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      full_name TEXT NOT NULL,
      roll_number TEXT UNIQUE NOT NULL,
      gender TEXT CHECK(gender IN ('female', 'male')) NOT NULL,
      bench_id INTEGER NOT NULL,
      FOREIGN KEY (bench_id) REFERENCES benches(id) ON DELETE CASCADE
    );
  `);

  try {
    db.exec("ALTER TABLE benches ADD COLUMN column TEXT DEFAULT 'C1'");
  } catch (e) {}
  try {
    db.exec("UPDATE benches SET column = SUBSTR(name, 1, 2) WHERE column IS NULL OR column = 'C1'");
  } catch (e) {}
}

initDb();

module.exports = db;

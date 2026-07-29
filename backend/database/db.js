import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '../data');
const dbPath  = path.join(dataDir, 'tracker.db');

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

let _db = null;

function getDb() {
  if (!_db) {
    _db = new sqlite3.Database(dbPath);
    _db.run('PRAGMA journal_mode = WAL');
    _db.run('PRAGMA foreign_keys = ON');
  }
  return _db;
}

export async function initDatabase() {
  const db = getDb();
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Products to monitor
      db.run(`
        CREATE TABLE IF NOT EXISTS products (
          id          INTEGER PRIMARY KEY AUTOINCREMENT,
          url         TEXT    NOT NULL UNIQUE,
          label       TEXT,                      -- user-supplied name
          platform    TEXT    NOT NULL,           -- blinkit | zepto | swiggy | bigbasket | unknown
          enabled     INTEGER DEFAULT 1,
          added_at    DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Every availability check result
      db.run(`
        CREATE TABLE IF NOT EXISTS check_log (
          id          INTEGER PRIMARY KEY AUTOINCREMENT,
          product_id  INTEGER NOT NULL,
          available   INTEGER NOT NULL,          -- 1 = in stock, 0 = out of stock
          status_text TEXT,                      -- e.g. "Add to cart", "Out of stock", "Not found"
          checked_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
        )
      `, (err) => {
        if (err) { reject(err); return; }
        console.log('✅ Database ready');
        resolve();
      });
    });
  });
}

export function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    getDb().run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

export function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    getDb().get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row ?? null);
    });
  });
}

export function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    getDb().all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

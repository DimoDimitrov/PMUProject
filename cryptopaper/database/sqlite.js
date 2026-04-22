import * as SQLite from "expo-sqlite";

const DATABASE_NAME = "cryptopaper.db";

let dbPromise;

function getDb() {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync(DATABASE_NAME);
  }

  return dbPromise;
}

export async function initializeDatabase() {
  const db = await getDb();

  await db.execAsync("PRAGMA foreign_keys = ON;");
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      role TEXT NOT NULL DEFAULT 'customer',
      funds_usd REAL NOT NULL DEFAULT 0,
      email TEXT NOT NULL UNIQUE,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      profile_picture TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS portfolios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      crypto_title TEXT NOT NULL,
      price REAL NOT NULL,
      quantity REAL NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_portfolios_user_id
    ON portfolios(user_id);
  `);
}

export async function getDatabase() {
  return getDb();
}

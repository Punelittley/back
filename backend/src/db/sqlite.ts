import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_PATH = process.env.SQLITE_PATH ?? path.join(process.cwd(), "data", "clinic.db");

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    throw new Error("Database not initialized. Call initDb() first.");
  }
  return db;
}

export function initDb(): Database.Database {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  db = new Database(DB_PATH);

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      passwordHash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'patient',
      fullName TEXT NOT NULL,
      birthDate TEXT,
      phone TEXT,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS session_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL REFERENCES users(id),
      tokenEncrypted TEXT NOT NULL,
      tokenHash TEXT NOT NULL,
      userAgent TEXT,
      ip TEXT,
      expiresAt TEXT NOT NULL,
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_session_token_hash ON session_tokens(tokenHash);
    CREATE INDEX IF NOT EXISTS idx_session_expires ON session_tokens(expiresAt);

    CREATE TABLE IF NOT EXISTS news (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      imageUrl TEXT,
      publishedAt TEXT NOT NULL DEFAULT (datetime('now')),
      isFeatured INTEGER NOT NULL DEFAULT 0,
      priority INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      price REAL NOT NULL,
      durationMinutes INTEGER NOT NULL,
      category TEXT,
      isActive INTEGER NOT NULL DEFAULT 1,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS analyses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patientId INTEGER NOT NULL REFERENCES users(id),
      type TEXT NOT NULL,
      date TEXT NOT NULL,
      resultSummary TEXT NOT NULL,
      resultFileUrl TEXT,
      doctorNotes TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patientId INTEGER NOT NULL REFERENCES users(id),
      serviceId INTEGER NOT NULL REFERENCES services(id),
      doctorId INTEGER REFERENCES users(id),
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'scheduled',
      comment TEXT,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  console.log("SQLite: база данных готова (" + DB_PATH + ")");
  return db;
}

export function toId(row: { id: number }): string {
  return String(row.id);
}

export function rowToUser(row: Record<string, unknown>): { _id: string; id: string; email: string; fullName: string; role: string; passwordHash?: string; phone?: string | null } {
  const id = String(row.id);
  return {
    _id: id,
    id,
    email: String(row.email),
    fullName: String(row.fullName),
    role: String(row.role),
    ...(row.passwordHash != null && { passwordHash: String(row.passwordHash) }),
    ...(row.phone !== undefined && { phone: row.phone != null ? String(row.phone) : null }),
  };
}

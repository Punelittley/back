import { getDb, rowToUser } from "./sqlite";

export function findUserById(id: number | string) {
  const db = getDb();
  const row = db.prepare("SELECT id, email, passwordHash, role, fullName, birthDate, phone, createdAt, updatedAt FROM users WHERE id = ?").get(Number(id));
  return row ? rowToUser(row as Record<string, unknown>) : null;
}

export function findUserByEmail(email: string) {
  const db = getDb();
  const row = db.prepare("SELECT id, email, passwordHash, role, fullName, birthDate, phone, createdAt, updatedAt FROM users WHERE email = ?").get(email.toLowerCase());
  return row ? rowToUser(row as Record<string, unknown>) : null;
}

export function countUsersByRole(role: string): number {
  const db = getDb();
  const r = db.prepare("SELECT COUNT(*) as c FROM users WHERE role = ?").get(role) as { c: number };
  return r.c;
}

export function createUser(data: {
  email: string;
  passwordHash: string;
  fullName: string;
  role?: string;
  birthDate?: string | null;
  phone?: string | null;
}) {
  const db = getDb();
  const stmt = db.prepare(
    "INSERT INTO users (email, passwordHash, role, fullName, birthDate, phone) VALUES (?, ?, ?, ?, ?, ?)"
  );
  const result = stmt.run(
    data.email.toLowerCase(),
    data.passwordHash,
    data.role ?? "patient",
    data.fullName,
    data.birthDate ?? null,
    data.phone ?? null
  );
  return findUserById(result.lastInsertRowid as number)!;
}

export function listUsers() {
  const db = getDb();
  const rows = db.prepare("SELECT id, email, fullName, role, phone, createdAt FROM users ORDER BY createdAt DESC").all() as Record<string, unknown>[];
  return rows.map((r) => ({
    _id: String(r.id),
    id: String(r.id),
    email: r.email,
    fullName: r.fullName,
    role: r.role,
    phone: r.phone,
    createdAt: r.createdAt,
  }));
}

export function listDoctors() {
  const db = getDb();
  const rows = db.prepare("SELECT id, email, fullName, role, phone, createdAt FROM users WHERE role = 'doctor' ORDER BY fullName ASC").all() as Record<string, unknown>[];
  return rows.map((r) => ({
    _id: String(r.id),
    id: String(r.id),
    email: r.email,
    fullName: r.fullName,
    role: r.role,
    phone: r.phone,
    createdAt: r.createdAt,
  }));
}

export function updateUserEmail(userId: number | string, newEmail: string): void {
  const db = getDb();
  db.prepare("UPDATE users SET email = ?, updatedAt = datetime('now') WHERE id = ?").run(newEmail.toLowerCase(), Number(userId));
}

export function updateUserProfile(
  userId: number | string,
  data: { fullName?: string; phone?: string | null }
): void {
  const db = getDb();
  const id = Number(userId);
  if (data.fullName != null) {
    db.prepare("UPDATE users SET fullName = ?, updatedAt = datetime('now') WHERE id = ?").run(data.fullName, id);
  }
  if (data.phone !== undefined) {
    db.prepare("UPDATE users SET phone = ?, updatedAt = datetime('now') WHERE id = ?").run(data.phone ?? null, id);
  }
}

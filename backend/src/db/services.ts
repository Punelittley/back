import { getDb } from "./sqlite";

function rowToService(row: Record<string, unknown>) {
  return {
    _id: String(row.id),
    name: String(row.name),
    description: String(row.description),
    price: Number(row.price),
    durationMinutes: Number(row.durationMinutes),
    category: row.category != null ? String(row.category) : undefined,
    isActive: Boolean((row as { isActive: number }).isActive),
    createdAt: String(row.createdAt),
    updatedAt: String(row.updatedAt),
  };
}

export function findServices(activeOnly: boolean = true) {
  const db = getDb();
  const sql = activeOnly
    ? "SELECT * FROM services WHERE isActive = 1 ORDER BY category, name"
    : "SELECT * FROM services ORDER BY category, name";
  const rows = db.prepare(sql).all() as Record<string, unknown>[];
  return rows.map(rowToService);
}

export function createService(data: {
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
  category?: string | null;
  isActive?: boolean;
}) {
  const db = getDb();
  const stmt = db.prepare(
    "INSERT INTO services (name, description, price, durationMinutes, category, isActive) VALUES (?, ?, ?, ?, ?, ?)"
  );
  const result = stmt.run(
    data.name,
    data.description,
    data.price,
    data.durationMinutes,
    data.category ?? null,
    data.isActive !== false ? 1 : 0
  );
  const row = db.prepare("SELECT * FROM services WHERE id = ?").get(result.lastInsertRowid) as Record<string, unknown>;
  return rowToService(row);
}

export function findServiceById(id: string) {
  const db = getDb();
  const row = db.prepare("SELECT * FROM services WHERE id = ?").get(Number(id)) as Record<string, unknown> | undefined;
  return row ? rowToService(row) : null;
}

export function updateService(id: string, data: Partial<{
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
  category: string;
  isActive: boolean;
}>) {
  const db = getDb();
  const fields: string[] = [];
  const values: unknown[] = [];
  if (data.name != null) { fields.push("name = ?"); values.push(data.name); }
  if (data.description != null) { fields.push("description = ?"); values.push(data.description); }
  if (data.price != null) { fields.push("price = ?"); values.push(data.price); }
  if (data.durationMinutes != null) { fields.push("durationMinutes = ?"); values.push(data.durationMinutes); }
  if (data.category !== undefined) { fields.push("category = ?"); values.push(data.category); }
  if (data.isActive !== undefined) { fields.push("isActive = ?"); values.push(data.isActive ? 1 : 0); }
  if (fields.length === 0) return findServiceById(id);
  fields.push("updatedAt = datetime('now')");
  values.push(Number(id));
  db.prepare("UPDATE services SET " + fields.join(", ") + " WHERE id = ?").run(...values);
  return findServiceById(id);
}

export function deleteService(id: string): boolean {
  const db = getDb();
  const result = db.prepare("DELETE FROM services WHERE id = ?").run(Number(id));
  return result.changes > 0;
}

export function countServices(): number {
  const db = getDb();
  const r = db.prepare("SELECT COUNT(*) as c FROM services").get() as { c: number };
  return r.c;
}

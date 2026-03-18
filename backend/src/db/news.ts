import { getDb } from "./sqlite";

function rowToNews(row: Record<string, unknown>) {
  return {
    _id: String(row.id),
    title: String(row.title),
    content: String(row.content),
    imageUrl: row.imageUrl != null ? String(row.imageUrl) : undefined,
    publishedAt: String(row.publishedAt),
    isFeatured: Boolean((row as { isFeatured: number }).isFeatured),
    priority: Number(row.priority),
    createdAt: String(row.createdAt),
    updatedAt: String(row.updatedAt),
  };
}

export function findNews() {
  const db = getDb();
  const rows = db.prepare("SELECT * FROM news ORDER BY priority DESC, publishedAt DESC").all() as Record<string, unknown>[];
  return rows.map(rowToNews);
}

export function createNews(data: {
  title: string;
  content: string;
  imageUrl?: string | null;
  publishedAt?: string | null;
  isFeatured?: boolean;
  priority?: number;
}) {
  const db = getDb();
  const stmt = db.prepare(
    "INSERT INTO news (title, content, imageUrl, publishedAt, isFeatured, priority) VALUES (?, ?, ?, ?, ?, ?)"
  );
  const result = stmt.run(
    data.title,
    data.content,
    data.imageUrl ?? null,
    data.publishedAt ?? new Date().toISOString(),
    data.isFeatured ? 1 : 0,
    data.priority ?? 0
  );
  const row = db.prepare("SELECT * FROM news WHERE id = ?").get(result.lastInsertRowid) as Record<string, unknown>;
  return rowToNews(row);
}

export function findNewsById(id: string) {
  const db = getDb();
  const row = db.prepare("SELECT * FROM news WHERE id = ?").get(Number(id)) as Record<string, unknown> | undefined;
  return row ? rowToNews(row) : null;
}

export function updateNews(id: string, data: Partial<{
  title: string;
  content: string;
  imageUrl: string;
  publishedAt: string;
  isFeatured: boolean;
  priority: number;
}>) {
  const db = getDb();
  const fields: string[] = [];
  const values: unknown[] = [];
  if (data.title != null) { fields.push("title = ?"); values.push(data.title); }
  if (data.content != null) { fields.push("content = ?"); values.push(data.content); }
  if (data.imageUrl !== undefined) { fields.push("imageUrl = ?"); values.push(data.imageUrl); }
  if (data.publishedAt != null) { fields.push("publishedAt = ?"); values.push(data.publishedAt); }
  if (data.isFeatured !== undefined) { fields.push("isFeatured = ?"); values.push(data.isFeatured ? 1 : 0); }
  if (data.priority !== undefined) { fields.push("priority = ?"); values.push(data.priority); }
  if (fields.length === 0) return findNewsById(id);
  fields.push("updatedAt = datetime('now')");
  values.push(Number(id));
  db.prepare("UPDATE news SET " + fields.join(", ") + " WHERE id = ?").run(...values);
  return findNewsById(id);
}

export function deleteNews(id: string): boolean {
  const db = getDb();
  const result = db.prepare("DELETE FROM news WHERE id = ?").run(Number(id));
  return result.changes > 0;
}

export function countNews(): number {
  const db = getDb();
  const r = db.prepare("SELECT COUNT(*) as c FROM news").get() as { c: number };
  return r.c;
}

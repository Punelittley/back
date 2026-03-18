import { getDb, toId } from "./sqlite";

function rowToAnalysis(row: Record<string, unknown>) {
  return {
    _id: String(row.id),
    patientId: String(row.patientId),
    type: String(row.type),
    date: String(row.date),
    resultSummary: String(row.resultSummary),
    resultFileUrl: row.resultFileUrl != null ? String(row.resultFileUrl) : undefined,
    doctorNotes: row.doctorNotes != null ? String(row.doctorNotes) : undefined,
    status: String(row.status),
    createdAt: String(row.createdAt),
    updatedAt: String(row.updatedAt),
  };
}

export function findAnalyses(filter: { patientId?: string }) {
  const db = getDb();
  let sql = "SELECT * FROM analyses";
  const params: (string | number)[] = [];
  if (filter.patientId != null) {
    sql += " WHERE patientId = ?";
    params.push(Number(filter.patientId));
  }
  sql += " ORDER BY date DESC";
  const rows = (params.length ? db.prepare(sql).all(...params) : db.prepare(sql).all()) as Record<string, unknown>[];
  return rows.map(rowToAnalysis);
}

export function createAnalysis(data: {
  patientId: string;
  type: string;
  date: string;
  resultSummary: string;
  resultFileUrl?: string | null;
  doctorNotes?: string | null;
  status?: string;
}) {
  const db = getDb();
  const stmt = db.prepare(
    "INSERT INTO analyses (patientId, type, date, resultSummary, resultFileUrl, doctorNotes, status) VALUES (?, ?, ?, ?, ?, ?, ?)"
  );
  const result = stmt.run(
    Number(data.patientId),
    data.type,
    data.date,
    data.resultSummary,
    data.resultFileUrl ?? null,
    data.doctorNotes ?? null,
    data.status ?? "pending"
  );
  const row = db.prepare("SELECT * FROM analyses WHERE id = ?").get(result.lastInsertRowid) as Record<string, unknown>;
  return rowToAnalysis(row);
}

export function updateAnalysis(id: string, data: Partial<{
  patientId: string;
  type: string;
  date: string;
  resultSummary: string;
  resultFileUrl: string;
  doctorNotes: string;
  status: string;
}>) {
  const db = getDb();
  const fields: string[] = [];
  const values: unknown[] = [];
  if (data.patientId != null) { fields.push("patientId = ?"); values.push(Number(data.patientId)); }
  if (data.type != null) { fields.push("type = ?"); values.push(data.type); }
  if (data.date != null) { fields.push("date = ?"); values.push(data.date); }
  if (data.resultSummary != null) { fields.push("resultSummary = ?"); values.push(data.resultSummary); }
  if (data.resultFileUrl !== undefined) { fields.push("resultFileUrl = ?"); values.push(data.resultFileUrl); }
  if (data.doctorNotes !== undefined) { fields.push("doctorNotes = ?"); values.push(data.doctorNotes); }
  if (data.status != null) { fields.push("status = ?"); values.push(data.status); }
  if (fields.length === 0) return findAnalysisById(id);
  fields.push("updatedAt = datetime('now')");
  values.push(Number(id));
  db.prepare("UPDATE analyses SET " + fields.join(", ") + " WHERE id = ?").run(...values);
  return findAnalysisById(id);
}

export function findAnalysisById(id: string) {
  const db = getDb();
  const row = db.prepare("SELECT * FROM analyses WHERE id = ?").get(Number(id)) as Record<string, unknown> | undefined;
  return row ? rowToAnalysis(row) : null;
}

export function deleteAnalysis(id: string): boolean {
  const db = getDb();
  const result = db.prepare("DELETE FROM analyses WHERE id = ?").run(Number(id));
  return result.changes > 0;
}

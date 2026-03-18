import { getDb } from "./sqlite";

function rowToAppointment(row: Record<string, unknown>) {
  return {
    _id: String(row.id),
    patientId: String(row.patientId),
    serviceId: String(row.serviceId),
    doctorId: row.doctorId != null ? String(row.doctorId) : undefined,
    date: String(row.date),
    time: String(row.time),
    status: String(row.status),
    comment: row.comment != null ? String(row.comment) : undefined,
    createdAt: String(row.createdAt),
    updatedAt: String(row.updatedAt),
  };
}

export function findAppointments(filter: { patientId?: string }) {
  const db = getDb();
  let sql = "SELECT * FROM appointments";
  const params: (string | number)[] = [];
  if (filter.patientId != null) {
    sql += " WHERE patientId = ?";
    params.push(Number(filter.patientId));
  }
  sql += " ORDER BY date ASC, time ASC";
  const rows = (params.length ? db.prepare(sql).all(...params) : db.prepare(sql).all()) as Record<string, unknown>[];
  return rows.map(rowToAppointment);
}

export function createAppointment(data: {
  patientId: string;
  serviceId: string;
  doctorId?: string;
  date: string;
  time: string;
  comment?: string | null;
}) {
  const db = getDb();
  const stmt = db.prepare(
    "INSERT INTO appointments (patientId, serviceId, doctorId, date, time, comment) VALUES (?, ?, ?, ?, ?, ?)"
  );
  const result = stmt.run(
    Number(data.patientId),
    Number(data.serviceId),
    data.doctorId ? Number(data.doctorId) : null,
    data.date,
    data.time,
    data.comment ?? null
  );
  const row = db.prepare("SELECT * FROM appointments WHERE id = ?").get(result.lastInsertRowid) as Record<string, unknown>;
  return rowToAppointment(row);
}

export function findAppointmentById(id: string) {
  const db = getDb();
  const row = db.prepare("SELECT * FROM appointments WHERE id = ?").get(Number(id)) as Record<string, unknown> | undefined;
  return row ? rowToAppointment(row) : null;
}

export function updateAppointment(id: string, data: Partial<{
  patientId: string;
  serviceId: string;
  date: string;
  time: string;
  status: string;
  comment: string;
}>) {
  const db = getDb();
  const fields: string[] = [];
  const values: unknown[] = [];
  if (data.patientId != null) { fields.push("patientId = ?"); values.push(Number(data.patientId)); }
  if (data.serviceId != null) { fields.push("serviceId = ?"); values.push(Number(data.serviceId)); }
  if (data.date != null) { fields.push("date = ?"); values.push(data.date); }
  if (data.time != null) { fields.push("time = ?"); values.push(data.time); }
  if (data.status != null) { fields.push("status = ?"); values.push(data.status); }
  if (data.comment !== undefined) { fields.push("comment = ?"); values.push(data.comment); }
  if (fields.length === 0) return findAppointmentById(id);
  fields.push("updatedAt = datetime('now')");
  values.push(Number(id));
  db.prepare("UPDATE appointments SET " + fields.join(", ") + " WHERE id = ?").run(...values);
  return findAppointmentById(id);
}

export function deleteAppointment(id: string): boolean {
  const db = getDb();
  const result = db.prepare("DELETE FROM appointments WHERE id = ?").run(Number(id));
  return result.changes > 0;
}

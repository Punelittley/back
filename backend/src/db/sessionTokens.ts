import { getDb, toId } from "./sqlite";

export function createSessionToken(data: {
  userId: number;
  tokenEncrypted: string;
  tokenHash: string;
  userAgent?: string | null;
  ip?: string | null;
  expiresAt: string;
}) {
  const db = getDb();
  const stmt = db.prepare(
    "INSERT INTO session_tokens (userId, tokenEncrypted, tokenHash, userAgent, ip, expiresAt) VALUES (?, ?, ?, ?, ?, ?)"
  );
  stmt.run(
    data.userId,
    data.tokenEncrypted,
    data.tokenHash,
    data.userAgent ?? null,
    data.ip ?? null,
    data.expiresAt
  );
}

export function findSessionByTokenHash(tokenHash: string): { userId: number } | null {
  const db = getDb();
  const row = db
    .prepare(
      "SELECT userId FROM session_tokens WHERE tokenHash = ? AND expiresAt > datetime('now')"
    )
    .get(tokenHash) as { userId: number } | undefined;
  return row ?? null;
}

export function deleteSessionByTokenHash(tokenHash: string): void {
  const db = getDb();
  db.prepare("DELETE FROM session_tokens WHERE tokenHash = ?").run(tokenHash);
}

export function deleteExpiredSessions(): void {
  const db = getDb();
  db.prepare("DELETE FROM session_tokens WHERE expiresAt <= datetime('now')").run();
}

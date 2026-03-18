import crypto from "crypto";
import { Request } from "express";
import * as sessionTokens from "../db/sessionTokens";
import { encrypt } from "./crypto";
import { env } from "../config/env";

const SESSION_COOKIE_NAME = "sid";
const SESSION_TTL_HOURS = 24;

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function createSession(userId: string, req: Request): string {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenEncrypted = encrypt(rawToken);
  const tokenHash = hashToken(rawToken);

  const expiresAt = new Date(Date.now() + SESSION_TTL_HOURS * 60 * 60 * 1000);

  sessionTokens.createSessionToken({
    userId: Number(userId),
    tokenEncrypted,
    tokenHash,
    userAgent: req.headers["user-agent"],
    ip: (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress,
    expiresAt: expiresAt.toISOString(),
  });

  return rawToken;
}

export function revokeSession(rawToken: string): void {
  const tokenHash = hashToken(rawToken);
  sessionTokens.deleteSessionByTokenHash(tokenHash);
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: env.nodeEnv === "production",
  path: "/",
};

export { SESSION_COOKIE_NAME };

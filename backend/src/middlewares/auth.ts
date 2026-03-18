import { NextFunction, Request, Response } from "express";
import * as sessionTokens from "../db/sessionTokens";
import * as usersDb from "../db/users";
import { SESSION_COOKIE_NAME } from "../utils/session";
import crypto from "crypto";

export interface AuthenticatedRequest extends Request {
  user?: { _id: string; id: string; email: string; fullName: string; role: string };
}

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function sessionMiddleware(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  const rawToken = req.cookies?.[SESSION_COOKIE_NAME];
  if (!rawToken || typeof rawToken !== "string") {
    return next();
  }

  const tokenHash = hashToken(rawToken);
  const session = sessionTokens.findSessionByTokenHash(tokenHash);
  if (!session) {
    return next();
  }

  const user = usersDb.findUserById(session.userId);
  if (!user) {
    return next();
  }

  req.user = { _id: user._id, id: user.id, email: user.email, fullName: user.fullName, role: user.role };
  return next();
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  return next();
}

export function requireRole(...roles: Array<"patient" | "doctor" | "admin">) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (!roles.includes(req.user.role as "patient" | "doctor" | "admin")) {
      return res.status(403).json({ message: "Forbidden" });
    }
    return next();
  };
}

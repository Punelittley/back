import { Router } from "express";
import * as usersDb from "../db/users";
import { hashPassword, comparePassword } from "../utils/password";
import { createSession, revokeSession, sessionCookieOptions, SESSION_COOKIE_NAME } from "../utils/session";
import type { AuthenticatedRequest } from "../middlewares/auth";
import { requireAuth } from "../middlewares/auth";

const router = Router();

router.post("/register", async (req, res) => {
  const { email, password, fullName, birthDate, phone } = req.body ?? {};

  if (!email || !password || !fullName) {
    return res.status(400).json({ message: "Укажите email, пароль и ФИО" });
  }

  const existing = usersDb.findUserByEmail(email);
  if (existing) {
    return res.status(409).json({ message: "Пользователь с таким email уже зарегистрирован" });
  }

  try {
    const passwordHash = await hashPassword(password);
    const user = usersDb.createUser({
      email: email.toLowerCase(),
      passwordHash,
      fullName,
      birthDate: birthDate ? new Date(birthDate).toISOString() : null,
      phone,
      role: "patient",
    });

    const token = createSession(user._id, req);
    res.cookie(SESSION_COOKIE_NAME, token, sessionCookieOptions);

    return res.status(201).json({
      id: user._id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    });
  } catch {
    return res.status(500).json({ message: "Ошибка регистрации" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) {
    return res.status(400).json({ message: "Укажите email и пароль" });
  }

  const user = usersDb.findUserByEmail(email);
  if (!user) {
    return res.status(401).json({ message: "Неверный email или пароль" });
  }

  try {
    const ok = await comparePassword(password, user.passwordHash!);
    if (!ok) {
      return res.status(401).json({ message: "Неверный email или пароль" });
    }

    const token = createSession(user._id, req);
    res.cookie(SESSION_COOKIE_NAME, token, sessionCookieOptions);

    return res.json({
      id: user._id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    });
  } catch {
    return res.status(500).json({ message: "Ошибка входа" });
  }
});

router.post("/logout", (req: AuthenticatedRequest, res) => {
  const rawToken = req.cookies?.[SESSION_COOKIE_NAME];
  if (rawToken && typeof rawToken === "string") {
    revokeSession(rawToken);
  }
  res.clearCookie(SESSION_COOKIE_NAME, { path: "/" });
  return res.status(204).send();
});

router.get("/me", requireAuth, (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Необходима авторизация" });
  }
  const full = usersDb.findUserById(req.user._id);
  if (!full) {
    return res.status(401).json({ message: "Необходима авторизация" });
  }
  return res.json({
    id: full._id,
    email: full.email,
    fullName: full.fullName,
    role: full.role,
    phone: full.phone ?? null,
  });
});

router.patch("/me", requireAuth, (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Необходима авторизация" });
  }
  const { fullName, phone } = req.body ?? {};
  usersDb.updateUserProfile(req.user._id, { fullName, phone });
  const updated = usersDb.findUserById(req.user._id)!;
  return res.json({
    id: updated._id,
    email: updated.email,
    fullName: updated.fullName,
    role: updated.role,
    phone: updated.phone ?? null,
  });
});

export default router;

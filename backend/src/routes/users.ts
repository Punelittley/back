import { Router } from "express";
import * as usersDb from "../db/users";
import { requireRole } from "../middlewares/auth";

const router = Router();

router.get("/", requireRole("admin"), (_req, res) => {
  const users = usersDb.listUsers();
  return res.json(users);
});

router.get("/doctors", (_req, res) => {
  const doctors = usersDb.listDoctors();
  return res.json(doctors);
});

export default router;

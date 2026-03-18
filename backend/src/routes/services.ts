import { Router } from "express";
import * as servicesDb from "../db/services";
import { requireRole, AuthenticatedRequest } from "../middlewares/auth";

const router = Router();

router.get("/", (req, res) => {
  const all = req.query.all === "true" && (req as AuthenticatedRequest).user?.role === "admin";
  const items = servicesDb.findServices(!all);
  return res.json(items);
});

router.post("/", requireRole("admin"), (req, res) => {
  const { name, description, price, durationMinutes, category, isActive } = req.body ?? {};
  if (!name || !description || price == null || durationMinutes == null) {
    return res.status(400).json({ message: "name, description, price, durationMinutes are required" });
  }
  const item = servicesDb.createService({
    name,
    description,
    price,
    durationMinutes,
    category,
    isActive,
  });
  return res.status(201).json(item);
});

router.put("/:id", requireRole("admin"), (req, res) => {
  const { id } = req.params;
  const update = req.body ?? {};
  const item = servicesDb.updateService(id, update);
  if (!item) {
    return res.status(404).json({ message: "Not found" });
  }
  return res.json(item);
});

router.delete("/:id", requireRole("admin"), (req, res) => {
  const { id } = req.params;
  const ok = servicesDb.deleteService(id);
  if (!ok) {
    return res.status(404).json({ message: "Not found" });
  }
  return res.status(204).send();
});

export default router;

import { Router } from "express";
import * as analysesDb from "../db/analyses";
import { requireAuth, requireRole, AuthenticatedRequest } from "../middlewares/auth";

const router = Router();

router.get("/", requireAuth, (req: AuthenticatedRequest, res) => {
  const filter: { patientId?: string } = {};

  if (req.user?.role === "patient") {
    filter.patientId = req.user._id;
  } else if (req.user?.role === "doctor" && req.query.patientId) {
    filter.patientId = req.query.patientId as string;
  }

  const items = analysesDb.findAnalyses(filter);
  return res.json(items);
});

router.post("/", requireRole("doctor", "admin"), (req: AuthenticatedRequest, res) => {
  const { patientId, type, date, resultSummary, resultFileUrl, doctorNotes, status } = req.body ?? {};
  if (!patientId || !type || !date || !resultSummary) {
    return res.status(400).json({ message: "patientId, type, date, resultSummary are required" });
  }
  const item = analysesDb.createAnalysis({
    patientId,
    type,
    date,
    resultSummary,
    resultFileUrl,
    doctorNotes,
    status,
  });
  return res.status(201).json(item);
});

router.put("/:id", requireRole("doctor", "admin"), (req, res) => {
  const { id } = req.params;
  const update = req.body ?? {};
  const item = analysesDb.updateAnalysis(id, update);
  if (!item) {
    return res.status(404).json({ message: "Not found" });
  }
  return res.json(item);
});

router.delete("/:id", requireRole("doctor", "admin"), (req, res) => {
  const { id } = req.params;
  const ok = analysesDb.deleteAnalysis(id);
  if (!ok) {
    return res.status(404).json({ message: "Not found" });
  }
  return res.status(204).send();
});

export default router;

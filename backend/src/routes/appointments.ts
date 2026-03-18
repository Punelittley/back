import { Router } from "express";
import * as appointmentsDb from "../db/appointments";
import { requireAuth, requireRole, AuthenticatedRequest } from "../middlewares/auth";

const router = Router();

router.get("/", requireAuth, (req: AuthenticatedRequest, res) => {
  const filter: { patientId?: string } = {};

  if (req.user?.role === "patient") {
    filter.patientId = req.user._id;
  } else if (req.user?.role === "doctor" && req.query.patientId) {
    filter.patientId = req.query.patientId as string;
  }

  const items = appointmentsDb.findAppointments(filter);
  return res.json(items);
});

router.post("/", requireRole("patient", "admin"), (req: AuthenticatedRequest, res) => {
  const { serviceId, date, time, comment, patientId, doctorId } = req.body ?? {};
  if (!serviceId || !date || !time) {
    return res.status(400).json({ message: "serviceId, date, time are required" });
  }

  const realPatientId = req.user?.role === "patient" ? req.user._id : patientId;
  if (!realPatientId) {
    return res.status(400).json({ message: "patientId is required" });
  }

  const item = appointmentsDb.createAppointment({
    patientId: realPatientId,
    serviceId,
    doctorId,
    date,
    time,
    comment,
  });
  return res.status(201).json(item);
});

router.put("/:id", requireRole("admin", "doctor"), (req, res) => {
  const { id } = req.params;
  const update = req.body ?? {};
  const item = appointmentsDb.updateAppointment(id, update);
  if (!item) {
    return res.status(404).json({ message: "Not found" });
  }
  return res.json(item);
});

router.delete("/:id", requireRole("admin"), (req, res) => {
  const { id } = req.params;
  const ok = appointmentsDb.deleteAppointment(id);
  if (!ok) {
    return res.status(404).json({ message: "Not found" });
  }
  return res.status(204).send();
});

export default router;

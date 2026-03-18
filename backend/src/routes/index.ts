import { Router } from "express";
import authRouter from "./auth";
import usersRouter from "./users";
import analysesRouter from "./analyses";
import newsRouter from "./news";
import servicesRouter from "./services";
import appointmentsRouter from "./appointments";

const router = Router();

router.use("/auth", authRouter);
router.use("/users", usersRouter);
router.use("/analyses", analysesRouter);
router.use("/news", newsRouter);
router.use("/services", servicesRouter);
router.use("/appointments", appointmentsRouter);

router.get("/", (_req, res) => {
  res.json({ message: "Clinic patient portal API" });
});

export default router;


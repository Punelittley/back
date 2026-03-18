import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import router from "./routes";
import { env } from "./config/env";
import { sessionMiddleware } from "./middlewares/auth";

const app = express();

app.use(
  cors({
    origin: env.nodeEnv === "development" ? true : "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser(env.cookieSecret));
app.use(sessionMiddleware);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", router);

export { app, env };


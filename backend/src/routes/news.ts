import { Router } from "express";
import * as newsDb from "../db/news";
import { requireRole } from "../middlewares/auth";

const router = Router();

router.get("/", (_req, res) => {
  const items = newsDb.findNews();
  return res.json(items);
});

router.post("/", requireRole("admin"), (req, res) => {
  const { title, content, imageUrl, publishedAt, isFeatured, priority } = req.body ?? {};
  if (!title || !content) {
    return res.status(400).json({ message: "title and content are required" });
  }
  const item = newsDb.createNews({
    title,
    content,
    imageUrl,
    publishedAt,
    isFeatured,
    priority,
  });
  return res.status(201).json(item);
});

router.put("/:id", requireRole("admin"), (req, res) => {
  const { id } = req.params;
  const update = req.body ?? {};
  const item = newsDb.updateNews(id, update);
  if (!item) {
    return res.status(404).json({ message: "Not found" });
  }
  return res.json(item);
});

router.delete("/:id", requireRole("admin"), (req, res) => {
  const { id } = req.params;
  const ok = newsDb.deleteNews(id);
  if (!ok) {
    return res.status(404).json({ message: "Not found" });
  }
  return res.status(204).send();
});

export default router;

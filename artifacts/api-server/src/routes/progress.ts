import { Router, type IRouter } from "express";
import { db, roadmapItemsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  GetCategoryProgressParams,
  GetCategoryProgressResponse,
  GetAllProgressResponse,
  GetRoadmapItemsQueryParams,
  GetRoadmapItemsResponse,
  CreateRoadmapItemBody,
  CreateRoadmapItemResponse,
  UpdateRoadmapItemParams,
  UpdateRoadmapItemBody,
  UpdateRoadmapItemResponse,
  DeleteRoadmapItemParams,
} from "@workspace/api-zod";

const CATEGORIES = [
  { category: "gis", label: "GIS Roadmap", emoji: "💄" },
  { category: "university", label: "University", emoji: "🎓" },
  { category: "applications", label: "Applications", emoji: "📄" },
  { category: "research", label: "Research", emoji: "🧠" },
];

const router: IRouter = Router();

router.get("/progress", async (req, res): Promise<void> => {
  const result = await Promise.all(
    CATEGORIES.map(async ({ category, label, emoji }) => {
      const items = await db.select().from(roadmapItemsTable).where(eq(roadmapItemsTable.category, category));
      const total = items.length;
      const completed = items.filter((i) => i.completed).length;
      const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
      return { category, label, emoji, percentage, completedItems: completed, totalItems: total };
    })
  );
  res.json(GetAllProgressResponse.parse(result));
});

router.get("/progress/:category", async (req, res): Promise<void> => {
  const params = GetCategoryProgressParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const { category } = params.data;
  const meta = CATEGORIES.find((c) => c.category === category);
  if (!meta) {
    res.status(404).json({ error: "Category not found" });
    return;
  }

  const items = await db.select().from(roadmapItemsTable).where(eq(roadmapItemsTable.category, category));
  const total = items.length;
  const completed = items.filter((i) => i.completed).length;
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

  res.json(GetCategoryProgressResponse.parse({
    category,
    label: meta.label,
    emoji: meta.emoji,
    percentage,
    completedItems: completed,
    totalItems: total,
  }));
});

router.get("/roadmap-items", async (req, res): Promise<void> => {
  const query = GetRoadmapItemsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const items = query.data.category
    ? await db.select().from(roadmapItemsTable).where(eq(roadmapItemsTable.category, query.data.category))
    : await db.select().from(roadmapItemsTable);

  res.json(GetRoadmapItemsResponse.parse(items));
});

router.post("/roadmap-items", async (req, res): Promise<void> => {
  const parsed = CreateRoadmapItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [item] = await db.insert(roadmapItemsTable).values({
    category: parsed.data.category,
    title: parsed.data.title,
    order: parsed.data.order ?? 0,
  }).returning();

  res.status(201).json(CreateRoadmapItemResponse.parse(item));
});

router.patch("/roadmap-items/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdateRoadmapItemParams.safeParse({ id: Number(rawId) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateRoadmapItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [item] = await db
    .update(roadmapItemsTable)
    .set(parsed.data)
    .where(eq(roadmapItemsTable.id, params.data.id))
    .returning();

  if (!item) {
    res.status(404).json({ error: "Roadmap item not found" });
    return;
  }

  res.json(UpdateRoadmapItemResponse.parse(item));
});

router.delete("/roadmap-items/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeleteRoadmapItemParams.safeParse({ id: Number(rawId) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  await db.delete(roadmapItemsTable).where(eq(roadmapItemsTable.id, params.data.id));
  res.sendStatus(204);
});

export default router;

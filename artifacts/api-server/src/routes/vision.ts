import { Router, type IRouter } from "express";
import { db, visionItemsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  GetVisionBoardResponse,
  CreateVisionItemBody,
  CreateVisionItemResponse,
  DeleteVisionItemParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/vision-board", async (req, res): Promise<void> => {
  const items = await db.select().from(visionItemsTable).orderBy(visionItemsTable.createdAt);
  res.json(GetVisionBoardResponse.parse(items));
});

router.post("/vision-board", async (req, res): Promise<void> => {
  const parsed = CreateVisionItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [item] = await db.insert(visionItemsTable).values({
    type: parsed.data.type,
    content: parsed.data.content,
    caption: parsed.data.caption ?? null,
  }).returning();

  res.status(201).json(CreateVisionItemResponse.parse(item));
});

router.delete("/vision-board/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeleteVisionItemParams.safeParse({ id: Number(rawId) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  await db.delete(visionItemsTable).where(eq(visionItemsTable.id, params.data.id));
  res.sendStatus(204);
});

export default router;

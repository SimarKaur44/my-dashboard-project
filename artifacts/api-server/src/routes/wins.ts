import { Router, type IRouter } from "express";
import { db, winsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  GetWinsResponse,
  AddWinBody,
  AddWinResponse,
  DeleteWinParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/wins", async (req, res): Promise<void> => {
  const wins = await db.select().from(winsTable).orderBy(winsTable.createdAt);

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const totalThisMonth = wins.filter((w) => new Date(w.createdAt) >= monthStart).length;

  res.json(GetWinsResponse.parse({
    wins,
    totalThisMonth,
    total: wins.length,
  }));
});

router.post("/wins", async (req, res): Promise<void> => {
  const parsed = AddWinBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [win] = await db.insert(winsTable).values({ description: parsed.data.description }).returning();
  res.status(201).json(AddWinResponse.parse(win));
});

router.delete("/wins/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeleteWinParams.safeParse({ id: Number(rawId) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  await db.delete(winsTable).where(eq(winsTable.id, params.data.id));
  res.sendStatus(204);
});

export default router;

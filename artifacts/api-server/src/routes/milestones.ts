import { Router, type IRouter } from "express";
import { db, milestonesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  GetMilestonesResponse,
  CreateMilestoneBody,
  CreateMilestoneResponse,
  UpdateMilestoneParams,
  UpdateMilestoneBody,
  UpdateMilestoneResponse,
  DeleteMilestoneParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/milestones", async (req, res): Promise<void> => {
  const milestones = await db.select().from(milestonesTable).orderBy(milestonesTable.createdAt);
  res.json(GetMilestonesResponse.parse(milestones));
});

router.post("/milestones", async (req, res): Promise<void> => {
  const parsed = CreateMilestoneBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const toDateStr = (d: Date | undefined | null) =>
    d instanceof Date ? d.toISOString().slice(0, 10) : null;

  const [milestone] = await db.insert(milestonesTable).values({
    title: parsed.data.title,
    milestoneType: parsed.data.milestoneType,
    targetCount: parsed.data.targetCount ?? null,
    targetDate: toDateStr(parsed.data.targetDate),
  }).returning();

  res.status(201).json(CreateMilestoneResponse.parse(milestone));
});

router.patch("/milestones/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdateMilestoneParams.safeParse({ id: Number(rawId) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateMilestoneBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { targetDate, ...rest } = parsed.data;
  const updatePayload = {
    ...rest,
    ...(targetDate !== undefined && {
      targetDate: targetDate instanceof Date ? targetDate.toISOString().slice(0, 10) : null,
    }),
  };

  const [milestone] = await db
    .update(milestonesTable)
    .set(updatePayload)
    .where(eq(milestonesTable.id, params.data.id))
    .returning();

  if (!milestone) {
    res.status(404).json({ error: "Milestone not found" });
    return;
  }

  res.json(UpdateMilestoneResponse.parse(milestone));
});

router.delete("/milestones/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeleteMilestoneParams.safeParse({ id: Number(rawId) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  await db.delete(milestonesTable).where(eq(milestonesTable.id, params.data.id));
  res.sendStatus(204);
});

export default router;

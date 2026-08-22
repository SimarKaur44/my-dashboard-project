import { Router, type IRouter } from "express";
import { db, plannerNotesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  GetPlannerNotesResponse,
  CreatePlannerNoteBody,
  CreatePlannerNoteResponse,
  UpdatePlannerNoteParams,
  UpdatePlannerNoteBody,
  UpdatePlannerNoteResponse,
  DeletePlannerNoteParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/planner", async (req, res): Promise<void> => {
  const notes = await db.select().from(plannerNotesTable);
  res.json(GetPlannerNotesResponse.parse(notes));
});

router.post("/planner", async (req, res): Promise<void> => {
  const parsed = CreatePlannerNoteBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const weekStartStr =
    parsed.data.weekStart instanceof Date
      ? parsed.data.weekStart.toISOString().slice(0, 10)
      : String(parsed.data.weekStart);

  const [note] = await db.insert(plannerNotesTable).values({
    dayOfWeek: parsed.data.dayOfWeek,
    content: parsed.data.content,
    weekStart: weekStartStr,
  }).returning();

  res.status(201).json(CreatePlannerNoteResponse.parse(note));
});

router.patch("/planner/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdatePlannerNoteParams.safeParse({ id: Number(rawId) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdatePlannerNoteBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [note] = await db
    .update(plannerNotesTable)
    .set(parsed.data)
    .where(eq(plannerNotesTable.id, params.data.id))
    .returning();

  if (!note) {
    res.status(404).json({ error: "Planner note not found" });
    return;
  }

  res.json(UpdatePlannerNoteResponse.parse(note));
});

router.delete("/planner/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeletePlannerNoteParams.safeParse({ id: Number(rawId) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  await db.delete(plannerNotesTable).where(eq(plannerNotesTable.id, params.data.id));
  res.sendStatus(204);
});

export default router;

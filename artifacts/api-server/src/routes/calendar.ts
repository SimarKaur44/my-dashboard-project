import { Router, type IRouter } from "express";
import { db, calendarTasksTable } from "@workspace/db";
import { asc, eq } from "drizzle-orm";
import {
  GetCalendarTasksResponse,
  CreateCalendarTaskBody,
  CreateCalendarTaskResponse,
  UpdateCalendarTaskParams,
  UpdateCalendarTaskBody,
  UpdateCalendarTaskResponse,
  DeleteCalendarTaskParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/calendar/tasks", async (_req, res): Promise<void> => {
  const tasks = await db.select().from(calendarTasksTable).orderBy(asc(calendarTasksTable.date), asc(calendarTasksTable.id));
  res.json(GetCalendarTasksResponse.parse(tasks));
});

router.post("/calendar/tasks", async (req, res): Promise<void> => {
  const parsed = CreateCalendarTaskBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [task] = await db.insert(calendarTasksTable).values({
    ...parsed.data,
    date: parsed.data.date.toISOString().slice(0, 10),
  }).returning();
  res.status(201).json(CreateCalendarTaskResponse.parse(task));
});

router.patch("/calendar/tasks/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdateCalendarTaskParams.safeParse({ id: Number(rawId) });
  const parsed = UpdateCalendarTaskBody.safeParse(req.body);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const updateData: {
    title?: string;
    date?: string;
    notes?: string;
    completed?: boolean;
  } = {
    ...(parsed.data.title !== undefined ? { title: parsed.data.title } : {}),
    ...(parsed.data.date !== undefined ? { date: parsed.data.date.toISOString().slice(0, 10) } : {}),
    ...(parsed.data.notes !== undefined ? { notes: parsed.data.notes } : {}),
    ...(parsed.data.completed !== undefined ? { completed: parsed.data.completed } : {}),
  };
  const [task] = await db.update(calendarTasksTable).set(updateData)
    .where(eq(calendarTasksTable.id, params.data.id)).returning();
  if (!task) {
    res.status(404).json({ error: "Calendar task not found" });
    return;
  }
  res.json(UpdateCalendarTaskResponse.parse(task));
});

router.delete("/calendar/tasks/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeleteCalendarTaskParams.safeParse({ id: Number(rawId) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  await db.delete(calendarTasksTable).where(eq(calendarTasksTable.id, params.data.id));
  res.sendStatus(204);
});

export default router;
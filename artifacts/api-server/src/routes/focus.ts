import { Router, type IRouter } from "express";
import { db, dailyFocusTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  GetFocusResponse,
  SetFocusBody,
  SetFocusResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/focus", async (req, res): Promise<void> => {
  const today = new Date().toISOString().slice(0, 10);
  const [focus] = await db.select().from(dailyFocusTable).where(eq(dailyFocusTable.date, today));

  if (!focus) {
    // Return today with empty text if no focus set yet
    res.json(GetFocusResponse.parse({ id: 0, text: "", date: today }));
    return;
  }

  res.json(GetFocusResponse.parse(focus));
});

router.post("/focus", async (req, res): Promise<void> => {
  const parsed = SetFocusBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const today = new Date().toISOString().slice(0, 10);

  // Upsert: update if exists, insert if not
  const [existing] = await db.select().from(dailyFocusTable).where(eq(dailyFocusTable.date, today));

  if (existing) {
    const [updated] = await db
      .update(dailyFocusTable)
      .set({ text: parsed.data.text })
      .where(eq(dailyFocusTable.id, existing.id))
      .returning();
    res.json(SetFocusResponse.parse(updated));
  } else {
    const [created] = await db.insert(dailyFocusTable).values({
      text: parsed.data.text,
      date: today,
    }).returning();
    res.json(SetFocusResponse.parse(created));
  }
});

export default router;

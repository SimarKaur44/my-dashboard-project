import { Router, type IRouter } from "express";
import { db, settingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  GetSettingsResponse,
  UpdateSettingsBody,
  UpdateSettingsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

/**
 * GET /settings
 * Returns the single settings row, auto-creating it with defaults on first use.
 */
router.get("/settings", async (req, res): Promise<void> => {
  let [row] = await db.select().from(settingsTable).limit(1);
  if (!row) {
    [row] = await db.insert(settingsTable).values({}).returning();
  }
  res.json(GetSettingsResponse.parse(row));
});

/**
 * PATCH /settings
 * Updates the single settings row (creates it first if it doesn't exist).
 */
router.patch("/settings", async (req, res): Promise<void> => {
  const parsed = UpdateSettingsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  // Ensure there's a row to update
  let [existing] = await db.select().from(settingsTable).limit(1);
  if (!existing) {
    [existing] = await db.insert(settingsTable).values({}).returning();
  }

  const [updated] = await db
    .update(settingsTable)
    .set(parsed.data)
    .where(eq(settingsTable.id, existing.id))
    .returning();

  res.json(UpdateSettingsResponse.parse(updated));
});

export default router;

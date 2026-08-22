import { Router, type IRouter } from "express";
import { db, roadmapItemsTable, winsTable, dailyFocusTable, quotesTable, settingsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import {
  GetDashboardResponse,
  GetSettingsResponse,
  UpdateSettingsBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/dashboard", async (req, res): Promise<void> => {
  const CATEGORIES = [
    { category: "gis", label: "GIS Roadmap", emoji: "💄" },
    { category: "university", label: "University", emoji: "🎓" },
    { category: "applications", label: "Applications", emoji: "📄" },
    { category: "research", label: "Research", emoji: "🧠" },
  ];

  const progressRings = await Promise.all(
    CATEGORIES.map(async ({ category, label, emoji }) => {
      const items = await db.select().from(roadmapItemsTable).where(eq(roadmapItemsTable.category, category));
      const total = items.length;
      const completed = items.filter((i) => i.completed).length;
      const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
      return { category, label, emoji, percentage, completedItems: completed, totalItems: total };
    })
  );

  // Monthly wins
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const allWins = await db.select().from(winsTable);
  const winsThisMonth = allWins.filter((w) => new Date(w.createdAt) >= monthStart).length;

  // Today's focus
  const today = now.toISOString().slice(0, 10);
  const [focus] = await db.select().from(dailyFocusTable).where(eq(dailyFocusTable.date, today));

  // Random quote
  const allQuotes = await db.select().from(quotesTable);
  const randomQuote = allQuotes.length > 0
    ? allQuotes[Math.floor(Math.random() * allQuotes.length)]
    : { id: 0, text: "Become the woman younger you would never believe was real.", category: "CEO Energy", author: null };

  // Settings for name + semester
  const [settings] = await db.select().from(settingsTable);
  const name = settings?.name ?? "Simar";
  const currentSemester = settings?.currentSemester ?? "Fall 2025";

  // Streak: count consecutive days with at least one win (simple version)
  const streak = 0; // TODO: implement streak based on daily wins

  const response = GetDashboardResponse.parse({
    greeting: `Welcome back, ${name}`,
    quote: randomQuote,
    progressRings,
    streak,
    currentSemester,
    winsThisMonth,
    dailyFocus: focus?.text ?? null,
  });

  res.json(response);
});

router.get("/settings", async (req, res): Promise<void> => {
  let [settings] = await db.select().from(settingsTable);
  if (!settings) {
    const [created] = await db.insert(settingsTable).values({}).returning();
    settings = created;
  }
  res.json(GetSettingsResponse.parse(settings));
});

router.patch("/settings", async (req, res): Promise<void> => {
  const parsed = UpdateSettingsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  let [settings] = await db.select().from(settingsTable);
  if (!settings) {
    const [created] = await db.insert(settingsTable).values({}).returning();
    settings = created;
  }

  const [updated] = await db
    .update(settingsTable)
    .set(parsed.data)
    .where(eq(settingsTable.id, settings.id))
    .returning();

  res.json(GetSettingsResponse.parse(updated));
});

export default router;

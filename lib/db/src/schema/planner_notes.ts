import { pgTable, text, serial, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const plannerNotesTable = pgTable("planner_notes", {
  id: serial("id").primaryKey(),
  dayOfWeek: text("day_of_week").notNull(),
  content: text("content").notNull().default(""),
  weekStart: date("week_start", { mode: "string" }).notNull(),
});

export const insertPlannerNoteSchema = createInsertSchema(plannerNotesTable).omit({ id: true });
export type InsertPlannerNote = z.infer<typeof insertPlannerNoteSchema>;
export type PlannerNote = typeof plannerNotesTable.$inferSelect;

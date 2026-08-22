import { pgTable, text, serial, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const dailyFocusTable = pgTable("daily_focus", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  date: date("date", { mode: "string" }).notNull().unique(),
});

export const insertDailyFocusSchema = createInsertSchema(dailyFocusTable).omit({ id: true });
export type InsertDailyFocus = z.infer<typeof insertDailyFocusSchema>;
export type DailyFocus = typeof dailyFocusTable.$inferSelect;

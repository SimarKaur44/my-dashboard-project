import { pgTable, serial, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const calendarTasksTable = pgTable("calendar_tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  date: text("date").notNull(),
  notes: text("notes"),
  completed: boolean("completed").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertCalendarTaskSchema = createInsertSchema(calendarTasksTable).omit({ id: true, createdAt: true });
export type InsertCalendarTask = z.infer<typeof insertCalendarTaskSchema>;
export type CalendarTask = typeof calendarTasksTable.$inferSelect;
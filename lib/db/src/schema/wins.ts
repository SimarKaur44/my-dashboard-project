import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const winsTable = pgTable("wins", {
  id: serial("id").primaryKey(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertWinSchema = createInsertSchema(winsTable).omit({ id: true, createdAt: true });
export type InsertWin = z.infer<typeof insertWinSchema>;
export type Win = typeof winsTable.$inferSelect;

import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const visionItemsTable = pgTable("vision_items", {
  id: serial("id").primaryKey(),
  type: text("type").notNull().default("quote"),
  content: text("content").notNull(),
  caption: text("caption"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertVisionItemSchema = createInsertSchema(visionItemsTable).omit({ id: true, createdAt: true });
export type InsertVisionItem = z.infer<typeof insertVisionItemSchema>;
export type VisionItem = typeof visionItemsTable.$inferSelect;

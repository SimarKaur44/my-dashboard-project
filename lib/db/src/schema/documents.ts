import { pgTable, text, serial, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const documentsTable = pgTable("documents", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(),
  name: text("name").notNull(),
  lastUpdated: date("last_updated", { mode: "string" }).notNull().$default(() => new Date().toISOString().slice(0, 10)),
  notes: text("notes"),
  fileUrl: text("file_url"),
});

export const insertDocumentSchema = createInsertSchema(documentsTable).omit({ id: true });
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documentsTable.$inferSelect;

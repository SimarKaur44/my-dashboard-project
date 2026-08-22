import { pgTable, text, serial, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const settingsTable = pgTable("settings", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().default("Simar"),
  wallpaper: text("wallpaper").notNull().default("dark-library"),
  blurAmount: integer("blur_amount").notNull().default(12),
  darknessAmount: integer("darkness_amount").notNull().default(40),
  currentSemester: text("current_semester").notNull().default("Fall 2025"),
});

export const insertSettingsSchema = createInsertSchema(settingsTable).omit({ id: true });
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Settings = typeof settingsTable.$inferSelect;

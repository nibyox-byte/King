import { pgTable, text, serial, timestamp, integer, boolean, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const artisansTable = pgTable("artisans", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  name: text("name").notNull(),
  photo: text("photo"),
  biography: text("biography"),
  skills: text("skills").array().notNull().default([]),
  story: text("story"),
  galleryImages: text("gallery_images").array().notNull().default([]),
  videoUrl: text("video_url"),
  totalSales: integer("total_sales").notNull().default(0),
  totalDonations: real("total_donations").notNull().default(0),
  isConservationAmbassador: boolean("is_conservation_ambassador").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertArtisanSchema = createInsertSchema(artisansTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertArtisan = z.infer<typeof insertArtisanSchema>;
export type Artisan = typeof artisansTable.$inferSelect;

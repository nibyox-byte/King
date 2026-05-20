import { pgTable, text, serial, timestamp, integer, boolean, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { categoriesTable } from "./categories";
import { artisansTable } from "./artisans";

export const productsTable = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  culturalSignificance: text("cultural_significance"),
  price: real("price").notNull(),
  discountPrice: real("discount_price"),
  stock: integer("stock").notNull().default(0),
  sku: text("sku"),
  categoryId: integer("category_id").notNull().references(() => categoriesTable.id),
  artisanId: integer("artisan_id").notNull().references(() => artisansTable.id),
  images: text("images").array().notNull().default([]),
  materials: text("materials"),
  weight: real("weight"),
  dimensions: text("dimensions"),
  featured: boolean("featured").notNull().default(false),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertProductSchema = createInsertSchema(productsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof productsTable.$inferSelect;

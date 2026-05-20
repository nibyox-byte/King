import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { ordersTable } from "./orders";

export const deliveryTrackingTable = pgTable("delivery_tracking", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().unique().references(() => ordersTable.id),
  status: text("status").notNull().default("pending"),
  trackingNumber: text("tracking_number"),
  carrier: text("carrier"),
  estimatedDelivery: text("estimated_delivery"),
  currentLocation: text("current_location"),
  timeline: text("timeline").notNull().default("[]"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertDeliveryTrackingSchema = createInsertSchema(deliveryTrackingTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertDeliveryTracking = z.infer<typeof insertDeliveryTrackingSchema>;
export type DeliveryTracking = typeof deliveryTrackingTable.$inferSelect;

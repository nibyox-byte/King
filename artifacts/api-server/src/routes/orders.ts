import { Router, type IRouter } from "express";
import { eq, and, sql, desc } from "drizzle-orm";
import { db, ordersTable, orderItemsTable, productsTable, deliveryTrackingTable } from "@workspace/db";
import {
  ListOrdersQueryParams,
  GetOrderParams,
  CreateOrderBody,
  UpdateOrderBody,
  UpdateOrderParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

async function buildOrder(order: typeof ordersTable.$inferSelect) {
  const items = await db.select().from(orderItemsTable).where(eq(orderItemsTable.orderId, order.id));
  return {
    ...order,
    subtotal: Number(order.subtotal),
    shippingCost: Number(order.shippingCost),
    total: Number(order.total),
    trackingNumber: order.trackingNumber ?? null,
    shippingCarrier: order.shippingCarrier ?? null,
    notes: order.notes ?? null,
    createdAt: order.createdAt.toISOString(),
    updatedAt: undefined,
    items: items.map(item => ({
      ...item,
      price: Number(item.price),
      subtotal: Number(item.subtotal),
      createdAt: undefined,
    })),
  };
}

router.get("/orders", async (req, res): Promise<void> => {
  const params = ListOrdersQueryParams.safeParse(req.query);
  const page = params.success && params.data.page ? Number(params.data.page) : 1;
  const limit = params.success && params.data.limit ? Number(params.data.limit) : 20;
  const conditions: any[] = [];
  if (params.success) {
    if (params.data.userId) conditions.push(eq(ordersTable.userId, Number(params.data.userId)));
    if (params.data.status) conditions.push(eq(ordersTable.status, params.data.status));
  }
  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const total = await db.select({ count: sql<number>`count(*)` }).from(ordersTable).where(where);
  const orders = await db.select().from(ordersTable).where(where)
    .limit(limit).offset((page - 1) * limit).orderBy(desc(ordersTable.createdAt));
  const rich = await Promise.all(orders.map(buildOrder));
  res.json({ orders: rich, total: Number(total[0]?.count ?? 0), page, totalPages: Math.ceil(Number(total[0]?.count ?? 0) / limit) });
});

router.post("/orders", async (req, res): Promise<void> => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const userId = (req.session as any).userId ?? 1;
  let subtotal = 0;
  const enrichedItems: any[] = [];
  for (const item of parsed.data.items) {
    const [product] = await db.select().from(productsTable).where(eq(productsTable.id, item.productId));
    if (!product) { res.status(404).json({ error: `Product ${item.productId} not found` }); return; }
    const itemSubtotal = Number(product.price) * item.quantity;
    subtotal += itemSubtotal;
    enrichedItems.push({ product, quantity: item.quantity, subtotal: itemSubtotal });
  }
  const shippingCost = parsed.data.shippingType === "pickup" ? 0 : 25;
  const [order] = await db.insert(ordersTable).values({
    userId,
    subtotal,
    shippingCost,
    total: subtotal + shippingCost,
    status: "pending",
    paymentMethod: parsed.data.paymentMethod,
    paymentStatus: "pending",
    shippingAddress: parsed.data.shippingAddress,
    shippingType: parsed.data.shippingType,
    notes: parsed.data.notes ?? null,
  }).returning();
  for (const enriched of enrichedItems) {
    await db.insert(orderItemsTable).values({
      orderId: order.id,
      productId: enriched.product.id,
      productName: enriched.product.name,
      productImage: enriched.product.images[0] ?? "",
      quantity: enriched.quantity,
      price: Number(enriched.product.price),
      subtotal: enriched.subtotal,
    });
  }
  // Create delivery tracking record
  await db.insert(deliveryTrackingTable).values({
    orderId: order.id,
    status: "pending",
    timeline: JSON.stringify([{ status: "pending", description: "Order placed", timestamp: new Date().toISOString() }]),
  });
  res.status(201).json(await buildOrder(order));
});

router.get("/orders/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, id));
  if (!order) { res.status(404).json({ error: "Order not found" }); return; }
  res.json(await buildOrder(order));
});

router.patch("/orders/:id", async (req, res): Promise<void> => {
  const params = UpdateOrderParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const parsed = UpdateOrderBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [order] = await db.update(ordersTable).set(parsed.data as any).where(eq(ordersTable.id, params.data.id)).returning();
  if (!order) { res.status(404).json({ error: "Order not found" }); return; }
  res.json(await buildOrder(order));
});

export default router;

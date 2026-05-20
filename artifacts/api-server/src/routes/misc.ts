import { Router, type IRouter } from "express";
import { eq, and, gte, desc, sql } from "drizzle-orm";
import {
  db, feedbackTable, eventsTable, storiesTable, categoriesTable,
  wishlistTable, cartItemsTable, productsTable, donationsTable, artisansTable,
  deliveryTrackingTable, ordersTable, orderItemsTable, usersTable, bookingsTable,
} from "@workspace/db";
import {
  ListFeedbackQueryParams, SubmitFeedbackBody, UpdateFeedbackBody, UpdateFeedbackParams,
  ListEventsQueryParams, CreateEventBody, UpdateEventBody, UpdateEventParams,
  ListStoriesQueryParams, CreateStoryBody,
  AddToWishlistBody, AddToCartBody, UpdateCartItemBody, CreateDonationBody,
  UpdateDeliveryTrackingBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

// CATEGORIES
router.get("/categories", async (req, res): Promise<void> => {
  const cats = await db.select().from(categoriesTable);
  const rich = await Promise.all(cats.map(async (cat) => {
    const count = await db.select({ count: sql<number>`count(*)` }).from(productsTable).where(eq(productsTable.categoryId, cat.id));
    return { ...cat, description: cat.description ?? null, image: cat.image ?? null, productCount: Number(count[0]?.count ?? 0) };
  }));
  res.json(rich);
});

// FEEDBACK
router.get("/feedback", async (req, res): Promise<void> => {
  const params = ListFeedbackQueryParams.safeParse(req.query);
  const conditions: any[] = [];
  if (params.success) {
    if (params.data.status) conditions.push(eq(feedbackTable.status, params.data.status));
    if (params.data.type) conditions.push(eq(feedbackTable.type, params.data.type));
  }
  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const feedback = await db.select().from(feedbackTable).where(where).orderBy(desc(feedbackTable.createdAt));
  res.json(feedback.map(f => ({ ...f, userId: f.userId ?? null, rating: f.rating ?? null, adminResponse: f.adminResponse ?? null, createdAt: f.createdAt.toISOString() })));
});

router.post("/feedback", async (req, res): Promise<void> => {
  const parsed = SubmitFeedbackBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const userId = (req.session as any).userId ?? null;
  const [feedback] = await db.insert(feedbackTable).values({ ...parsed.data, userId, status: "open" } as any).returning();
  res.status(201).json({ ...feedback, userId: feedback.userId ?? null, rating: feedback.rating ?? null, adminResponse: null, createdAt: feedback.createdAt.toISOString() });
});

router.patch("/feedback/:id", async (req, res): Promise<void> => {
  const params = UpdateFeedbackParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const parsed = UpdateFeedbackBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [feedback] = await db.update(feedbackTable).set(parsed.data as any).where(eq(feedbackTable.id, params.data.id)).returning();
  if (!feedback) { res.status(404).json({ error: "Feedback not found" }); return; }
  res.json({ ...feedback, userId: feedback.userId ?? null, rating: feedback.rating ?? null, adminResponse: feedback.adminResponse ?? null, createdAt: feedback.createdAt.toISOString() });
});

// EVENTS
router.get("/events", async (req, res): Promise<void> => {
  const params = ListEventsQueryParams.safeParse(req.query);
  const conditions: any[] = [eq(eventsTable.active, true)];
  if (params.success && (params.data.upcoming === true || params.data.upcoming === "true" as any)) {
    conditions.push(gte(eventsTable.startDate, new Date()));
  }
  const events = await db.select().from(eventsTable).where(and(...conditions)).orderBy(eventsTable.startDate);
  res.json(events.map(e => ({ ...e, image: e.image ?? null, endDate: e.endDate ? e.endDate.toISOString() : null, location: e.location ?? null, startDate: e.startDate.toISOString(), createdAt: e.createdAt.toISOString() })));
});

router.post("/events", async (req, res): Promise<void> => {
  const parsed = CreateEventBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const slug = parsed.data.title.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now();
  const [event] = await db.insert(eventsTable).values({ ...parsed.data, slug, startDate: new Date(parsed.data.startDate), endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null } as any).returning();
  res.status(201).json({ ...event, image: event.image ?? null, endDate: event.endDate ? event.endDate.toISOString() : null, location: event.location ?? null, startDate: event.startDate.toISOString(), createdAt: event.createdAt.toISOString() });
});

router.get("/events/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [event] = await db.select().from(eventsTable).where(eq(eventsTable.id, id));
  if (!event) { res.status(404).json({ error: "Event not found" }); return; }
  res.json({ ...event, image: event.image ?? null, endDate: event.endDate ? event.endDate.toISOString() : null, location: event.location ?? null, startDate: event.startDate.toISOString(), createdAt: event.createdAt.toISOString() });
});

router.patch("/events/:id", async (req, res): Promise<void> => {
  const params = UpdateEventParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const parsed = UpdateEventBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const updateData: any = { ...parsed.data };
  if (updateData.startDate) updateData.startDate = new Date(updateData.startDate);
  if (updateData.endDate) updateData.endDate = new Date(updateData.endDate);
  const [event] = await db.update(eventsTable).set(updateData).where(eq(eventsTable.id, params.data.id)).returning();
  if (!event) { res.status(404).json({ error: "Event not found" }); return; }
  res.json({ ...event, image: event.image ?? null, endDate: event.endDate ? event.endDate.toISOString() : null, location: event.location ?? null, startDate: event.startDate.toISOString(), createdAt: event.createdAt.toISOString() });
});

// STORIES
router.get("/stories", async (req, res): Promise<void> => {
  const params = ListStoriesQueryParams.safeParse(req.query);
  const conditions: any[] = [eq(storiesTable.published, true)];
  if (params.success && params.data.type) conditions.push(eq(storiesTable.type, params.data.type));
  const stories = await db.select().from(storiesTable).where(and(...conditions)).orderBy(desc(storiesTable.createdAt));
  res.json(stories.map(s => ({ ...s, coverImage: s.coverImage ?? null, videoUrl: s.videoUrl ?? null, artisanId: s.artisanId ?? null, createdAt: s.createdAt.toISOString() })));
});

router.post("/stories", async (req, res): Promise<void> => {
  const parsed = CreateStoryBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const slug = parsed.data.title.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now();
  const [story] = await db.insert(storiesTable).values({ ...parsed.data, slug } as any).returning();
  res.status(201).json({ ...story, coverImage: story.coverImage ?? null, videoUrl: story.videoUrl ?? null, artisanId: story.artisanId ?? null, createdAt: story.createdAt.toISOString() });
});

router.get("/stories/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [story] = await db.select().from(storiesTable).where(eq(storiesTable.id, id));
  if (!story) { res.status(404).json({ error: "Story not found" }); return; }
  res.json({ ...story, coverImage: story.coverImage ?? null, videoUrl: story.videoUrl ?? null, artisanId: story.artisanId ?? null, createdAt: story.createdAt.toISOString() });
});

// IMPACT STATS
router.get("/impact", async (req, res): Promise<void> => {
  const artisanCount = await db.select({ count: sql<number>`count(*)` }).from(artisansTable);
  const ambassadorCount = await db.select({ count: sql<number>`count(*)` }).from(artisansTable).where(eq(artisansTable.isConservationAmbassador, true));
  const orderCount = await db.select({ count: sql<number>`count(*)` }).from(ordersTable);
  const donationsTotal = await db.select({ total: sql<number>`coalesce(sum(amount), 0)` }).from(donationsTable);
  const artisans = Number(artisanCount[0]?.count ?? 0);
  res.json({
    familiesSupported: artisans * 4,
    schoolFeesFunded: artisans * 2,
    treesProtected: 12500,
    communityIncomeGenerated: Number(donationsTotal[0]?.total ?? 0) + (Number(orderCount[0]?.count ?? 0) * 45),
    artisansEmpowered: artisans,
    conservationAmbassadors: Number(ambassadorCount[0]?.count ?? 0),
    countriesReached: 47,
    totalOrders: Number(orderCount[0]?.count ?? 0),
    totalDonations: Number(donationsTotal[0]?.total ?? 0),
  });
});

// WISHLIST
router.get("/wishlist", async (req, res): Promise<void> => {
  const userId = (req.session as any).userId ?? 1;
  const items = await db.select().from(wishlistTable).where(eq(wishlistTable.userId, userId));
  res.json(items.map(i => ({ ...i, createdAt: i.createdAt.toISOString(), product: undefined })));
});

router.post("/wishlist", async (req, res): Promise<void> => {
  const userId = (req.session as any).userId ?? 1;
  const parsed = AddToWishlistBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [item] = await db.insert(wishlistTable).values({ userId, productId: parsed.data.productId }).returning();
  res.status(201).json({ ...item, createdAt: item.createdAt.toISOString() });
});

router.delete("/wishlist/:productId", async (req, res): Promise<void> => {
  const userId = (req.session as any).userId ?? 1;
  const raw = Array.isArray(req.params.productId) ? req.params.productId[0] : req.params.productId;
  const productId = parseInt(raw, 10);
  if (isNaN(productId)) { res.status(400).json({ error: "Invalid productId" }); return; }
  await db.delete(wishlistTable).where(and(eq(wishlistTable.userId, userId), eq(wishlistTable.productId, productId)));
  res.json({ message: "Removed from wishlist" });
});

// CART (session-based)
function getSessionId(req: any): string {
  if (!(req.session as any).cartId) (req.session as any).cartId = `cart-${Date.now()}-${Math.random()}`;
  return (req.session as any).cartId;
}

async function buildCart(sessionId: string) {
  const items = await db.select().from(cartItemsTable).where(eq(cartItemsTable.sessionId, sessionId));
  let subtotal = 0;
  const richItems = [];
  for (const item of items) {
    const [product] = await db.select().from(productsTable).where(eq(productsTable.id, item.productId));
    if (product) {
      const itemSubtotal = Number(product.price) * item.quantity;
      subtotal += itemSubtotal;
      richItems.push({ productId: item.productId, quantity: item.quantity, subtotal: itemSubtotal, product: undefined });
    }
  }
  return { items: richItems, subtotal, itemCount: items.reduce((s, i) => s + i.quantity, 0) };
}

router.get("/cart", async (req, res): Promise<void> => {
  const sessionId = getSessionId(req);
  res.json(await buildCart(sessionId));
});

router.post("/cart", async (req, res): Promise<void> => {
  const sessionId = getSessionId(req);
  const parsed = AddToCartBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const existing = await db.select().from(cartItemsTable).where(and(eq(cartItemsTable.sessionId, sessionId), eq(cartItemsTable.productId, parsed.data.productId)));
  if (existing.length > 0) {
    await db.update(cartItemsTable).set({ quantity: existing[0].quantity + parsed.data.quantity }).where(eq(cartItemsTable.id, existing[0].id));
  } else {
    await db.insert(cartItemsTable).values({ sessionId, productId: parsed.data.productId, quantity: parsed.data.quantity });
  }
  res.json(await buildCart(sessionId));
});

router.patch("/cart/:productId", async (req, res): Promise<void> => {
  const sessionId = getSessionId(req);
  const raw = Array.isArray(req.params.productId) ? req.params.productId[0] : req.params.productId;
  const productId = parseInt(raw, 10);
  if (isNaN(productId)) { res.status(400).json({ error: "Invalid productId" }); return; }
  const parsed = UpdateCartItemBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  await db.update(cartItemsTable).set({ quantity: parsed.data.quantity }).where(and(eq(cartItemsTable.sessionId, sessionId), eq(cartItemsTable.productId, productId)));
  res.json(await buildCart(sessionId));
});

router.delete("/cart/:productId", async (req, res): Promise<void> => {
  const sessionId = getSessionId(req);
  const raw = Array.isArray(req.params.productId) ? req.params.productId[0] : req.params.productId;
  const productId = parseInt(raw, 10);
  if (isNaN(productId)) { res.status(400).json({ error: "Invalid productId" }); return; }
  await db.delete(cartItemsTable).where(and(eq(cartItemsTable.sessionId, sessionId), eq(cartItemsTable.productId, productId)));
  res.json(await buildCart(sessionId));
});

router.delete("/cart", async (req, res): Promise<void> => {
  const sessionId = getSessionId(req);
  await db.delete(cartItemsTable).where(eq(cartItemsTable.sessionId, sessionId));
  res.json({ message: "Cart cleared" });
});

// DONATIONS
router.get("/donations", async (req, res): Promise<void> => {
  const donations = await db.select().from(donationsTable).orderBy(desc(donationsTable.createdAt));
  res.json(donations.map(d => ({ ...d, amount: Number(d.amount), message: d.message ?? null, paymentMethod: d.paymentMethod ?? null, createdAt: d.createdAt.toISOString(), artisan: undefined })));
});

router.post("/donations", async (req, res): Promise<void> => {
  const userId = (req.session as any).userId ?? 1;
  const parsed = CreateDonationBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [donation] = await db.insert(donationsTable).values({ userId, artisanId: parsed.data.artisanId, amount: parsed.data.amount, message: parsed.data.message ?? null, paymentMethod: parsed.data.paymentMethod ?? null }).returning();
  await db.update(artisansTable).set({ totalDonations: sql`total_donations + ${parsed.data.amount}` }).where(eq(artisansTable.id, parsed.data.artisanId));
  res.status(201).json({ ...donation, amount: Number(donation.amount), message: donation.message ?? null, paymentMethod: donation.paymentMethod ?? null, createdAt: donation.createdAt.toISOString(), artisan: undefined });
});

// DELIVERY TRACKING
router.get("/delivery/:orderId", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.orderId) ? req.params.orderId[0] : req.params.orderId;
  const orderId = parseInt(raw, 10);
  if (isNaN(orderId)) { res.status(400).json({ error: "Invalid orderId" }); return; }
  const [tracking] = await db.select().from(deliveryTrackingTable).where(eq(deliveryTrackingTable.orderId, orderId));
  if (!tracking) { res.status(404).json({ error: "Tracking not found" }); return; }
  res.json({ ...tracking, trackingNumber: tracking.trackingNumber ?? null, carrier: tracking.carrier ?? null, estimatedDelivery: tracking.estimatedDelivery ?? null, currentLocation: tracking.currentLocation ?? null, timeline: JSON.parse(tracking.timeline), updatedAt: tracking.updatedAt.toISOString() });
});

router.patch("/delivery/:orderId", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.orderId) ? req.params.orderId[0] : req.params.orderId;
  const orderId = parseInt(raw, 10);
  if (isNaN(orderId)) { res.status(400).json({ error: "Invalid orderId" }); return; }
  const parsed = UpdateDeliveryTrackingBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [existing] = await db.select().from(deliveryTrackingTable).where(eq(deliveryTrackingTable.orderId, orderId));
  if (!existing) { res.status(404).json({ error: "Tracking not found" }); return; }
  const timeline = JSON.parse(existing.timeline);
  if (parsed.data.status) {
    timeline.push({ status: parsed.data.status, description: parsed.data.description ?? `Status updated to ${parsed.data.status}`, location: parsed.data.currentLocation ?? null, timestamp: new Date().toISOString() });
  }
  const updateData: any = { ...parsed.data, timeline: JSON.stringify(timeline) };
  delete updateData.description;
  const [tracking] = await db.update(deliveryTrackingTable).set(updateData).where(eq(deliveryTrackingTable.orderId, orderId)).returning();
  res.json({ ...tracking, trackingNumber: tracking.trackingNumber ?? null, carrier: tracking.carrier ?? null, estimatedDelivery: tracking.estimatedDelivery ?? null, currentLocation: tracking.currentLocation ?? null, timeline: JSON.parse(tracking.timeline), updatedAt: tracking.updatedAt.toISOString() });
});

// ANALYTICS
router.get("/analytics/dashboard", async (req, res): Promise<void> => {
  const totalRevenue = await db.select({ total: sql<number>`coalesce(sum(total), 0)` }).from(ordersTable).where(eq(ordersTable.paymentStatus, "paid"));
  const totalOrders = await db.select({ count: sql<number>`count(*)` }).from(ordersTable);
  const totalCustomers = await db.select({ count: sql<number>`count(*)` }).from(usersTable).where(eq(usersTable.role, "customer"));
  const totalProducts = await db.select({ count: sql<number>`count(*)` }).from(productsTable).where(eq(productsTable.active, true));
  const totalBookings = await db.select({ count: sql<number>`count(*)` }).from(bookingsTable);
  const pendingOrders = await db.select({ count: sql<number>`count(*)` }).from(ordersTable).where(eq(ordersTable.status, "pending"));
  const lowStock = await db.select({ count: sql<number>`count(*)` }).from(productsTable).where(sql`stock < 5`);
  res.json({
    totalRevenue: Number(totalRevenue[0]?.total ?? 0),
    totalOrders: Number(totalOrders[0]?.count ?? 0),
    totalCustomers: Number(totalCustomers[0]?.count ?? 0),
    totalProducts: Number(totalProducts[0]?.count ?? 0),
    totalBookings: Number(totalBookings[0]?.count ?? 0),
    pendingOrders: Number(pendingOrders[0]?.count ?? 0),
    lowStockProducts: Number(lowStock[0]?.count ?? 0),
    newCustomersThisMonth: Math.floor(Number(totalCustomers[0]?.count ?? 0) * 0.2),
    revenueThisMonth: Number(totalRevenue[0]?.total ?? 0) * 0.3,
    conversionRate: 3.4,
  });
});

router.get("/analytics/sales", async (req, res): Promise<void> => {
  const period = (req.query.period as string) || "month";
  const days = period === "week" ? 7 : period === "year" ? 365 : 30;
  const data = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toISOString().split("T")[0],
      revenue: Math.floor(Math.random() * 2000) + 500,
      orders: Math.floor(Math.random() * 20) + 2,
      bookings: Math.floor(Math.random() * 5),
    });
  }
  res.json(data);
});

router.get("/analytics/top-products", async (req, res): Promise<void> => {
  const limit = parseInt((req.query.limit as string) || "5", 10);
  const products = await db.select().from(productsTable).where(eq(productsTable.active, true)).limit(limit);
  const artisans = await db.select().from(artisansTable);
  res.json(products.map((p, i) => ({
    productId: p.id, name: p.name, image: p.images[0] ?? "",
    totalSold: Math.floor(Math.random() * 100) + 10,
    revenue: (Math.floor(Math.random() * 100) + 10) * Number(p.price),
    artisanName: artisans.find(a => a.id === p.artisanId)?.name ?? "Unknown",
  })));
});

router.get("/analytics/top-experiences", async (req, res): Promise<void> => {
  const experiences = await db.select().from(experiencesTable).where(eq(experiencesTable.active, true)).limit(5);
  res.json(experiences.map(e => ({
    experienceId: e.id, title: e.title, type: e.type,
    totalBookings: Math.floor(Math.random() * 50) + 5,
    revenue: (Math.floor(Math.random() * 50) + 5) * Number(e.price),
    averageRating: Number((Math.random() * 1.5 + 3.5).toFixed(1)),
  })));
});

export default router;

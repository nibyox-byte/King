import { Router, type IRouter } from "express";
import { eq, and, desc } from "drizzle-orm";
import { db, reviewsTable, usersTable } from "@workspace/db";
import {
  ListReviewsQueryParams,
  CreateReviewBody,
  UpdateReviewBody,
  UpdateReviewParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

async function buildReview(review: typeof reviewsTable.$inferSelect) {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, review.userId));
  return {
    ...review,
    title: review.title ?? null,
    productId: review.productId ?? null,
    experienceId: review.experienceId ?? null,
    createdAt: review.createdAt.toISOString(),
    updatedAt: undefined,
    user: user ? {
      id: user.id, email: user.email, name: user.name, role: user.role,
      avatar: user.avatar ?? null, phone: user.phone ?? null, address: user.address ?? null,
      language: user.language, isActive: user.isActive, createdAt: user.createdAt.toISOString(),
    } : { id: review.userId, email: "", name: "Guest", role: "customer", avatar: null, phone: null, address: null, language: "en", isActive: true, createdAt: new Date().toISOString() },
  };
}

router.get("/reviews", async (req, res): Promise<void> => {
  const params = ListReviewsQueryParams.safeParse(req.query);
  const conditions: any[] = [];
  if (params.success) {
    if (params.data.productId) conditions.push(eq(reviewsTable.productId, Number(params.data.productId)));
    if (params.data.experienceId) conditions.push(eq(reviewsTable.experienceId, Number(params.data.experienceId)));
    if (params.data.status) conditions.push(eq(reviewsTable.status, params.data.status));
  }
  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const reviews = await db.select().from(reviewsTable).where(where).orderBy(desc(reviewsTable.createdAt));
  const rich = await Promise.all(reviews.map(buildReview));
  res.json(rich);
});

router.post("/reviews", async (req, res): Promise<void> => {
  const parsed = CreateReviewBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const userId = (req.session as any).userId ?? 1;
  const [review] = await db.insert(reviewsTable).values({
    userId,
    productId: parsed.data.productId ?? null,
    experienceId: parsed.data.experienceId ?? null,
    rating: parsed.data.rating,
    title: parsed.data.title ?? null,
    comment: parsed.data.comment,
    images: parsed.data.images ?? [],
    isVerifiedPurchase: false,
    status: "pending",
  }).returning();
  res.status(201).json(await buildReview(review));
});

router.patch("/reviews/:id", async (req, res): Promise<void> => {
  const params = UpdateReviewParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const parsed = UpdateReviewBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [review] = await db.update(reviewsTable).set(parsed.data as any).where(eq(reviewsTable.id, params.data.id)).returning();
  if (!review) { res.status(404).json({ error: "Review not found" }); return; }
  res.json(await buildReview(review));
});

export default router;

import { Router, type IRouter } from "express";
import { eq, ilike, and, sql } from "drizzle-orm";
import { db, artisansTable, productsTable, reviewsTable, donationsTable } from "@workspace/db";
import {
  ListArtisansQueryParams,
  GetArtisanParams,
  CreateArtisanBody,
  UpdateArtisanBody,
  UpdateArtisanParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

async function buildArtisan(artisan: typeof artisansTable.$inferSelect) {
  const productCount = await db.select({ count: sql<number>`count(*)` }).from(productsTable).where(eq(productsTable.artisanId, artisan.id));
  const reviews = await db.select().from(reviewsTable).where(eq(reviewsTable.status, "approved"));
  const artisanProductIds = (await db.select({ id: productsTable.id }).from(productsTable).where(eq(productsTable.artisanId, artisan.id))).map(p => p.id);
  const artisanReviews = reviews.filter(r => r.productId !== null && artisanProductIds.includes(r.productId));
  const avgRating = artisanReviews.length > 0 ? artisanReviews.reduce((s, r) => s + r.rating, 0) / artisanReviews.length : null;
  return {
    id: artisan.id, userId: artisan.userId, name: artisan.name, photo: artisan.photo ?? null,
    biography: artisan.biography ?? null, skills: artisan.skills, story: artisan.story ?? null,
    galleryImages: artisan.galleryImages, videoUrl: artisan.videoUrl ?? null,
    productCount: Number(productCount[0]?.count ?? 0), totalSales: artisan.totalSales,
    averageRating: avgRating ? Number(avgRating.toFixed(1)) : null,
    totalDonations: Number(artisan.totalDonations),
    isConservationAmbassador: artisan.isConservationAmbassador,
    createdAt: artisan.createdAt.toISOString(),
  };
}

router.get("/artisans", async (req, res): Promise<void> => {
  const params = ListArtisansQueryParams.safeParse(req.query);
  const page = params.success && params.data.page ? Number(params.data.page) : 1;
  const limit = params.success && params.data.limit ? Number(params.data.limit) : 20;
  const conditions: any[] = [];
  if (params.success && params.data.search) conditions.push(ilike(artisansTable.name, `%${params.data.search}%`));
  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const artisans = await db.select().from(artisansTable).where(where).limit(limit).offset((page - 1) * limit);
  const rich = await Promise.all(artisans.map(buildArtisan));
  res.json(rich);
});

router.post("/artisans", async (req, res): Promise<void> => {
  const parsed = CreateArtisanBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [artisan] = await db.insert(artisansTable).values(parsed.data as any).returning();
  res.status(201).json(await buildArtisan(artisan));
});

router.get("/artisans/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [artisan] = await db.select().from(artisansTable).where(eq(artisansTable.id, id));
  if (!artisan) { res.status(404).json({ error: "Artisan not found" }); return; }
  res.json(await buildArtisan(artisan));
});

router.patch("/artisans/:id", async (req, res): Promise<void> => {
  const params = UpdateArtisanParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const parsed = UpdateArtisanBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [artisan] = await db.update(artisansTable).set(parsed.data as any).where(eq(artisansTable.id, params.data.id)).returning();
  if (!artisan) { res.status(404).json({ error: "Artisan not found" }); return; }
  res.json(await buildArtisan(artisan));
});

export default router;

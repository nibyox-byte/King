import { Router, type IRouter } from "express";
import { eq, ilike, and, gte, lte, sql } from "drizzle-orm";
import { db, experiencesTable, reviewsTable } from "@workspace/db";
import {
  ListExperiencesQueryParams,
  GetExperienceParams,
  CreateExperienceBody,
  UpdateExperienceBody,
  UpdateExperienceParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

async function buildExperience(exp: typeof experiencesTable.$inferSelect) {
  const reviews = await db.select().from(reviewsTable).where(
    and(eq(reviewsTable.experienceId, exp.id), eq(reviewsTable.status, "approved"))
  );
  const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : null;
  return {
    ...exp,
    price: Number(exp.price),
    videoUrl: exp.videoUrl ?? null,
    difficultyLevel: exp.difficultyLevel ?? null,
    meetingPoint: exp.meetingPoint ?? null,
    cancellationPolicy: exp.cancellationPolicy ?? null,
    averageRating: avgRating ? Number(avgRating.toFixed(1)) : null,
    reviewCount: reviews.length,
    createdAt: exp.createdAt.toISOString(),
    updatedAt: undefined,
  };
}

router.get("/experiences", async (req, res): Promise<void> => {
  const params = ListExperiencesQueryParams.safeParse(req.query);
  const page = params.success && params.data.page ? Number(params.data.page) : 1;
  const limit = params.success && params.data.limit ? Number(params.data.limit) : 12;
  const conditions: any[] = [eq(experiencesTable.active, true)];
  if (params.success) {
    const { search, type, minPrice, maxPrice } = params.data;
    if (search) conditions.push(ilike(experiencesTable.title, `%${search}%`));
    if (type) conditions.push(eq(experiencesTable.type, type));
    if (minPrice) conditions.push(gte(experiencesTable.price, Number(minPrice)));
    if (maxPrice) conditions.push(lte(experiencesTable.price, Number(maxPrice)));
  }
  const where = and(...conditions);
  const total = await db.select({ count: sql<number>`count(*)` }).from(experiencesTable).where(where);
  const experiences = await db.select().from(experiencesTable).where(where).limit(limit).offset((page - 1) * limit);
  const rich = await Promise.all(experiences.map(buildExperience));
  res.json({ experiences: rich, total: Number(total[0]?.count ?? 0), page, totalPages: Math.ceil(Number(total[0]?.count ?? 0) / limit) });
});

router.post("/experiences", async (req, res): Promise<void> => {
  const parsed = CreateExperienceBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const slug = parsed.data.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") + "-" + Date.now();
  const [exp] = await db.insert(experiencesTable).values({ ...parsed.data, slug } as any).returning();
  res.status(201).json(await buildExperience(exp));
});

router.get("/experiences/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [exp] = await db.select().from(experiencesTable).where(eq(experiencesTable.id, id));
  if (!exp) { res.status(404).json({ error: "Experience not found" }); return; }
  res.json(await buildExperience(exp));
});

router.patch("/experiences/:id", async (req, res): Promise<void> => {
  const params = UpdateExperienceParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const parsed = UpdateExperienceBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [exp] = await db.update(experiencesTable).set(parsed.data as any).where(eq(experiencesTable.id, params.data.id)).returning();
  if (!exp) { res.status(404).json({ error: "Experience not found" }); return; }
  res.json(await buildExperience(exp));
});

export default router;

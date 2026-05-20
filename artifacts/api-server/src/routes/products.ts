import { Router, type IRouter } from "express";
import { eq, and, gte, lte, ilike, desc, asc, sql } from "drizzle-orm";
import { db, productsTable, artisansTable, categoriesTable, reviewsTable } from "@workspace/db";
import {
  ListProductsQueryParams,
  GetProductParams,
  CreateProductBody,
  UpdateProductBody,
  UpdateProductParams,
  DeleteProductParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

async function buildProduct(product: typeof productsTable.$inferSelect) {
  const [artisan] = await db.select().from(artisansTable).where(eq(artisansTable.id, product.artisanId));
  const [category] = await db.select().from(categoriesTable).where(eq(categoriesTable.id, product.categoryId));
  const reviews = await db.select().from(reviewsTable).where(
    and(eq(reviewsTable.productId, product.id), eq(reviewsTable.status, "approved"))
  );
  const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : null;
  const productCount = await db.select({ count: sql<number>`count(*)` }).from(productsTable).where(eq(productsTable.artisanId, product.artisanId));
  return {
    ...product,
    price: Number(product.price),
    discountPrice: product.discountPrice ? Number(product.discountPrice) : null,
    weight: product.weight ? Number(product.weight) : null,
    averageRating: avgRating ? Number(avgRating.toFixed(1)) : null,
    reviewCount: reviews.length,
    createdAt: product.createdAt.toISOString(),
    updatedAt: undefined,
    artisan: artisan ? {
      id: artisan.id, userId: artisan.userId, name: artisan.name, photo: artisan.photo ?? null,
      biography: artisan.biography ?? null, skills: artisan.skills, story: artisan.story ?? null,
      galleryImages: artisan.galleryImages, videoUrl: artisan.videoUrl ?? null,
      productCount: Number(productCount[0]?.count ?? 0), totalSales: artisan.totalSales,
      averageRating: null, totalDonations: Number(artisan.totalDonations),
      isConservationAmbassador: artisan.isConservationAmbassador,
      createdAt: artisan.createdAt.toISOString(),
    } : undefined,
    category: category ? {
      id: category.id, name: category.name, slug: category.slug,
      description: category.description ?? null, image: category.image ?? null, productCount: 0,
    } : undefined,
  };
}

router.get("/products", async (req, res): Promise<void> => {
  const params = ListProductsQueryParams.safeParse(req.query);
  const page = params.success && params.data.page ? Number(params.data.page) : 1;
  const limit = params.success && params.data.limit ? Number(params.data.limit) : 12;
  const conditions: any[] = [];
  if (params.success) {
    const { search, categoryId, artisanId, featured, minPrice, maxPrice } = params.data;
    if (search) conditions.push(ilike(productsTable.name, `%${search}%`));
    if (categoryId) conditions.push(eq(productsTable.categoryId, Number(categoryId)));
    if (artisanId) conditions.push(eq(productsTable.artisanId, Number(artisanId)));
    if (featured === true || featured === "true" as any) conditions.push(eq(productsTable.featured, true));
    if (minPrice) conditions.push(gte(productsTable.price, Number(minPrice)));
    if (maxPrice) conditions.push(lte(productsTable.price, Number(maxPrice)));
  }
  conditions.push(eq(productsTable.active, true));
  const where = conditions.length > 1 ? and(...conditions) : conditions[0];
  const total = await db.select({ count: sql<number>`count(*)` }).from(productsTable).where(where);
  const products = await db.select().from(productsTable).where(where)
    .limit(limit).offset((page - 1) * limit).orderBy(desc(productsTable.createdAt));
  const rich = await Promise.all(products.map(buildProduct));
  res.json({ products: rich, total: Number(total[0]?.count ?? 0), page, totalPages: Math.ceil(Number(total[0]?.count ?? 0) / limit) });
});

router.get("/products/featured", async (req, res): Promise<void> => {
  const products = await db.select().from(productsTable)
    .where(and(eq(productsTable.featured, true), eq(productsTable.active, true))).limit(8);
  const rich = await Promise.all(products.map(buildProduct));
  res.json(rich);
});

router.post("/products", async (req, res): Promise<void> => {
  const parsed = CreateProductBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const slug = parsed.data.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") + "-" + Date.now();
  const [product] = await db.insert(productsTable).values({ ...parsed.data, slug } as any).returning();
  res.status(201).json(await buildProduct(product));
});

router.get("/products/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [product] = await db.select().from(productsTable).where(eq(productsTable.id, id));
  if (!product) { res.status(404).json({ error: "Product not found" }); return; }
  res.json(await buildProduct(product));
});

router.patch("/products/:id", async (req, res): Promise<void> => {
  const params = UpdateProductParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const parsed = UpdateProductBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [product] = await db.update(productsTable).set(parsed.data as any).where(eq(productsTable.id, params.data.id)).returning();
  if (!product) { res.status(404).json({ error: "Product not found" }); return; }
  res.json(await buildProduct(product));
});

router.delete("/products/:id", async (req, res): Promise<void> => {
  const params = DeleteProductParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const [product] = await db.delete(productsTable).where(eq(productsTable.id, params.data.id)).returning();
  if (!product) { res.status(404).json({ error: "Product not found" }); return; }
  res.json({ message: "Product deleted" });
});

export default router;

import { Router } from "express";
import { asyncHandler, HttpError } from "../http.js";
import { todayISO } from "../lib/dates.js";
import { presentProduct } from "../lib/present.js";
import { parseProductInput, type ProductInput } from "../lib/validate.js";
import { requireAuth } from "../middleware/auth.js";
import { Product } from "../models/Product.js";

const router = Router();
router.use(requireAuth);

function uid(userId?: string) {
  if (!userId) throw new HttpError(401, "Sign in to continue");
  return userId;
}

function toDocument(data: ProductInput) {
  return {
    name: data.name,
    brand: data.brand ?? null,
    category: data.category ?? "Other",
    quantity: data.quantity ?? null,
    unit: data.unit ?? null,
    price: data.price ?? null,
    purchaseDate: data.purchaseDate ?? null,
    expiryDate: data.expiryDate ?? null,
    useByDate: data.useByDate ?? null,
    openedDate: data.openedDate ?? null,
    manufactureDate: data.manufactureDate ?? null,
    storageLocation: data.storageLocation ?? "pantry",
    ingredients: data.ingredients ?? null,
    allergens: data.allergens ?? [],
    notes: data.notes ?? null,
    barcode: data.barcode ?? null,
    batch: data.batch ?? null,
    imageUrl: data.imageUrl ?? null,
    scanId: data.scanId ?? null,
    nutrition: {
      servingSize: data.nutrition?.servingSize ?? null,
      calories: data.nutrition?.calories ?? null,
      protein: data.nutrition?.protein ?? null,
      carbohydrates: data.nutrition?.carbohydrates ?? null,
      fat: data.nutrition?.fat ?? null,
      sugar: data.nutrition?.sugar ?? null,
      sodium: data.nutrition?.sodium ?? null,
      fiber: data.nutrition?.fiber ?? null,
    },
  };
}

async function findOwn(userId: string, id: string) {
  if (!/^[a-f\d]{24}$/i.test(id)) throw new HttpError(404, "Product not found");
  const product = await Product.findOne({ _id: id, userId });
  if (!product) throw new HttpError(404, "Product not found");
  return product;
}

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const status = typeof req.query.status === "string" ? req.query.status : "active";
    const query: { userId: string; status?: string } = { userId: uid(req.userId) };
    if (status !== "all") query.status = status;
    const products = await Product.find(query);
    const presented = products.map((product) => presentProduct(product));
    presented.sort((a, b) => {
      if (a.effectiveDate == null) return 1;
      if (b.effectiveDate == null) return -1;
      return String(a.effectiveDate).localeCompare(String(b.effectiveDate));
    });
    res.json(presented);
  }),
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const parsed = parseProductInput(req.body);
    if (!parsed.ok) throw new HttpError(400, parsed.message);
    const product = await Product.create({ userId: uid(req.userId), ...toDocument(parsed.data) });
    res.status(201).json(presentProduct(product));
  }),
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const product = await findOwn(uid(req.userId), req.params.id);
    res.json(presentProduct(product));
  }),
);

router.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const product = await findOwn(uid(req.userId), req.params.id);
    const parsed = parseProductInput(req.body);
    if (!parsed.ok) throw new HttpError(400, parsed.message);
    Object.assign(product, toDocument(parsed.data));
    await product.save();
    res.json(presentProduct(product));
  }),
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const product = await findOwn(uid(req.userId), req.params.id);
    await product.deleteOne();
    res.json({ ok: true });
  }),
);

router.post(
  "/:id/consume",
  asyncHandler(async (req, res) => {
    const product = await findOwn(uid(req.userId), req.params.id);
    if (product.status !== "active") throw new HttpError(400, "That item is already out of the kitchen");
    product.status = "consumed";
    product.consumedAt = new Date();
    await product.save();
    res.json(presentProduct(product));
  }),
);

router.post(
  "/:id/discard",
  asyncHandler(async (req, res) => {
    const product = await findOwn(uid(req.userId), req.params.id);
    if (product.status !== "active") throw new HttpError(400, "That item is already out of the kitchen");
    product.status = "discarded";
    product.discardedAt = new Date();
    await product.save();
    res.json(presentProduct(product));
  }),
);

router.post(
  "/:id/open",
  asyncHandler(async (req, res) => {
    const product = await findOwn(uid(req.userId), req.params.id);
    if (!product.openedDate) product.openedDate = todayISO();
    await product.save();
    res.json(presentProduct(product));
  }),
);

export default router;

import { Router } from "express";
import { z } from "zod";
import { asyncHandler, HttpError } from "../http.js";
import { requireAuth } from "../middleware/auth.js";
import { Product } from "../models/Product.js";
import { ShoppingItem } from "../models/ShoppingItem.js";

const router = Router();
router.use(requireAuth);

function present(item: { _id: unknown; name: string; checked: boolean; source: string }) {
  return { id: String(item._id), name: item.name, checked: item.checked, source: item.source };
}

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const userId = req.userId;
    const items = await ShoppingItem.find({ userId }).sort({ checked: 1, createdAt: -1 });
    const [active, consumed] = await Promise.all([
      Product.find({ userId, status: "active" }),
      Product.find({ userId, status: "consumed" }).sort({ consumedAt: -1 }).limit(80),
    ]);
    const inKitchen = new Set(active.map((product) => product.name.trim().toLowerCase()));
    const counts = new Map<string, { name: string; count: number }>();
    for (const product of consumed) {
      const key = product.name.trim().toLowerCase();
      const current = counts.get(key) ?? { name: product.name.trim(), count: 0 };
      current.count += 1;
      counts.set(key, current);
    }
    const existing = new Set(items.map((item) => item.name.trim().toLowerCase()));
    const suggestions = [...counts.values()]
      .filter((item) => item.count >= 1 && !inKitchen.has(item.name.toLowerCase()) && !existing.has(item.name.toLowerCase()))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
    res.json({ items: items.map(present), suggestions });
  }),
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const body = z.object({ name: z.string().trim().min(1).max(80), source: z.enum(["manual", "suggestion"]).optional() }).parse(req.body);
    const item = await ShoppingItem.create({
      userId: req.userId,
      name: body.name,
      source: body.source ?? "manual",
    });
    res.status(201).json(present(item));
  }),
);

router.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const item = await ShoppingItem.findOne({ _id: req.params.id, userId: req.userId });
    if (!item) throw new HttpError(404, "Item not found");
    const body = z.object({ checked: z.boolean().optional(), name: z.string().trim().min(1).max(80).optional() }).parse(req.body);
    if (body.checked != null) item.checked = body.checked;
    if (body.name) item.name = body.name;
    await item.save();
    res.json(present(item));
  }),
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const item = await ShoppingItem.findOne({ _id: req.params.id, userId: req.userId });
    if (!item) throw new HttpError(404, "Item not found");
    await item.deleteOne();
    res.json({ ok: true });
  }),
);

export default router;

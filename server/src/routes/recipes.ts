import { Router } from "express";
import { asyncHandler, HttpError } from "../http.js";
import { presentProduct } from "../lib/present.js";
import { matchRecipes } from "../lib/recipes.js";
import { requireAuth } from "../middleware/auth.js";
import { Product } from "../models/Product.js";
import { aiConfigured, inventRecipe } from "../services/ai.js";

const router = Router();
router.use(requireAuth);

async function pantry(userId: string) {
  const products = await Product.find({ userId, status: "active" });
  return products.map((product) => presentProduct(product));
}

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const mode = req.query.mode === "pantry" ? "pantry" : "expiring";
    const items = await pantry(req.userId!);
    res.json({
      mode,
      ai: aiConfigured(),
      recipes: matchRecipes(
        items.map((item) => ({
          id: item.id,
          name: String(item.name),
          daysRemaining: item.daysRemaining,
          freshness: item.freshness,
        })),
        mode,
      ),
    });
  }),
);

router.post(
  "/generate",
  asyncHandler(async (req, res) => {
    if (!aiConfigured()) {
      throw new HttpError(501, "Add OPENAI_API_KEY to invent a custom recipe. Saved matches still work.");
    }
    const items = await pantry(req.userId!);
    const pressing = items.filter((item) => item.daysRemaining != null && item.daysRemaining <= 7);
    const source = (pressing.length >= 2 ? pressing : items).slice(0, 12);
    if (source.length < 2) throw new HttpError(400, "Add at least two foods before asking for a recipe");
    try {
      const recipe = await inventRecipe(
        source.map((item) => ({ name: String(item.name), daysRemaining: item.daysRemaining })),
      );
      const uses = recipe.uses
        .map((name) => source.find((item) => String(item.name).toLowerCase() === name.toLowerCase()))
        .filter((item): item is (typeof source)[number] => Boolean(item))
        .map((item) => ({ id: item.id, name: String(item.name), daysRemaining: item.daysRemaining }));
      res.json({ ...recipe, uses });
    } catch (error) {
      console.error(error);
      throw new HttpError(502, "A custom recipe could not be generated. Try a saved match instead.");
    }
  }),
);

router.post(
  "/cook",
  asyncHandler(async (req, res) => {
    const ids = Array.isArray(req.body?.productIds) ? req.body.productIds.map(String) : [];
    const valid = ids.filter((id: string) => /^[a-f\d]{24}$/i.test(id));
    if (!valid.length) throw new HttpError(400, "Choose the ingredients you used");
    const products = await Product.find({ _id: { $in: valid }, userId: req.userId, status: "active" });
    const now = new Date();
    await Promise.all(
      products.map(async (product) => {
        product.status = "consumed";
        product.consumedAt = now;
        await product.save();
      }),
    );
    res.json({ consumed: products.length });
  }),
);

export default router;

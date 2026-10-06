import { CATEGORIES, emptyExtracted, type Category, type ExtractedProduct } from "./catalog.js";

type OffProduct = {
  product_name?: string;
  product_name_en?: string;
  brands?: string;
  quantity?: string;
  categories_tags?: string[];
  ingredients_text?: string;
  ingredients_text_en?: string;
  allergens_tags?: string[];
  image_front_url?: string;
  nutriments?: Record<string, number | string>;
  serving_size?: string;
};

function round1(value: number) {
  return Math.round(value * 10) / 10;
}

function asNumber(value: number | string | undefined) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  return null;
}

function categoryFromTags(tags: string[] = []): Category {
  const text = tags.join(" ");
  const rules: [RegExp, Category][] = [
    [/frozen/, "Frozen"],
    [/milks|dairies|yogurts|cheeses|paneer/, "Dairy"],
    [/meats|chicken|poultry/, "Meat"],
    [/seafood|fishes/, "Seafood"],
    [/breads|bakery/, "Bakery"],
    [/beverages|drinks/, "Beverages"],
    [/snacks|biscuits|chocolates/, "Snacks"],
    [/sauces|condiments/, "Condiments"],
    [/fruits|vegetables|plant-based/, "Produce"],
  ];
  for (const [pattern, category] of rules) {
    if (pattern.test(text)) return category;
  }
  return CATEGORIES.includes("Pantry") ? "Pantry" : "Other";
}

function storageFor(category: Category): ExtractedProduct["storageLocation"] {
  if (category === "Frozen") return "freezer";
  if (["Dairy", "Meat", "Seafood", "Produce"].includes(category)) return "fridge";
  return "pantry";
}

function parseQuantity(quantity?: string) {
  if (!quantity) return { quantity: null as number | null, unit: null as string | null };
  const match = quantity.trim().match(/^(\d+(?:[.,]\d+)?)\s*([a-zA-Z]+)?/);
  if (!match) return { quantity: null, unit: null };
  const amount = Number(match[1].replace(",", "."));
  const raw = (match[2] ?? "").toLowerCase();
  const units: Record<string, string> = { ml: "ml", l: "L", lt: "L", g: "g", kg: "kg" };
  return {
    quantity: Number.isFinite(amount) ? amount : null,
    unit: units[raw] ?? (match[2] ? match[2].toLowerCase() : null),
  };
}

function titleCase(value: string) {
  return value
    .replace(/^en:/, "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function mapOpenFoodFacts(product: OffProduct): ExtractedProduct {
  const extracted = emptyExtracted();
  const nutriments = product.nutriments ?? {};
  const perServing = asNumber(nutriments["energy-kcal_serving"]) != null;
  const suffix = perServing ? "serving" : "100g";
  const pick = (key: string) => asNumber(nutriments[`${key}_${suffix}`]);
  const sodiumGrams = pick("sodium");
  const parsedQty = parseQuantity(product.quantity);
  const category = categoryFromTags(product.categories_tags);

  extracted.name = product.product_name_en || product.product_name || null;
  extracted.brand = product.brands?.split(",")[0]?.trim() || null;
  extracted.category = category;
  extracted.quantity = parsedQty.quantity;
  extracted.unit = parsedQty.unit;
  extracted.storageLocation = storageFor(category);
  extracted.ingredients = product.ingredients_text_en || product.ingredients_text || null;
  extracted.allergens = (product.allergens_tags ?? []).map(titleCase).filter(Boolean);
  extracted.imageUrl = product.image_front_url ?? null;
  extracted.nutrition = {
    servingSize: perServing ? product.serving_size || "Per serving" : "Per 100 g",
    calories: pick("energy-kcal") == null ? null : Math.round(pick("energy-kcal") as number),
    protein: pick("proteins") == null ? null : round1(pick("proteins") as number),
    carbohydrates: pick("carbohydrates") == null ? null : round1(pick("carbohydrates") as number),
    fat: pick("fat") == null ? null : round1(pick("fat") as number),
    sugar: pick("sugars") == null ? null : round1(pick("sugars") as number),
    fiber: pick("fiber") == null ? null : round1(pick("fiber") as number),
    sodium: sodiumGrams == null ? null : Math.round(sodiumGrams * 1000),
  };
  const hasNutrition = Object.values(extracted.nutrition).some((value) => typeof value === "number");
  extracted.confidence = {
    expiryDate: "missing",
    nutrition: hasNutrition ? "high" : "missing",
  };
  return extracted;
}

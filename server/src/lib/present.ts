import { daysUntil, earlierDate } from "./dates.js";
import { scoreNutrition, type Nutrition } from "./nutrition.js";

export type Freshness =
  | "consumed"
  | "discarded"
  | "expired"
  | "today"
  | "soon"
  | "week"
  | "fresh"
  | "undated";

export function freshnessOf(status: string, days: number | null): Freshness {
  if (status === "consumed") return "consumed";
  if (status === "discarded") return "discarded";
  if (days === null) return "undated";
  if (days < 0) return "expired";
  if (days === 0) return "today";
  if (days <= 3) return "soon";
  if (days <= 7) return "week";
  return "fresh";
}

export type PresentedProduct = {
  id: string;
  name: string;
  brand: string | null;
  category: string | null;
  quantity: number | null;
  unit: string | null;
  price: number | null;
  purchaseDate: string | null;
  expiryDate: string | null;
  useByDate: string | null;
  openedDate: string | null;
  manufactureDate: string | null;
  storageLocation: "pantry" | "fridge" | "freezer";
  nutrition: Nutrition | null;
  ingredients: string | null;
  allergens: string[];
  imageUrl: string | null;
  barcode: string | null;
  batch: string | null;
  notes: string | null;
  status: string;
  effectiveDate: string | null;
  daysRemaining: number | null;
  freshness: Freshness;
  nutritionScore: number | null;
  nutritionNotes: string[];
};

function text(value: unknown) {
  return typeof value === "string" && value ? value : null;
}

function amount(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function presentProduct(product: { toObject(): object }): PresentedProduct {
  const raw = product.toObject() as Record<string, unknown>;
  const expiryDate = text(raw.expiryDate);
  const useByDate = text(raw.useByDate);
  const effectiveDate = earlierDate(expiryDate, useByDate);
  const daysRemaining = daysUntil(effectiveDate);
  const status = text(raw.status) ?? "active";
  const storage = text(raw.storageLocation);
  const nutritionInput = (raw.nutrition ?? null) as Nutrition | null;
  const nutrition = scoreNutrition(nutritionInput);
  const allergens = Array.isArray(raw.allergens) ? raw.allergens.filter((item): item is string => typeof item === "string") : [];

  return {
    id: String(raw._id),
    name: text(raw.name) ?? "Untitled",
    brand: text(raw.brand),
    category: text(raw.category),
    quantity: amount(raw.quantity),
    unit: text(raw.unit),
    price: amount(raw.price),
    purchaseDate: text(raw.purchaseDate),
    expiryDate,
    useByDate,
    openedDate: text(raw.openedDate),
    manufactureDate: text(raw.manufactureDate),
    storageLocation: storage === "fridge" || storage === "freezer" || storage === "pantry" ? storage : "pantry",
    nutrition: nutritionInput,
    ingredients: text(raw.ingredients),
    allergens,
    imageUrl: text(raw.imageUrl),
    barcode: text(raw.barcode),
    batch: text(raw.batch),
    notes: text(raw.notes),
    status,
    effectiveDate,
    daysRemaining,
    freshness: freshnessOf(status, daysRemaining),
    nutritionScore: nutrition.score,
    nutritionNotes: nutrition.notes,
  };
}

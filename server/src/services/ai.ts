import fs from "fs/promises";
import path from "path";
import { env } from "../config.js";
import { CATEGORIES, emptyExtracted, STORAGES, type ExtractedProduct } from "../lib/catalog.js";
import { isISODate } from "../lib/dates.js";

type ChatContent = { type: "text"; text: string } | { type: "image_url"; image_url: { url: string } };

async function chat(content: ChatContent[]) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.openaiKey}`,
      "Content-Type": "application/json",
    },
    signal: AbortSignal.timeout(40000),
    body: JSON.stringify({
      model: env.openaiModel,
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [{ role: "user", content }],
    }),
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail.slice(0, 240) || "The model request failed");
  }
  const payload = (await response.json()) as { choices?: { message?: { content?: string } }[] };
  const text = payload.choices?.[0]?.message?.content ?? "{}";
  return JSON.parse(text) as Record<string, unknown>;
}

function asText(value: unknown, max = 500) {
  return typeof value === "string" && value.trim() ? value.trim().slice(0, max) : null;
}

function asNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) return Number(value);
  return null;
}

function asDate(value: unknown) {
  const text = asText(value, 20);
  return text && isISODate(text) ? text : null;
}

function asEnum<T extends string>(value: unknown, allowed: readonly T[]) {
  const text = asText(value, 40);
  return text && (allowed as readonly string[]).includes(text) ? (text as T) : null;
}

export function aiConfigured() {
  return Boolean(env.openaiKey);
}

export async function extractLabel(filePath: string): Promise<ExtractedProduct> {
  const bytes = await fs.readFile(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const mime = ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : ext === ".gif" ? "image/gif" : "image/jpeg";
  const dataUrl = `data:${mime};base64,${bytes.toString("base64")}`;
  const raw = await chat([
    {
      type: "text",
      text: `Extract a grocery product label into JSON. Never invent an expiry date, batch, or nutrition number. Use null when a field is unreadable.
Shape:
{
  "name": string | null,
  "brand": string | null,
  "category": "Dairy" | "Produce" | "Meat" | "Seafood" | "Bakery" | "Pantry" | "Frozen" | "Beverages" | "Snacks" | "Condiments" | "Other" | null,
  "quantity": number | null,
  "unit": string | null,
  "expiryDate": "YYYY-MM-DD" | null,
  "manufactureDate": "YYYY-MM-DD" | null,
  "batch": string | null,
  "ingredients": string | null,
  "allergens": string[],
  "storageLocation": "pantry" | "fridge" | "freezer" | null,
  "nutrition": {
    "servingSize": string | null,
    "calories": number | null,
    "protein": number | null,
    "carbohydrates": number | null,
    "fat": number | null,
    "sugar": number | null,
    "sodium": number | null,
    "fiber": number | null
  },
  "confidence": {
    "expiryDate": "high" | "low" | "missing",
    "nutrition": "high" | "low" | "missing"
  }
}
Calories are kcal. Protein, carbohydrates, fat, sugar, and fiber are grams. Sodium is milligrams. Numbers are per the printed serving.`,
    },
    { type: "image_url", image_url: { url: dataUrl } },
  ]);

  const extracted = emptyExtracted();
  const nutrition = (raw.nutrition ?? {}) as Record<string, unknown>;
  const confidence = (raw.confidence ?? {}) as Record<string, unknown>;
  extracted.name = asText(raw.name, 120);
  extracted.brand = asText(raw.brand, 120);
  extracted.category = asEnum(raw.category, CATEGORIES);
  extracted.quantity = asNumber(raw.quantity);
  extracted.unit = asText(raw.unit, 20);
  extracted.expiryDate = asDate(raw.expiryDate);
  extracted.manufactureDate = asDate(raw.manufactureDate);
  extracted.batch = asText(raw.batch, 80);
  extracted.ingredients = asText(raw.ingredients, 4000);
  extracted.allergens = Array.isArray(raw.allergens)
    ? raw.allergens.map((item) => asText(item, 40)).filter((item): item is string => Boolean(item)).slice(0, 20)
    : [];
  extracted.storageLocation = asEnum(raw.storageLocation, STORAGES);
  extracted.nutrition = {
    servingSize: asText(nutrition.servingSize, 80),
    calories: asNumber(nutrition.calories),
    protein: asNumber(nutrition.protein),
    carbohydrates: asNumber(nutrition.carbohydrates),
    fat: asNumber(nutrition.fat),
    sugar: asNumber(nutrition.sugar),
    sodium: asNumber(nutrition.sodium),
    fiber: asNumber(nutrition.fiber),
  };
  const expiryConfidence = asEnum(confidence.expiryDate, ["high", "low", "missing"] as const);
  const nutritionConfidence = asEnum(confidence.nutrition, ["high", "low", "missing"] as const);
  extracted.confidence = {
    expiryDate: extracted.expiryDate ? expiryConfidence ?? "low" : "missing",
    nutrition: nutritionConfidence ?? "missing",
  };
  return extracted;
}

export async function inventRecipe(items: { name: string; daysRemaining: number | null }[]) {
  const list = items
    .map((item) => `- ${item.name}${item.daysRemaining == null ? "" : ` (${item.daysRemaining} days left)`}`)
    .join("\n");
  const raw = await chat([
    {
      type: "text",
      text: `Create one home-cooking recipe that uses as many expiring foods as possible. Reply with JSON:
{"name": string, "minutes": number, "uses": string[], "steps": string[], "note": string}
The uses array must only contain names copied from this pantry list. Do not add medical advice.
Pantry:
${list}`,
    },
  ]);
  const allowed = new Map(items.map((item) => [item.name.toLowerCase(), item.name]));
  const uses = Array.isArray(raw.uses)
    ? raw.uses
        .map((name) => (typeof name === "string" ? allowed.get(name.trim().toLowerCase()) : undefined))
        .filter((name): name is string => Boolean(name))
    : [];
  const steps = Array.isArray(raw.steps) ? raw.steps.map((step) => asText(step, 240)).filter((step): step is string => Boolean(step)).slice(0, 8) : [];
  return {
    name: asText(raw.name, 80) || "Pantry plate",
    minutes: Math.max(5, Math.min(120, Math.round(asNumber(raw.minutes) ?? 20))),
    uses,
    steps: steps.length ? steps : ["Cook the selected ingredients simply and season to taste."],
    note: asText(raw.note, 180),
  };
}

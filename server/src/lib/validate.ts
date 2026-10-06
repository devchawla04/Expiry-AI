import { z } from "zod";
import { CATEGORIES, STORAGES } from "./catalog.js";
import { isISODate } from "./dates.js";

const dateField = z
  .union([z.string(), z.null()])
  .optional()
  .transform((value, ctx) => {
    if (value == null || value.trim() === "") return null;
    if (!isISODate(value)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Use a real calendar date" });
      return z.NEVER;
    }
    return value;
  });

const textField = (max: number) =>
  z
    .union([z.string(), z.null()])
    .optional()
    .transform((value) => {
      if (value == null) return null;
      const trimmed = value.trim();
      return trimmed ? trimmed.slice(0, max) : null;
    });

const numberField = z
  .union([z.number(), z.string(), z.null()])
  .optional()
  .transform((value) => {
    if (value == null || value === "") return null;
    const n = typeof value === "number" ? value : Number(value);
    if (!Number.isFinite(n)) return null;
    return n;
  });

export const productInputSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  brand: textField(120),
  category: z.enum(CATEGORIES).optional().nullable(),
  quantity: numberField,
  unit: textField(20),
  price: numberField,
  purchaseDate: dateField,
  expiryDate: dateField,
  useByDate: dateField,
  openedDate: dateField,
  manufactureDate: dateField,
  storageLocation: z.enum(STORAGES).optional().nullable(),
  ingredients: textField(4000),
  allergens: z.array(z.string().trim().min(1).max(40)).max(20).optional(),
  notes: textField(1000),
  barcode: textField(32),
  batch: textField(80),
  imageUrl: z
    .union([z.string(), z.null()])
    .optional()
    .transform((value) => {
      if (!value?.trim()) return null;
      const url = value.trim();
      const allowed =
        url.startsWith("/uploads/") ||
        url.startsWith("https://images.openfoodfacts.org/") ||
        url.startsWith("https://static.openfoodfacts.org/");
      return allowed ? url : null;
    }),
  scanId: z
    .union([z.string(), z.null()])
    .optional()
    .transform((value) => (value && /^[a-f\d]{24}$/i.test(value) ? value : null)),
  nutrition: z
    .object({
      servingSize: textField(80),
      calories: numberField,
      protein: numberField,
      carbohydrates: numberField,
      fat: numberField,
      sugar: numberField,
      sodium: numberField,
      fiber: numberField,
    })
    .optional(),
});

export type ProductInput = z.infer<typeof productInputSchema>;

export function parseProductInput(body: unknown) {
  const parsed = productInputSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message || "Check the product details and try again";
    return { ok: false as const, message: message === "Invalid input" ? "Check the dates and try again" : message };
  }
  const data = parsed.data;
  if (data.price != null && data.price < 0) return { ok: false as const, message: "Price cannot be negative" };
  if (data.quantity != null && data.quantity <= 0) return { ok: false as const, message: "Quantity should be greater than zero" };
  return { ok: true as const, data };
}

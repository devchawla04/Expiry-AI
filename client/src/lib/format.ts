import type { FormState, Freshness, Product } from "./types";

export const CATEGORIES = [
  "Dairy",
  "Produce",
  "Meat",
  "Seafood",
  "Bakery",
  "Pantry",
  "Frozen",
  "Beverages",
  "Snacks",
  "Condiments",
  "Other",
] as const;

export function emptyForm(): FormState {
  return {
    name: "",
    brand: "",
    category: "Other",
    quantity: "",
    unit: "pcs",
    price: "",
    expiryDate: "",
    purchaseDate: "",
    openedDate: "",
    useByDate: "",
    manufactureDate: "",
    storageLocation: "pantry",
    ingredients: "",
    allergens: "",
    notes: "",
    barcode: "",
    batch: "",
    imageUrl: "",
    servingSize: "",
    calories: "",
    protein: "",
    carbohydrates: "",
    fat: "",
    sugar: "",
    sodium: "",
    fiber: "",
  };
}

export function isoDate(offset = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function money(amount: number, currency = "INR") {
  return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

export function greeting(name: string) {
  const hour = new Date().getHours();
  const hello = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  return `${hello}, ${name.split(" ")[0] || "there"}`;
}

export function expiryLabel(days: number | null) {
  if (days === null) return "No expiry set";
  if (days === 0) return "Expires today";
  if (days === 1) return "Expires tomorrow";
  if (days > 1) return `${days} days left`;
  if (days === -1) return "Expired yesterday";
  return `Expired ${Math.abs(days)} days ago`;
}

export function prettyDate(iso?: string | null) {
  if (!iso) return "Not set";
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function quantityLabel(product: { quantity?: number | null; unit?: string | null }) {
  if (product.quantity == null) return "";
  return `${product.quantity} ${product.unit ?? ""}`.trim();
}

const FRESHNESS_COPY: Record<Freshness, string> = {
  today: "Use today",
  soon: "Use soon",
  week: "This week",
  fresh: "Fresh",
  expired: "Expired",
  undated: "No date",
  consumed: "Used",
  discarded: "Tossed",
};

export function freshnessCopy(freshness: Freshness) {
  return FRESHNESS_COPY[freshness];
}

export function storageCopy(storage: string) {
  if (storage === "fridge") return "Fridge";
  if (storage === "freezer") return "Freezer";
  return "Pantry";
}

export function similarProducts(name: string, products: Product[]) {
  const incoming = name.trim().toLowerCase();
  if (incoming.length < 3) return [];
  const stop = new Set(["with", "from", "pack", "fresh", "organic", "the", "and"]);
  const words = incoming.split(/\s+/).filter((word) => word.length > 3 && !stop.has(word));
  return products.filter((product) => {
    if (product.status !== "active") return false;
    const current = product.name.toLowerCase();
    if (current === incoming || current.includes(incoming) || incoming.includes(current)) return true;
    return words.some((word) => current.includes(word));
  });
}

export function num(value: string) {
  if (!value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

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

export const STORAGES = ["pantry", "fridge", "freezer"] as const;

export type Category = (typeof CATEGORIES)[number];
export type Storage = (typeof STORAGES)[number];

export type ExtractedProduct = {
  name: string | null;
  brand: string | null;
  category: Category | null;
  quantity: number | null;
  unit: string | null;
  expiryDate: string | null;
  manufactureDate: string | null;
  batch: string | null;
  ingredients: string | null;
  allergens: string[];
  storageLocation: Storage | null;
  barcode: string | null;
  imageUrl: string | null;
  nutrition: {
    servingSize: string | null;
    calories: number | null;
    protein: number | null;
    carbohydrates: number | null;
    fat: number | null;
    sugar: number | null;
    sodium: number | null;
    fiber: number | null;
  };
  confidence: {
    expiryDate: "high" | "low" | "missing";
    nutrition: "high" | "low" | "missing";
  };
};

export function emptyExtracted(): ExtractedProduct {
  return {
    name: null,
    brand: null,
    category: null,
    quantity: null,
    unit: null,
    expiryDate: null,
    manufactureDate: null,
    batch: null,
    ingredients: null,
    allergens: [],
    storageLocation: null,
    barcode: null,
    imageUrl: null,
    nutrition: {
      servingSize: null,
      calories: null,
      protein: null,
      carbohydrates: null,
      fat: null,
      sugar: null,
      sodium: null,
      fiber: null,
    },
    confidence: { expiryDate: "missing", nutrition: "missing" },
  };
}

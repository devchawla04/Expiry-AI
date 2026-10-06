export type User = {
  id: string;
  name: string;
  email: string;
  currency: string;
};

export type Freshness = "consumed" | "discarded" | "expired" | "today" | "soon" | "week" | "fresh" | "undated";

export type Nutrition = {
  servingSize?: string | null;
  calories?: number | null;
  protein?: number | null;
  carbohydrates?: number | null;
  fat?: number | null;
  sugar?: number | null;
  sodium?: number | null;
  fiber?: number | null;
};

export type Product = {
  id: string;
  name: string;
  brand?: string | null;
  category?: string | null;
  quantity?: number | null;
  unit?: string | null;
  price?: number | null;
  purchaseDate?: string | null;
  expiryDate?: string | null;
  useByDate?: string | null;
  openedDate?: string | null;
  manufactureDate?: string | null;
  storageLocation: "pantry" | "fridge" | "freezer";
  nutrition?: Nutrition | null;
  ingredients?: string | null;
  allergens?: string[];
  imageUrl?: string | null;
  barcode?: string | null;
  batch?: string | null;
  notes?: string | null;
  status: "active" | "consumed" | "discarded";
  effectiveDate?: string | null;
  daysRemaining: number | null;
  freshness: Freshness;
  nutritionScore: number | null;
  nutritionNotes: string[];
};

export type Extracted = {
  name: string | null;
  brand: string | null;
  category: string | null;
  quantity: number | null;
  unit: string | null;
  expiryDate: string | null;
  manufactureDate: string | null;
  batch: string | null;
  ingredients: string | null;
  allergens: string[];
  storageLocation: "pantry" | "fridge" | "freezer" | null;
  barcode: string | null;
  imageUrl: string | null;
  nutrition: Required<{
    servingSize: string | null;
    calories: number | null;
    protein: number | null;
    carbohydrates: number | null;
    fat: number | null;
    sugar: number | null;
    sodium: number | null;
    fiber: number | null;
  }>;
  confidence: {
    expiryDate: "high" | "low" | "missing";
    nutrition: "high" | "low" | "missing";
  };
};

export type ScanResult = {
  scanId: string;
  imageUrl: string | null;
  extracted: Extracted;
  warning: string | null;
  ai: boolean;
};

export type RecipeMatch = {
  id: string;
  name: string;
  emoji: string;
  minutes: number;
  steps: string[];
  used: { id: string; name: string; daysRemaining: number | null }[];
  expiring: { id: string; name: string; daysRemaining: number | null }[];
  missing: string[];
  score: number;
};

export type Insights = {
  counts: {
    active: number;
    expiringSoon: number;
    expired: number;
    consumed: number;
    discarded: number;
    onTime: number;
  };
  value: {
    pantry: number;
    atRisk: number;
    savedAllTime: number;
    savedThisMonth: number;
    wastedThisMonth: number;
    wastedLastMonth: number;
  };
  trend: { month: string; label: string; wasted: number }[];
  wasteChangePct: number | null;
  streak: number;
  xp: number;
  level: { name: string; min: number; next: string | null; nextAt: number | null; progress: number };
  badges: { id: string; name: string; detail: string; earned: boolean }[];
  storage: { pantry: number; fridge: number; freezer: number };
};

export type ShoppingList = {
  items: { id: string; name: string; checked: boolean; source: string }[];
  suggestions: { name: string; count: number }[];
};

export type FormState = {
  name: string;
  brand: string;
  category: string;
  quantity: string;
  unit: string;
  price: string;
  expiryDate: string;
  purchaseDate: string;
  openedDate: string;
  useByDate: string;
  manufactureDate: string;
  storageLocation: "pantry" | "fridge" | "freezer";
  ingredients: string;
  allergens: string;
  notes: string;
  barcode: string;
  batch: string;
  imageUrl: string;
  servingSize: string;
  calories: string;
  protein: string;
  carbohydrates: string;
  fat: string;
  sugar: string;
  sodium: string;
  fiber: string;
};

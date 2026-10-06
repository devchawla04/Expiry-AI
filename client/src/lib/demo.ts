import type { Extracted, Freshness, Insights, Nutrition, Product, RecipeMatch, ShoppingList, User } from "./types";

export const DEMO_EMAIL = "dev@shelfsense.app";
export const DEMO_PASSWORD = "demo1234";
export const DEMO_TOKEN = "shelfsense-local-demo";

const STATE_KEY = "shelfsense_demo_state";

type StoredProduct = Omit<Product, "effectiveDate" | "daysRemaining" | "freshness" | "nutritionScore" | "nutritionNotes"> & {
  consumedAt: string | null;
  discardedAt: string | null;
};

type ShoppingItem = { id: string; name: string; checked: boolean; source: string; createdAt: number };

type DemoState = {
  user: User;
  products: StoredProduct[];
  shopping: ShoppingItem[];
  scans: number;
};

class DemoError extends Error {}

function formatISODate(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function todayISO() {
  return formatISODate(new Date());
}

function addDaysISO(iso: string, days: number) {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, (m ?? 1) - 1, d ?? 1);
  date.setDate(date.getDate() + days);
  return formatISODate(date);
}

function inDays(days: number) {
  return addDaysISO(todayISO(), days);
}

function daysAgo(n: number) {
  const date = new Date();
  date.setDate(date.getDate() - n);
  date.setHours(12, 0, 0, 0);
  return date.toISOString();
}

function daysUntil(iso: string | null | undefined) {
  if (!iso) return null;
  const [ty, tm, td] = todayISO().split("-").map(Number);
  const [y, m, d] = iso.split("-").map(Number);
  return Math.round((Date.UTC(y, (m ?? 1) - 1, d ?? 1) - Date.UTC(ty, (tm ?? 1) - 1, td ?? 1)) / 86400000);
}

function newId() {
  return Array.from(crypto.getRandomValues(new Uint8Array(12)), (b) => b.toString(16).padStart(2, "0")).join("");
}

type Seed = Partial<StoredProduct> & Pick<StoredProduct, "name" | "category" | "storageLocation">;

function seedProduct(seed: Seed): StoredProduct {
  return {
    id: newId(),
    brand: null,
    quantity: null,
    unit: null,
    price: null,
    purchaseDate: null,
    expiryDate: null,
    useByDate: null,
    openedDate: null,
    manufactureDate: null,
    nutrition: null,
    ingredients: null,
    allergens: [],
    imageUrl: null,
    barcode: null,
    batch: null,
    notes: null,
    status: "active",
    consumedAt: null,
    discardedAt: null,
    ...seed,
  };
}

function freshState(): DemoState {
  const kitchen: Seed[] = [
    {
      name: "Taaza milk",
      brand: "Amul",
      category: "Dairy",
      quantity: 1,
      unit: "L",
      price: 65,
      expiryDate: inDays(2),
      storageLocation: "fridge",
      allergens: ["Milk"],
      nutrition: { servingSize: "100 ml", calories: 61, protein: 3.2, carbohydrates: 4.8, fat: 3.2, sugar: 4.8, sodium: 42 },
    },
    { name: "Spinach", category: "Produce", quantity: 200, unit: "g", price: 30, expiryDate: inDays(0), storageLocation: "fridge" },
    { name: "Strawberries", category: "Produce", quantity: 250, unit: "g", price: 90, expiryDate: inDays(1), storageLocation: "fridge" },
    { name: "Sandwich bread", brand: "Britannia", category: "Bakery", quantity: 1, unit: "pack", price: 45, expiryDate: inDays(3), storageLocation: "pantry" },
    { name: "Chicken breast", category: "Meat", quantity: 500, unit: "g", price: 280, expiryDate: inDays(1), storageLocation: "fridge" },
    { name: "Tomatoes", category: "Produce", quantity: 500, unit: "g", price: 40, expiryDate: inDays(2), storageLocation: "fridge" },
    { name: "Cheddar", brand: "Amul", category: "Dairy", quantity: 200, unit: "g", price: 110, expiryDate: inDays(4), storageLocation: "fridge", allergens: ["Milk"] },
    {
      name: "Paneer",
      brand: "Amul",
      category: "Dairy",
      quantity: 200,
      unit: "g",
      price: 90,
      expiryDate: inDays(2),
      storageLocation: "fridge",
      allergens: ["Milk"],
      nutrition: { servingSize: "100 g", calories: 265, protein: 18, carbohydrates: 1.2, fat: 21, sodium: 18 },
    },
    { name: "Eggs", category: "Dairy", quantity: 6, unit: "pcs", price: 48, expiryDate: inDays(10), storageLocation: "fridge" },
    {
      name: "Tomato sauce",
      brand: "Kissan",
      category: "Condiments",
      quantity: 500,
      unit: "g",
      price: 120,
      expiryDate: inDays(240),
      openedDate: inDays(-1),
      useByDate: inDays(6),
      storageLocation: "fridge",
      notes: "Opened yesterday. Finish the jar before the reminder.",
    },
    { name: "Penne pasta", category: "Pantry", quantity: 500, unit: "g", price: 80, expiryDate: inDays(200), storageLocation: "pantry" },
    { name: "Basmati rice", category: "Pantry", quantity: 1, unit: "kg", price: 140, expiryDate: inDays(300), storageLocation: "pantry" },
    { name: "Onion", category: "Produce", quantity: 1, unit: "kg", price: 35, expiryDate: inDays(14), storageLocation: "pantry" },
    { name: "Greek yogurt", category: "Dairy", quantity: 400, unit: "g", price: 95, expiryDate: inDays(-1), storageLocation: "fridge", notes: "This one slipped past its date." },
    { name: "Frozen peas", category: "Frozen", quantity: 500, unit: "g", price: 75, expiryDate: inDays(90), storageLocation: "freezer" },
    { name: "Milk", brand: "Amul", category: "Dairy", price: 65, expiryDate: inDays(3), storageLocation: "fridge", status: "consumed", consumedAt: daysAgo(0) },
    { name: "Brown bread", category: "Bakery", price: 50, expiryDate: inDays(2), storageLocation: "pantry", status: "consumed", consumedAt: daysAgo(1) },
    { name: "Bananas", category: "Produce", price: 40, expiryDate: inDays(1), storageLocation: "pantry", status: "consumed", consumedAt: daysAgo(2) },
    { name: "Curd", category: "Dairy", price: 55, expiryDate: inDays(4), storageLocation: "fridge", status: "consumed", consumedAt: daysAgo(6) },
    { name: "Herbs", category: "Produce", price: 25, expiryDate: inDays(-20), storageLocation: "fridge", status: "discarded", discardedAt: daysAgo(12) },
    { name: "Leafy greens", category: "Produce", price: 35, expiryDate: inDays(-40), storageLocation: "fridge", status: "discarded", discardedAt: daysAgo(38) },
    { name: "Berries", category: "Produce", price: 120, expiryDate: inDays(-70), storageLocation: "fridge", status: "discarded", discardedAt: daysAgo(68) },
  ];
  const now = Date.now();
  return {
    user: { id: "demo-user", name: "Dev", email: DEMO_EMAIL, currency: "INR" },
    products: kitchen.map(seedProduct),
    shopping: [
      { id: newId(), name: "Coffee", checked: false, source: "manual", createdAt: now },
      { id: newId(), name: "Dish soap", checked: false, source: "manual", createdAt: now - 1 },
    ],
    scans: 0,
  };
}

function load(): DemoState {
  const raw = localStorage.getItem(STATE_KEY);
  if (raw) {
    try {
      return JSON.parse(raw) as DemoState;
    } catch {
      localStorage.removeItem(STATE_KEY);
    }
  }
  const state = freshState();
  save(state);
  return state;
}

function save(state: DemoState) {
  localStorage.setItem(STATE_KEY, JSON.stringify(state));
}

function scoreNutrition(nutrition?: Nutrition | null) {
  if (!nutrition) return { score: null as number | null, notes: [] as string[] };
  const values = [nutrition.calories, nutrition.protein, nutrition.carbohydrates, nutrition.fat, nutrition.sugar, nutrition.sodium, nutrition.fiber];
  if (values.every((value) => value == null)) return { score: null, notes: [] as string[] };

  let score = 72;
  const notes: string[] = [];
  if ((nutrition.protein ?? 0) >= 15) {
    score += 10;
    notes.push("High protein for this serving");
  } else if ((nutrition.protein ?? 0) >= 8) {
    score += 6;
    notes.push("Good protein for this serving");
  }
  if ((nutrition.fiber ?? 0) >= 5) {
    score += 8;
    notes.push("High fiber");
  } else if ((nutrition.fiber ?? 0) >= 3) {
    score += 4;
    notes.push("Useful fiber");
  }
  if ((nutrition.sodium ?? 0) >= 600) {
    score -= 16;
    notes.push("Sodium is high");
  } else if ((nutrition.sodium ?? 0) >= 400) {
    score -= 8;
    notes.push("Sodium is on the higher side");
  }
  if ((nutrition.sugar ?? 0) >= 15) {
    score -= 12;
    notes.push("Sugar is high for one serving");
  } else if ((nutrition.sugar ?? 0) >= 8) {
    score -= 6;
    notes.push("Watch the sugar");
  }
  if ((nutrition.fat ?? 0) >= 18) {
    score -= 6;
    notes.push("Higher fat serving");
  }
  if (nutrition.calories != null && nutrition.calories <= 80) {
    score += 4;
    notes.push("Light on calories");
  } else if ((nutrition.calories ?? 0) >= 350) {
    score -= 4;
    notes.push("A hearty calorie serving");
  }
  if (!notes.length) notes.push("A fairly balanced label for this serving");
  return { score: Math.max(28, Math.min(96, score)), notes };
}

function freshnessOf(status: string, days: number | null): Freshness {
  if (status === "consumed") return "consumed";
  if (status === "discarded") return "discarded";
  if (days === null) return "undated";
  if (days < 0) return "expired";
  if (days === 0) return "today";
  if (days <= 3) return "soon";
  if (days <= 7) return "week";
  return "fresh";
}

function present(item: StoredProduct): Product {
  const dates = [item.expiryDate, item.useByDate].filter((value): value is string => Boolean(value)).sort();
  const effectiveDate = dates[0] ?? null;
  const daysRemaining = daysUntil(effectiveDate);
  const nutrition = scoreNutrition(item.nutrition);
  const { consumedAt: _consumedAt, discardedAt: _discardedAt, ...rest } = item;
  return {
    ...rest,
    effectiveDate,
    daysRemaining,
    freshness: freshnessOf(item.status, daysRemaining),
    nutritionScore: nutrition.score,
    nutritionNotes: nutrition.notes,
  };
}

function text(value: unknown) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed || null;
}

function amount(value: unknown) {
  if (value == null || value === "") return null;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

function date(value: unknown) {
  const v = text(value);
  if (!v) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) throw new DemoError("Check the dates and try again");
  return v;
}

function parseProduct(body: Record<string, unknown>): Seed {
  const name = text(body.name);
  if (!name) throw new DemoError("Name is required");
  const price = amount(body.price);
  const quantity = amount(body.quantity);
  if (price != null && price < 0) throw new DemoError("Price cannot be negative");
  if (quantity != null && quantity <= 0) throw new DemoError("Quantity should be greater than zero");
  const nutrition = (body.nutrition ?? {}) as Record<string, unknown>;
  const storage = body.storageLocation;
  return {
    name,
    brand: text(body.brand),
    category: text(body.category) ?? "Other",
    quantity,
    unit: text(body.unit),
    price,
    purchaseDate: date(body.purchaseDate),
    expiryDate: date(body.expiryDate),
    useByDate: date(body.useByDate),
    openedDate: date(body.openedDate),
    manufactureDate: date(body.manufactureDate),
    storageLocation: storage === "fridge" || storage === "freezer" ? storage : "pantry",
    ingredients: text(body.ingredients),
    allergens: Array.isArray(body.allergens) ? body.allergens.map(String).filter(Boolean) : [],
    notes: text(body.notes),
    barcode: text(body.barcode),
    batch: text(body.batch),
    imageUrl: text(body.imageUrl),
    nutrition: {
      servingSize: text(nutrition.servingSize),
      calories: amount(nutrition.calories),
      protein: amount(nutrition.protein),
      carbohydrates: amount(nutrition.carbohydrates),
      fat: amount(nutrition.fat),
      sugar: amount(nutrition.sugar),
      sodium: amount(nutrition.sodium),
      fiber: amount(nutrition.fiber),
    },
  };
}

function findProduct(state: DemoState, id: string) {
  const product = state.products.find((item) => item.id === id);
  if (!product) throw new DemoError("Product not found");
  return product;
}

const RECIPES: { id: string; name: string; emoji: string; minutes: number; steps: string[]; ingredients: { name: string; keywords: string[] }[] }[] = [
  {
    id: "chicken-spinach-pasta",
    name: "Creamy chicken & spinach pasta",
    emoji: "🍝",
    minutes: 25,
    ingredients: [
      { name: "Chicken", keywords: ["chicken"] },
      { name: "Spinach", keywords: ["spinach", "palak"] },
      { name: "Pasta", keywords: ["pasta", "penne", "spaghetti"] },
      { name: "Cheese", keywords: ["cheese", "cheddar", "parmesan"] },
      { name: "Tomato", keywords: ["tomato"] },
    ],
    steps: [
      "Boil the pasta until just tender.",
      "Sear bite-size chicken in a pan until cooked through.",
      "Add chopped tomato and spinach and cook until the spinach wilts.",
      "Toss with pasta and cheese. Season and serve.",
    ],
  },
  {
    id: "chicken-fried-rice",
    name: "Chicken fried rice",
    emoji: "🍚",
    minutes: 20,
    ingredients: [
      { name: "Chicken", keywords: ["chicken"] },
      { name: "Rice", keywords: ["rice"] },
      { name: "Eggs", keywords: ["egg"] },
      { name: "Onion", keywords: ["onion"] },
    ],
    steps: ["Scramble the eggs and set them aside.", "Stir-fry onion and chicken until the chicken is cooked.", "Add cold rice and the eggs. Toss over high heat."],
  },
  {
    id: "tomato-cheese-omelette",
    name: "Tomato cheese omelette",
    emoji: "🍳",
    minutes: 10,
    ingredients: [
      { name: "Eggs", keywords: ["egg"] },
      { name: "Tomato", keywords: ["tomato"] },
      { name: "Cheese", keywords: ["cheese", "cheddar"] },
    ],
    steps: ["Beat the eggs with a pinch of salt.", "Pour into a warm pan and add tomato and cheese.", "Fold and cook until just set."],
  },
  {
    id: "paneer-spinach",
    name: "Paneer spinach scramble",
    emoji: "🥬",
    minutes: 20,
    ingredients: [
      { name: "Paneer", keywords: ["paneer"] },
      { name: "Spinach", keywords: ["spinach", "palak"] },
      { name: "Tomato", keywords: ["tomato"] },
      { name: "Onion", keywords: ["onion"] },
    ],
    steps: ["Soften onion and tomato in a pan.", "Add spinach and cook until it collapses.", "Crumble in paneer, warm through, and season."],
  },
  {
    id: "egg-bhurji",
    name: "Egg bhurji",
    emoji: "🥘",
    minutes: 12,
    ingredients: [
      { name: "Eggs", keywords: ["egg"] },
      { name: "Onion", keywords: ["onion"] },
      { name: "Tomato", keywords: ["tomato"] },
    ],
    steps: ["Cook onion and tomato until soft.", "Add beaten eggs and scramble until just done.", "Finish with salt and any herbs you have."],
  },
  {
    id: "dal-tadka",
    name: "Quick masoor dal",
    emoji: "🍛",
    minutes: 30,
    ingredients: [
      { name: "Lentils", keywords: ["dal", "lentil", "masoor", "moong"] },
      { name: "Tomato", keywords: ["tomato"] },
      { name: "Onion", keywords: ["onion"] },
    ],
    steps: ["Boil rinsed lentils until soft.", "Fry onion and tomato with salt.", "Stir the tadka through the dal."],
  },
  {
    id: "khichdi",
    name: "Comfort khichdi",
    emoji: "🥣",
    minutes: 30,
    ingredients: [
      { name: "Rice", keywords: ["rice"] },
      { name: "Lentils", keywords: ["dal", "lentil", "moong"] },
      { name: "Spinach", keywords: ["spinach", "palak"] },
    ],
    steps: ["Rinse rice and lentils together.", "Simmer with salt and extra water until porridge-soft.", "Stir in spinach at the end."],
  },
  {
    id: "strawberry-yogurt",
    name: "Strawberry yogurt bowl",
    emoji: "🍓",
    minutes: 5,
    ingredients: [
      { name: "Strawberries", keywords: ["strawberry"] },
      { name: "Yogurt", keywords: ["yogurt", "curd", "dahi"] },
    ],
    steps: ["Slice the strawberries.", "Spoon over cold yogurt.", "Eat it today."],
  },
  {
    id: "bread-egg",
    name: "Masala French toast",
    emoji: "🍞",
    minutes: 12,
    ingredients: [
      { name: "Bread", keywords: ["bread"] },
      { name: "Eggs", keywords: ["egg"] },
      { name: "Milk", keywords: ["milk"] },
    ],
    steps: ["Beat eggs with a splash of milk and a pinch of salt.", "Dip the bread and pan-fry until golden on both sides."],
  },
  {
    id: "chicken-salad",
    name: "Chicken salad plate",
    emoji: "🥗",
    minutes: 15,
    ingredients: [
      { name: "Chicken", keywords: ["chicken"] },
      { name: "Spinach", keywords: ["spinach", "lettuce", "salad"] },
      { name: "Tomato", keywords: ["tomato"] },
      { name: "Cheese", keywords: ["cheese", "cheddar"] },
    ],
    steps: ["Slice or shred cooked chicken.", "Toss with spinach, tomato, and cheese.", "Dress with oil, lemon, and salt if you have them."],
  },
  {
    id: "tomato-pasta",
    name: "Tomato sauce pasta",
    emoji: "🍅",
    minutes: 18,
    ingredients: [
      { name: "Pasta", keywords: ["pasta"] },
      { name: "Tomato sauce", keywords: ["sauce", "passata"] },
      { name: "Cheese", keywords: ["cheese"] },
    ],
    steps: ["Boil the pasta.", "Warm the tomato sauce.", "Toss together and finish with cheese."],
  },
  {
    id: "paneer-fried-rice",
    name: "Paneer fried rice",
    emoji: "🧀",
    minutes: 20,
    ingredients: [
      { name: "Paneer", keywords: ["paneer"] },
      { name: "Rice", keywords: ["rice"] },
      { name: "Onion", keywords: ["onion"] },
      { name: "Capsicum", keywords: ["capsicum", "pepper"] },
    ],
    steps: ["Sear paneer cubes and set aside.", "Stir-fry onion, then add rice and paneer.", "Season and serve hot."],
  },
];

function matchesKeyword(name: string, keyword: string) {
  const n = name.toLowerCase();
  if (keyword === "egg") return /\beggs?\b/.test(n);
  return n.includes(keyword);
}

function matchRecipes(items: Product[], mode: "expiring" | "pantry"): RecipeMatch[] {
  type Hit = { id: string; name: string; daysRemaining: number | null };
  return RECIPES.map((recipe) => {
    const used: Hit[] = [];
    const expiring: Hit[] = [];
    const missing: string[] = [];
    for (const ingredient of recipe.ingredients) {
      const hit = items.find(
        (item) => !used.some((picked) => picked.id === item.id) && ingredient.keywords.some((keyword) => matchesKeyword(item.name, keyword)),
      );
      if (!hit) {
        missing.push(ingredient.name);
        continue;
      }
      const entry = { id: hit.id, name: hit.name, daysRemaining: hit.daysRemaining };
      used.push(entry);
      if (hit.daysRemaining != null && hit.daysRemaining <= 3) expiring.push(entry);
    }
    return {
      id: recipe.id,
      name: recipe.name,
      emoji: recipe.emoji,
      minutes: recipe.minutes,
      steps: recipe.steps,
      used,
      expiring,
      missing,
      score: used.length * 2 + expiring.length * 6 - missing.length,
    };
  })
    .filter((recipe) => (mode === "expiring" ? recipe.expiring.length >= 1 && recipe.used.length >= 2 : recipe.used.length >= 2))
    .sort((a, b) => b.score - a.score || b.expiring.length - a.expiring.length);
}

const LEVELS = [
  { name: "Seedling", min: 0 },
  { name: "Pantry beginner", min: 80 },
  { name: "Waste reducer", min: 250 },
  { name: "Smart cook", min: 500 },
  { name: "Food saver", min: 900 },
  { name: "Zero-waste hero", min: 1500 },
];

function levelFor(xp: number) {
  let current = LEVELS[0];
  for (const level of LEVELS) if (xp >= level.min) current = level;
  const next = LEVELS.find((level) => level.min > current.min) ?? null;
  const progress = next ? Math.min(1, (xp - current.min) / (next.min - current.min)) : 1;
  return { name: current.name, min: current.min, next: next?.name ?? null, nextAt: next?.min ?? null, progress };
}

function streakFrom(dates: string[]) {
  const unique = [...new Set(dates)].sort().reverse();
  if (!unique.length) return 0;
  const today = todayISO();
  if (unique[0] !== today && unique[0] !== addDaysISO(today, -1)) return 0;
  let count = 1;
  for (let i = 1; i < unique.length; i += 1) {
    if (unique[i] !== addDaysISO(unique[i - 1], -1)) break;
    count += 1;
  }
  return count;
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function insights(state: DemoState): Insights {
  const sum = (items: { price?: number | null }[]) => items.reduce((total, item) => total + (item.price ?? 0), 0);
  const active = state.products.filter((item) => item.status === "active").map(present);
  const consumed = state.products.filter((item) => item.status === "consumed");
  const discarded = state.products.filter((item) => item.status === "discarded");

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const at = (iso: string | null) => (iso ? new Date(iso) : null);
  const consumedDay = (item: StoredProduct) => (item.consumedAt ? formatISODate(new Date(item.consumedAt)) : null);
  const isOnTime = (item: StoredProduct) => {
    const day = consumedDay(item);
    return Boolean(day && item.expiryDate && day <= item.expiryDate);
  };

  const saved = consumed.filter((item) => isOnTime(item) || (!item.expiryDate && item.consumedAt));
  const savedThisMonth = saved.filter((item) => (at(item.consumedAt) ?? 0) >= monthStart);
  const wastedThisMonth = discarded.filter((item) => (at(item.discardedAt) ?? 0) >= monthStart);
  const wastedLastMonth = discarded.filter((item) => {
    const when = at(item.discardedAt);
    return when && when >= lastMonthStart && when < monthStart;
  });

  const trend = Array.from({ length: 6 }, (_, i) => {
    const month = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const key = monthKey(month);
    return {
      month: key,
      label: month.toLocaleString("en-IN", { month: "short" }),
      wasted: sum(discarded.filter((item) => item.discardedAt && monthKey(new Date(item.discardedAt)) === key)),
    };
  });

  const last = sum(wastedLastMonth);
  const current = sum(wastedThisMonth);
  const onTimeItems = consumed.filter(isOnTime);
  const streak = streakFrom(onTimeItems.map((item) => consumedDay(item) as string));
  const onTimeCount = onTimeItems.length;
  const xp = onTimeCount * 25 + consumed.length * 8 + state.scans * 10;
  const soon = active.filter((item) => item.daysRemaining != null && item.daysRemaining >= 0 && item.daysRemaining <= 3);

  const storage = { pantry: 0, fridge: 0, freezer: 0 };
  for (const item of active) storage[item.storageLocation] += 1;

  return {
    counts: {
      active: active.length,
      expiringSoon: soon.length,
      expired: active.filter((item) => item.freshness === "expired").length,
      consumed: consumed.length,
      discarded: discarded.length,
      onTime: onTimeCount,
    },
    value: {
      pantry: sum(active),
      atRisk: sum(soon),
      savedAllTime: sum(saved),
      savedThisMonth: sum(savedThisMonth),
      wastedThisMonth: current,
      wastedLastMonth: last,
    },
    trend,
    wasteChangePct: last > 0 ? Math.round(((last - current) / last) * 100) : null,
    streak,
    xp,
    level: levelFor(xp),
    badges: [
      { id: "first-scan", name: "Label reader", detail: "Scan your first product", earned: state.scans >= 1 },
      { id: "scan-10", name: "Sharp eyes", detail: "Scan 10 products", earned: state.scans >= 10 },
      { id: "saver-5", name: "Waste reducer", detail: "Use 5 foods before expiry", earned: onTimeCount >= 5 },
      { id: "saver-20", name: "Food saver", detail: "Use 20 foods before expiry", earned: onTimeCount >= 20 },
      { id: "streak-7", name: "Seven-day streak", detail: "Use something in time for 7 days", earned: streak >= 7 },
      { id: "stocked", name: "Full shelf", detail: "Keep 12 active foods", earned: active.length >= 12 },
      {
        id: "clean-month",
        name: "Clean month",
        detail: "Use food this month without tossing any",
        earned: wastedThisMonth.length === 0 && savedThisMonth.length >= 3,
      },
    ],
    storage,
  };
}

function shopping(state: DemoState): ShoppingList {
  const items = [...state.shopping].sort((a, b) => Number(a.checked) - Number(b.checked) || b.createdAt - a.createdAt);
  const inKitchen = new Set(state.products.filter((item) => item.status === "active").map((item) => item.name.trim().toLowerCase()));
  const existing = new Set(items.map((item) => item.name.trim().toLowerCase()));
  const counts = new Map<string, { name: string; count: number }>();
  for (const product of state.products.filter((item) => item.status === "consumed")) {
    const key = product.name.trim().toLowerCase();
    const current = counts.get(key) ?? { name: product.name.trim(), count: 0 };
    current.count += 1;
    counts.set(key, current);
  }
  const suggestions = [...counts.values()]
    .filter((item) => !inKitchen.has(item.name.toLowerCase()) && !existing.has(item.name.toLowerCase()))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
  return { items: items.map(({ createdAt: _createdAt, ...item }) => item), suggestions };
}

function emptyExtracted(): Extracted {
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
    nutrition: { servingSize: null, calories: null, protein: null, carbohydrates: null, fat: null, sugar: null, sodium: null, fiber: null },
    confidence: { expiryDate: "missing", nutrition: "missing" },
  };
}

async function lookupBarcode(code: string): Promise<Extracted> {
  let payload: { status?: number; product?: Record<string, unknown> };
  try {
    const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${code}.json`);
    if (!response.ok) throw new Error(String(response.status));
    payload = await response.json();
  } catch {
    throw new DemoError("Barcode lookup is unavailable right now. You can still add the product by hand.");
  }
  if (payload.status !== 1 || !payload.product) {
    throw new DemoError("No public product matched that barcode. Add it from the label instead.");
  }
  const product = payload.product as {
    product_name?: string;
    product_name_en?: string;
    brands?: string;
    ingredients_text?: string;
    ingredients_text_en?: string;
    image_front_url?: string;
    nutriments?: Record<string, number | string>;
    serving_size?: string;
  };
  const extracted = emptyExtracted();
  const nutriments = product.nutriments ?? {};
  const perServing = typeof nutriments["energy-kcal_serving"] === "number";
  const pick = (key: string) => {
    const value = nutriments[`${key}_${perServing ? "serving" : "100g"}`];
    return typeof value === "number" && Number.isFinite(value) ? Math.round(value * 10) / 10 : null;
  };
  const sodium = pick("sodium");
  extracted.name = product.product_name_en || product.product_name || null;
  extracted.brand = product.brands?.split(",")[0]?.trim() || null;
  extracted.ingredients = product.ingredients_text_en || product.ingredients_text || null;
  extracted.imageUrl = product.image_front_url ?? null;
  extracted.barcode = code;
  extracted.nutrition = {
    servingSize: perServing ? product.serving_size || "Per serving" : "Per 100 g",
    calories: pick("energy-kcal") == null ? null : Math.round(pick("energy-kcal") as number),
    protein: pick("proteins"),
    carbohydrates: pick("carbohydrates"),
    fat: pick("fat"),
    sugar: pick("sugars"),
    fiber: pick("fiber"),
    sodium: sodium == null ? null : Math.round(sodium * 1000),
  };
  const hasNutrition = Object.values(extracted.nutrition).some((value) => typeof value === "number");
  extracted.confidence = { expiryDate: "missing", nutrition: hasNutrition ? "high" : "missing" };
  return extracted;
}

export function isDemoLogin(body: unknown) {
  const { email, password } = (body ?? {}) as { email?: string; password?: string };
  return email?.trim().toLowerCase() === DEMO_EMAIL && password === DEMO_PASSWORD;
}

export async function demoApi(path: string, options: { method?: string; body?: unknown } = {}): Promise<unknown> {
  const method = (options.method ?? "GET").toUpperCase();
  const url = new URL(path, window.location.origin);
  const parts = url.pathname.replace(/^\/api\//, "").split("/");
  const body = (options.body && !(options.body instanceof FormData) ? options.body : {}) as Record<string, unknown>;
  const state = load();
  const respond = <T>(value: T) => {
    save(state);
    return value;
  };

  try {
    const [resource, id, action] = parts;

    if (resource === "auth") {
      if ((id === "login" || id === "demo") && method === "POST") return { token: DEMO_TOKEN, user: state.user };
      if (id === "me" && method === "GET") return state.user;
      if (id === "me" && method === "PATCH") {
        if (text(body.name)) state.user.name = text(body.name) as string;
        if (text(body.currency)) state.user.currency = text(body.currency) as string;
        if (body.newPassword) throw new DemoError("Passwords can't be changed on the offline demo account");
        return respond(state.user);
      }
      if (id === "demo" && action === "reset" && method === "POST") {
        save(freshState());
        return { ok: true };
      }
      throw new DemoError("Sign out of the demo kitchen to use real accounts");
    }

    if (resource === "products") {
      if (!id && method === "GET") {
        const status = url.searchParams.get("status") ?? "active";
        return state.products
          .filter((item) => status === "all" || item.status === status)
          .map(present)
          .sort((a, b) => {
            if (a.effectiveDate == null) return 1;
            if (b.effectiveDate == null) return -1;
            return a.effectiveDate.localeCompare(b.effectiveDate);
          });
      }
      if (!id && method === "POST") {
        const product = seedProduct(parseProduct(body));
        state.products.push(product);
        return respond(present(product));
      }
      const product = findProduct(state, id);
      if (!action && method === "GET") return present(product);
      if (!action && method === "PATCH") {
        Object.assign(product, parseProduct(body));
        return respond(present(product));
      }
      if (!action && method === "DELETE") {
        state.products = state.products.filter((item) => item.id !== id);
        return respond({ ok: true });
      }
      if (action === "consume" || action === "discard") {
        if (product.status !== "active") throw new DemoError("That item is already out of the kitchen");
        product.status = action === "consume" ? "consumed" : "discarded";
        if (action === "consume") product.consumedAt = new Date().toISOString();
        else product.discardedAt = new Date().toISOString();
        return respond(present(product));
      }
      if (action === "open") {
        if (!product.openedDate) product.openedDate = todayISO();
        return respond(present(product));
      }
    }

    if (resource === "insights" && method === "GET") return insights(state);

    if (resource === "recipes") {
      const active = state.products.filter((item) => item.status === "active").map(present);
      if (!id && method === "GET") {
        const mode = url.searchParams.get("mode") === "pantry" ? "pantry" : "expiring";
        return { mode, ai: false, recipes: matchRecipes(active, mode) };
      }
      if (id === "generate") throw new DemoError("Custom AI recipes need the backend. Saved matches still work.");
      if (id === "cook") {
        const ids = Array.isArray(body.productIds) ? body.productIds.map(String) : [];
        if (!ids.length) throw new DemoError("Choose the ingredients you used");
        let count = 0;
        for (const item of state.products) {
          if (ids.includes(item.id) && item.status === "active") {
            item.status = "consumed";
            item.consumedAt = new Date().toISOString();
            count += 1;
          }
        }
        return respond({ consumed: count });
      }
    }

    if (resource === "shopping") {
      if (!id && method === "GET") return shopping(state);
      if (!id && method === "POST") {
        const name = text(body.name);
        if (!name) throw new DemoError("Enter an item name");
        const item = { id: newId(), name: name.slice(0, 80), checked: false, source: text(body.source) ?? "manual", createdAt: Date.now() };
        state.shopping.push(item);
        return respond(item);
      }
      const item = state.shopping.find((entry) => entry.id === id);
      if (!item) throw new DemoError("Item not found");
      if (method === "PATCH") {
        if (typeof body.checked === "boolean") item.checked = body.checked;
        if (text(body.name)) item.name = text(body.name) as string;
        return respond(item);
      }
      if (method === "DELETE") {
        state.shopping = state.shopping.filter((entry) => entry.id !== id);
        return respond({ ok: true });
      }
    }

    if (resource === "scans") {
      if (id === "label") {
        const file = options.body instanceof FormData ? options.body.get("image") : null;
        if (!(file instanceof File)) throw new DemoError("Choose a photo of the label");
        const imageUrl = URL.createObjectURL(file);
        const extracted = { ...emptyExtracted(), imageUrl };
        state.scans += 1;
        return respond({
          scanId: newId(),
          imageUrl,
          extracted,
          warning: "The offline demo can't read labels automatically. Fill in the details from the photo.",
          ai: false,
        });
      }
      if (id === "barcode") {
        const code = String(body.code ?? "").replace(/\D/g, "");
        if (code.length < 8 || code.length > 14) throw new DemoError("Enter a valid barcode");
        const extracted = await lookupBarcode(code);
        state.scans += 1;
        const warning = "Barcode data does not include your pack's expiry. Confirm the date on the package.";
        return respond({ scanId: newId(), imageUrl: extracted.imageUrl, extracted, warning, ai: false });
      }
    }

    throw new DemoError("That isn't available in the offline demo");
  } catch (error) {
    if (error instanceof DemoError) throw error;
    throw new DemoError("Something went wrong");
  }
}

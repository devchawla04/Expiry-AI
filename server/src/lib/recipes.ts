export type CatalogRecipe = {
  id: string;
  name: string;
  emoji: string;
  minutes: number;
  steps: string[];
  ingredients: { name: string; keywords: string[] }[];
};

export const RECIPE_CATALOG: CatalogRecipe[] = [
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
    steps: [
      "Scramble the eggs and set them aside.",
      "Stir-fry onion and chicken until the chicken is cooked.",
      "Add cold rice and the eggs. Toss over high heat.",
    ],
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
    steps: [
      "Beat the eggs with a pinch of salt.",
      "Pour into a warm pan and add tomato and cheese.",
      "Fold and cook until just set.",
    ],
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
    steps: [
      "Soften onion and tomato in a pan.",
      "Add spinach and cook until it collapses.",
      "Crumble in paneer, warm through, and season.",
    ],
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
    steps: [
      "Cook onion and tomato until soft.",
      "Add beaten eggs and scramble until just done.",
      "Finish with salt and any herbs you have.",
    ],
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
    steps: [
      "Boil rinsed lentils until soft.",
      "Fry onion and tomato with salt.",
      "Stir the tadka through the dal.",
    ],
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
    steps: [
      "Rinse rice and lentils together.",
      "Simmer with salt and extra water until porridge-soft.",
      "Stir in spinach at the end.",
    ],
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
    steps: [
      "Beat eggs with a splash of milk and a pinch of salt.",
      "Dip the bread and pan-fry until golden on both sides.",
    ],
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
    steps: [
      "Slice or shred cooked chicken.",
      "Toss with spinach, tomato, and cheese.",
      "Dress with oil, lemon, and salt if you have them.",
    ],
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
    steps: [
      "Boil the pasta.",
      "Warm the tomato sauce.",
      "Toss together and finish with cheese.",
    ],
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
    steps: [
      "Sear paneer cubes and set aside.",
      "Stir-fry onion, then add rice and paneer.",
      "Season and serve hot.",
    ],
  },
];

type PantryItem = {
  id: string;
  name: string;
  daysRemaining: number | null;
  freshness: string;
};

function matchesKeyword(name: string, keyword: string) {
  const n = name.toLowerCase();
  if (keyword === "egg") return /\beggs?\b/.test(n);
  return n.includes(keyword);
}

export function matchRecipes(items: PantryItem[], mode: "expiring" | "pantry") {
  const active = items.filter((item) => !["consumed", "discarded"].includes(item.freshness));
  return RECIPE_CATALOG.map((recipe) => {
    const used: PantryItem[] = [];
    const expiring: PantryItem[] = [];
    const missing: string[] = [];
    for (const ingredient of recipe.ingredients) {
      const hit = active.find(
        (item) =>
          !used.some((picked) => picked.id === item.id) &&
          ingredient.keywords.some((keyword) => matchesKeyword(item.name, keyword)),
      );
      if (!hit) {
        missing.push(ingredient.name);
        continue;
      }
      used.push(hit);
      if (hit.daysRemaining != null && hit.daysRemaining <= 3) expiring.push(hit);
    }
    const score = used.length * 2 + expiring.length * 6 - missing.length;
    return {
      id: recipe.id,
      name: recipe.name,
      emoji: recipe.emoji,
      minutes: recipe.minutes,
      steps: recipe.steps,
      used: used.map((item) => ({ id: item.id, name: item.name, daysRemaining: item.daysRemaining })),
      expiring: expiring.map((item) => ({ id: item.id, name: item.name, daysRemaining: item.daysRemaining })),
      missing,
      score,
    };
  })
    .filter((recipe) => {
      if (mode === "expiring") return recipe.expiring.length >= 1 && recipe.used.length >= 2;
      return recipe.used.length >= 2;
    })
    .sort((a, b) => b.score - a.score || b.expiring.length - a.expiring.length);
}

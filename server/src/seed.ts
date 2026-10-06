import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectDb } from "./db.js";
import { addDaysISO, daysAgo, todayISO } from "./lib/dates.js";
import { Product } from "./models/Product.js";
import { Scan } from "./models/Scan.js";
import { ShoppingItem } from "./models/ShoppingItem.js";
import { User } from "./models/User.js";

export const DEMO_EMAIL = "dev@shelfsense.app";
const DEMO_PASSWORD = "demo1234";

function inDays(days: number) {
  return addDaysISO(todayISO(), days);
}

type SeedProduct = {
  name: string;
  brand?: string;
  category: string;
  quantity?: number;
  unit?: string;
  price?: number;
  expiryDate?: string | null;
  useByDate?: string | null;
  openedDate?: string | null;
  storageLocation: "pantry" | "fridge" | "freezer";
  ingredients?: string;
  allergens?: string[];
  notes?: string;
  status?: "active" | "consumed" | "discarded";
  consumedAt?: Date | null;
  discardedAt?: Date | null;
  nutrition?: {
    servingSize?: string;
    calories?: number;
    protein?: number;
    carbohydrates?: number;
    fat?: number;
    sugar?: number;
    sodium?: number;
    fiber?: number;
  };
};

const kitchen = (): SeedProduct[] => [
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
  {
    name: "Spinach",
    category: "Produce",
    quantity: 200,
    unit: "g",
    price: 30,
    expiryDate: inDays(0),
    storageLocation: "fridge",
  },
  {
    name: "Strawberries",
    category: "Produce",
    quantity: 250,
    unit: "g",
    price: 90,
    expiryDate: inDays(1),
    storageLocation: "fridge",
  },
  {
    name: "Sandwich bread",
    brand: "Britannia",
    category: "Bakery",
    quantity: 1,
    unit: "pack",
    price: 45,
    expiryDate: inDays(3),
    storageLocation: "pantry",
  },
  {
    name: "Chicken breast",
    category: "Meat",
    quantity: 500,
    unit: "g",
    price: 280,
    expiryDate: inDays(1),
    storageLocation: "fridge",
  },
  {
    name: "Tomatoes",
    category: "Produce",
    quantity: 500,
    unit: "g",
    price: 40,
    expiryDate: inDays(2),
    storageLocation: "fridge",
  },
  {
    name: "Cheddar",
    brand: "Amul",
    category: "Dairy",
    quantity: 200,
    unit: "g",
    price: 110,
    expiryDate: inDays(4),
    storageLocation: "fridge",
    allergens: ["Milk"],
  },
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
  {
    name: "Eggs",
    category: "Dairy",
    quantity: 6,
    unit: "pcs",
    price: 48,
    expiryDate: inDays(10),
    storageLocation: "fridge",
  },
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
  {
    name: "Penne pasta",
    category: "Pantry",
    quantity: 500,
    unit: "g",
    price: 80,
    expiryDate: inDays(200),
    storageLocation: "pantry",
  },
  {
    name: "Basmati rice",
    category: "Pantry",
    quantity: 1,
    unit: "kg",
    price: 140,
    expiryDate: inDays(300),
    storageLocation: "pantry",
  },
  {
    name: "Onion",
    category: "Produce",
    quantity: 1,
    unit: "kg",
    price: 35,
    expiryDate: inDays(14),
    storageLocation: "pantry",
  },
  {
    name: "Greek yogurt",
    category: "Dairy",
    quantity: 400,
    unit: "g",
    price: 95,
    expiryDate: inDays(-1),
    storageLocation: "fridge",
    notes: "This one slipped past its date.",
  },
  {
    name: "Frozen peas",
    category: "Frozen",
    quantity: 500,
    unit: "g",
    price: 75,
    expiryDate: inDays(90),
    storageLocation: "freezer",
  },
  {
    name: "Milk",
    brand: "Amul",
    category: "Dairy",
    price: 65,
    expiryDate: inDays(3),
    storageLocation: "fridge",
    status: "consumed",
    consumedAt: daysAgo(0),
  },
  {
    name: "Brown bread",
    category: "Bakery",
    price: 50,
    expiryDate: inDays(2),
    storageLocation: "pantry",
    status: "consumed",
    consumedAt: daysAgo(1),
  },
  {
    name: "Bananas",
    category: "Produce",
    price: 40,
    expiryDate: inDays(1),
    storageLocation: "pantry",
    status: "consumed",
    consumedAt: daysAgo(2),
  },
  {
    name: "Curd",
    category: "Dairy",
    price: 55,
    expiryDate: inDays(4),
    storageLocation: "fridge",
    status: "consumed",
    consumedAt: daysAgo(6),
  },
  {
    name: "Herbs",
    category: "Produce",
    price: 25,
    expiryDate: inDays(-20),
    storageLocation: "fridge",
    status: "discarded",
    discardedAt: daysAgo(12),
  },
  {
    name: "Leafy greens",
    category: "Produce",
    price: 35,
    expiryDate: inDays(-40),
    storageLocation: "fridge",
    status: "discarded",
    discardedAt: daysAgo(38),
  },
  {
    name: "Berries",
    category: "Produce",
    price: 120,
    expiryDate: inDays(-70),
    storageLocation: "fridge",
    status: "discarded",
    discardedAt: daysAgo(68),
  },
];

export async function refillDemo(userId: mongoose.Types.ObjectId | string) {
  await Promise.all([
    Product.deleteMany({ userId }),
    Scan.deleteMany({ userId }),
    ShoppingItem.deleteMany({ userId }),
  ]);
  await Product.insertMany(kitchen().map((item) => ({ ...item, userId, status: item.status ?? "active" })));
  await ShoppingItem.insertMany([
    { userId, name: "Coffee", source: "manual" },
    { userId, name: "Dish soap", source: "manual" },
  ]);
}

export async function ensureDemoUser() {
  let user = await User.findOne({ email: DEMO_EMAIL });
  if (!user) {
    user = await User.create({
      name: "Dev",
      email: DEMO_EMAIL,
      passwordHash: await bcrypt.hash(DEMO_PASSWORD, 10),
      currency: "INR",
    });
  }
  const count = await Product.countDocuments({ userId: user._id });
  if (count === 0) await refillDemo(user._id);
  return user;
}

const isDirectRun = process.argv[1]?.includes("seed.ts");
if (isDirectRun) {
  connectDb()
    .then(() => ensureDemoUser())
    .then(() => {
      console.log(`Demo kitchen ready. Sign in as ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
      return mongoose.disconnect();
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

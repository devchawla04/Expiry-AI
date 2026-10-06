import mongoose from "mongoose";

const nutritionSchema = new mongoose.Schema(
  {
    servingSize: { type: String, default: null },
    calories: { type: Number, default: null },
    protein: { type: Number, default: null },
    carbohydrates: { type: Number, default: null },
    fat: { type: Number, default: null },
    sugar: { type: Number, default: null },
    sodium: { type: Number, default: null },
    fiber: { type: Number, default: null },
  },
  { _id: false },
);

const productSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    brand: { type: String, default: null },
    category: { type: String, default: "Other" },
    quantity: { type: Number, default: null },
    unit: { type: String, default: null },
    price: { type: Number, default: null },
    purchaseDate: { type: String, default: null },
    expiryDate: { type: String, default: null },
    useByDate: { type: String, default: null },
    openedDate: { type: String, default: null },
    manufactureDate: { type: String, default: null },
    storageLocation: { type: String, enum: ["pantry", "fridge", "freezer"], default: "pantry" },
    nutrition: { type: nutritionSchema, default: () => ({}) },
    ingredients: { type: String, default: null },
    allergens: { type: [String], default: [] },
    imageUrl: { type: String, default: null },
    barcode: { type: String, default: null },
    batch: { type: String, default: null },
    notes: { type: String, default: null },
    scanId: { type: mongoose.Schema.Types.ObjectId, ref: "Scan", default: null },
    status: { type: String, enum: ["active", "consumed", "discarded"], default: "active" },
    consumedAt: { type: Date, default: null },
    discardedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

productSchema.index({ userId: 1, status: 1, expiryDate: 1 });

export const Product = mongoose.model("Product", productSchema);

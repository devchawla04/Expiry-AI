import mongoose from "mongoose";

const shoppingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    checked: { type: Boolean, default: false },
    source: { type: String, enum: ["manual", "suggestion"], default: "manual" },
  },
  { timestamps: true },
);

export const ShoppingItem = mongoose.model("ShoppingItem", shoppingSchema);

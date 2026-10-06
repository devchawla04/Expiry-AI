import mongoose from "mongoose";

const scanSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    imageUrl: { type: String, default: null },
    source: { type: String, enum: ["label", "barcode", "manual"], default: "label" },
    extracted: { type: mongoose.Schema.Types.Mixed, default: null },
    warning: { type: String, default: null },
    confidence: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { timestamps: true },
);

export const Scan = mongoose.model("Scan", scanSchema);

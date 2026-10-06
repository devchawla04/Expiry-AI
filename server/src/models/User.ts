import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    currency: { type: String, default: "INR" },
    resetTokenHash: { type: String, default: null },
    resetTokenExp: { type: Date, default: null },
  },
  { timestamps: true },
);

export const User = mongoose.model("User", userSchema);

export function publicUser(user: { _id: unknown; name: string; email: string; currency: string }) {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    currency: user.currency,
  };
}

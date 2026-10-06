import crypto from "crypto";
import bcrypt from "bcryptjs";
import { Router } from "express";
import { z } from "zod";
import { env } from "../config.js";
import { asyncHandler, HttpError } from "../http.js";
import { requireAuth, signToken } from "../middleware/auth.js";
import { publicUser, User } from "../models/User.js";
import { ensureDemoUser, refillDemo } from "../seed.js";

const router = Router();

const credentials = z.object({
  email: z.string().trim().email("Enter a valid email").transform((value) => value.toLowerCase()),
  password: z.string().min(8, "Use at least 8 characters"),
});

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

router.post(
  "/signup",
  asyncHandler(async (req, res) => {
    const body = z
      .object({
        name: z.string().trim().min(1, "Name is required").max(60),
      })
      .and(credentials)
      .parse(req.body);
    const existing = await User.findOne({ email: body.email });
    if (existing) throw new HttpError(409, "An account with that email already exists");
    const user = await User.create({
      name: body.name,
      email: body.email,
      passwordHash: await bcrypt.hash(body.password, 10),
    });
    res.status(201).json({ token: signToken(String(user._id)), user: publicUser(user) });
  }),
);

router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const body = credentials.parse(req.body);
    const user = await User.findOne({ email: body.email });
    if (!user || !(await bcrypt.compare(body.password, user.passwordHash))) {
      throw new HttpError(401, "Email or password is incorrect");
    }
    res.json({ token: signToken(String(user._id)), user: publicUser(user) });
  }),
);

router.post(
  "/demo",
  asyncHandler(async (_req, res) => {
    if (!env.demoLogin) throw new HttpError(404, "Not found");
    const user = await ensureDemoUser();
    res.json({ token: signToken(String(user._id)), user: publicUser(user) });
  }),
);

router.post(
  "/forgot",
  asyncHandler(async (req, res) => {
    const body = z.object({ email: z.string().trim().email() }).parse(req.body);
    const user = await User.findOne({ email: body.email.toLowerCase() });
    const payload: { ok: true; devResetUrl?: string } = { ok: true };
    if (user) {
      const token = crypto.randomBytes(24).toString("hex");
      user.resetTokenHash = hashToken(token);
      user.resetTokenExp = new Date(Date.now() + 30 * 60 * 1000);
      await user.save();
      const resetUrl = `${env.clientOrigin}/reset-password?token=${token}`;
      console.log(`Password reset link for ${user.email}: ${resetUrl}`);
      if (process.env.NODE_ENV !== "production") payload.devResetUrl = resetUrl;
    }
    res.json(payload);
  }),
);

router.post(
  "/reset",
  asyncHandler(async (req, res) => {
    const body = z
      .object({
        token: z.string().min(10),
        password: z.string().min(8, "Use at least 8 characters"),
      })
      .parse(req.body);
    const user = await User.findOne({
      resetTokenHash: hashToken(body.token),
      resetTokenExp: { $gt: new Date() },
    });
    if (!user) throw new HttpError(400, "This reset link is invalid or expired");
    user.passwordHash = await bcrypt.hash(body.password, 10);
    user.resetTokenHash = null;
    user.resetTokenExp = null;
    await user.save();
    res.json({ ok: true });
  }),
);

router.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.userId);
    if (!user) throw new HttpError(401, "Sign in to continue");
    res.json(publicUser(user));
  }),
);

router.patch(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const body = z
      .object({
        name: z.string().trim().min(1).max(60).optional(),
        currency: z.enum(["INR", "USD", "EUR", "GBP"]).optional(),
        currentPassword: z.string().optional(),
        newPassword: z.string().min(8, "Use at least 8 characters").optional(),
      })
      .parse(req.body);
    const user = await User.findById(req.userId);
    if (!user) throw new HttpError(401, "Sign in to continue");
    if (body.name) user.name = body.name;
    if (body.currency) user.currency = body.currency;
    if (body.newPassword) {
      if (!body.currentPassword || !(await bcrypt.compare(body.currentPassword, user.passwordHash))) {
        throw new HttpError(400, "Current password is incorrect");
      }
      user.passwordHash = await bcrypt.hash(body.newPassword, 10);
    }
    await user.save();
    res.json(publicUser(user));
  }),
);

router.post(
  "/demo/reset",
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.userId);
    if (!user || user.email !== "dev@shelfsense.app") {
      throw new HttpError(403, "Only the demo kitchen can be refilled");
    }
    await refillDemo(user._id);
    res.json({ ok: true });
  }),
);

export default router;

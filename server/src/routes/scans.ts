import fs from "fs";
import path from "path";
import { Router } from "express";
import multer from "multer";
import crypto from "crypto";
import { env, uploadsDir } from "../config.js";
import { asyncHandler, HttpError } from "../http.js";
import { emptyExtracted } from "../lib/catalog.js";
import { mapOpenFoodFacts } from "../lib/off.js";
import { requireAuth } from "../middleware/auth.js";
import { Scan } from "../models/Scan.js";
import { aiConfigured, extractLabel } from "../services/ai.js";

const router = Router();
router.use(requireAuth);

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => {
      fs.mkdirSync(uploadsDir, { recursive: true });
      cb(null, uploadsDir);
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
      cb(null, `${crypto.randomUUID()}${ext}`);
    },
  }),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.mimetype);
    if (!ok) {
      cb(new HttpError(400, "Use a JPEG, PNG, or WebP photo"));
      return;
    }
    cb(null, true);
  },
});

router.post(
  "/label",
  upload.single("image"),
  asyncHandler(async (req, res) => {
    if (!req.file) throw new HttpError(400, "Choose a photo of the label");
    const imageUrl = `/uploads/${req.file.filename}`;
    let extracted = emptyExtracted();
    let warning: string | null = null;
    if (!aiConfigured()) {
      warning = "Add OPENAI_API_KEY on the server to read labels automatically. You can still fill the details from the photo.";
    } else {
      try {
        extracted = await extractLabel(req.file.path);
      } catch (error) {
        console.error(error);
        warning = "The label could not be read. Fill in the fields you can see, especially the expiry date.";
      }
    }
    extracted.imageUrl = imageUrl;
    const scan = await Scan.create({
      userId: req.userId,
      imageUrl,
      source: "label",
      extracted,
      warning,
      confidence: extracted.confidence,
    });
    res.json({
      scanId: String(scan._id),
      imageUrl,
      extracted,
      warning,
      ai: aiConfigured(),
    });
  }),
);

router.post(
  "/barcode",
  asyncHandler(async (req, res) => {
    const code = String(req.body?.code ?? "").replace(/\D/g, "");
    if (code.length < 8 || code.length > 14) throw new HttpError(400, "Enter a valid barcode");
    let payload: { status?: number; product?: Record<string, unknown> };
    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${code}.json`, {
        headers: { "User-Agent": "ShelfSense/0.1 (household expiry tracker)" },
        signal: AbortSignal.timeout(12000),
      });
      if (!response.ok) throw new Error(`Open Food Facts returned ${response.status}`);
      payload = (await response.json()) as { status?: number; product?: Record<string, unknown> };
    } catch (error) {
      console.error(error);
      throw new HttpError(502, "Barcode lookup is unavailable right now. You can still add the product by hand.");
    }
    if (payload.status !== 1 || !payload.product) {
      throw new HttpError(404, "No public product matched that barcode. Add it from the label instead.");
    }
    const extracted = mapOpenFoodFacts(payload.product);
    extracted.barcode = code;
    const scan = await Scan.create({
      userId: req.userId,
      source: "barcode",
      extracted,
      warning: "Barcode data does not include your pack's expiry. Confirm the date on the package.",
      confidence: extracted.confidence,
    });
    res.json({
      scanId: String(scan._id),
      imageUrl: extracted.imageUrl,
      extracted,
      warning: "Barcode data does not include your pack's expiry. Confirm the date on the package.",
      ai: Boolean(env.openaiKey),
    });
  }),
);

export default router;

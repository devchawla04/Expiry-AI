import fs from "fs";
import path from "path";
import cors from "cors";
import express from "express";
import { ZodError } from "zod";
import { clientDist, env, uploadsDir } from "./config.js";
import { connectDb } from "./db.js";
import { HttpError } from "./http.js";
import authRoutes from "./routes/auth.js";
import insightsRoutes from "./routes/insights.js";
import productRoutes from "./routes/products.js";
import recipeRoutes from "./routes/recipes.js";
import scanRoutes from "./routes/scans.js";
import shoppingRoutes from "./routes/shopping.js";

const app = express();
fs.mkdirSync(uploadsDir, { recursive: true });

app.use(cors({ origin: env.clientOrigin }));
app.use(express.json({ limit: "1mb" }));
app.use("/uploads", express.static(uploadsDir));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, ai: Boolean(env.openaiKey) });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/scans", scanRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/shopping", shoppingRoutes);
app.use("/api/insights", insightsRoutes);

app.use("/api", (_req, res) => {
  res.status(404).json({ error: "Not found" });
});

if (fs.existsSync(path.join(clientDist, "index.html"))) {
  app.use(express.static(clientDist));
  app.use((req, res, next) => {
    if (req.method !== "GET") return next();
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (error instanceof HttpError) {
    res.status(error.status).json({ error: error.message });
    return;
  }
  if (error instanceof ZodError) {
    res.status(400).json({ error: error.issues[0]?.message ?? "Check the form and try again" });
    return;
  }
  if (typeof error === "object" && error && "code" in error && error.code === "LIMIT_FILE_SIZE") {
    res.status(400).json({ error: "That photo is larger than 8 MB" });
    return;
  }
  if (typeof error === "object" && error && "code" in error && error.code === 11000) {
    res.status(409).json({ error: "An account with that email already exists" });
    return;
  }
  if (typeof error === "object" && error && "name" in error && error.name === "CastError") {
    res.status(404).json({ error: "Not found" });
    return;
  }
  console.error(error);
  res.status(500).json({ error: "Something went wrong" });
});

connectDb()
  .then(() => {
    app.listen(env.port, () => {
      console.log(`ShelfSense API on http://localhost:${env.port}`);
    });
  })
  .catch((error) => {
    console.error("Could not connect to MongoDB.", error);
    process.exit(1);
  });

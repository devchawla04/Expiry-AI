import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

function read(name: string, fallback?: string) {
  const value = process.env[name] ?? fallback;
  if (value === undefined || value === "") {
    throw new Error(`Missing environment variable ${name}`);
  }
  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 4000),
  mongoUri: read("MONGODB_URI", "mongodb://127.0.0.1:27017/shelfsense"),
  jwtSecret: read("JWT_SECRET", "shelfsense-local-dev-secret-change-me"),
  clientOrigin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
  openaiKey: process.env.OPENAI_API_KEY?.trim() || "",
  openaiModel: process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini",
  demoLogin: process.env.DEMO_LOGIN !== "false",
};

export const uploadsDir = path.resolve(__dirname, "../uploads");
export const clientDist = path.resolve(__dirname, "../../client/dist");

import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config.js";
import { HttpError } from "../http.js";

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return next(new HttpError(401, "Sign in to continue"));
  try {
    const payload = jwt.verify(token, env.jwtSecret) as { sub?: string };
    if (!payload.sub) return next(new HttpError(401, "Sign in to continue"));
    req.userId = payload.sub;
    next();
  } catch {
    next(new HttpError(401, "Your session expired. Sign in again."));
  }
}

export function signToken(userId: string) {
  return jwt.sign({ sub: userId }, env.jwtSecret, { expiresIn: "14d" });
}

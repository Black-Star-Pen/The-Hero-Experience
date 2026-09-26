import type { ApiErrorBody } from "@hero-experience/shared";
import { rateLimit } from "express-rate-limit";

const FIFTEEN_MINUTES = 15 * 60 * 1000;

const tooManyRequests: ApiErrorBody = {
  error: {
    code: "TOO_MANY_REQUESTS",
    message: "Trop de requêtes, réessayez dans quelques minutes.",
  },
};

/** Global limit per IP address on the whole API. */
export const apiRateLimit = (limit: number) =>
  rateLimit({
    windowMs: FIFTEEN_MINUTES,
    limit,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: tooManyRequests,
  });

/** Brute-force protection of the credential endpoints: only failures count. */
export const bruteForceRateLimit = (limit: number) =>
  rateLimit({
    windowMs: FIFTEEN_MINUTES,
    limit,
    skipSuccessfulRequests: true,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
      error: {
        code: "TOO_MANY_ATTEMPTS",
        message: "Trop de tentatives, réessayez dans quelques minutes.",
      },
    } satisfies ApiErrorBody,
  });

import type { ApiErrorBody } from "@hero-experience/shared";
import type { Request } from "express";
import { ipKeyGenerator, rateLimit } from "express-rate-limit";

const FIFTEEN_MINUTES = 15 * 60 * 1000;

const tooManyRequests: ApiErrorBody = {
  error: {
    code: "TOO_MANY_REQUESTS",
    message: "Trop de requêtes, réessayez dans quelques minutes.",
  },
};

/**
 * Counts the requests per client IP address: read from the header of the
 * platform's edge when configured (behind Cloudflare, req.ip is the address of
 * a proxy shared by many visitors), otherwise from req.ip. IPv6 addresses are
 * grouped by /56 subnet, which one customer usually owns.
 */
const byClientIp =
  (header: string | undefined) =>
  (req: Request): string =>
    ipKeyGenerator((header && req.get(header)?.trim()) || req.ip || "unknown");

/** Global limit per IP address on the whole API. */
export const apiRateLimit = (limit: number, clientIpHeader?: string) =>
  rateLimit({
    windowMs: FIFTEEN_MINUTES,
    limit,
    keyGenerator: byClientIp(clientIpHeader),
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: tooManyRequests,
  });

/** Brute-force protection of the credential endpoints: only failures count. */
export const bruteForceRateLimit = (limit: number, clientIpHeader?: string) =>
  rateLimit({
    windowMs: FIFTEEN_MINUTES,
    limit,
    keyGenerator: byClientIp(clientIpHeader),
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

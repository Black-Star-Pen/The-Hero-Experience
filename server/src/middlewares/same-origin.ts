import type { RequestHandler } from "express";
import { HttpError } from "../lib/http-error.ts";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

/**
 * CSRF defense in depth, on top of SameSite cookies: browsers send an Origin
 * header with cross-site requests, which must match the host of the API.
 */
export const requireSameOrigin: RequestHandler = (req, _res, next) => {
  const origin = req.get("origin");
  if (SAFE_METHODS.has(req.method) || origin === undefined) {
    next();
    return;
  }
  let originHost: string | undefined;
  try {
    originHost = new URL(origin).host;
  } catch {
    originHost = undefined;
  }
  if (originHost !== req.host) {
    throw HttpError.forbidden("Origine de la requête non autorisée.");
  }
  next();
};

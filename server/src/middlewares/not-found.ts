import type { RequestHandler } from "express";
import { HttpError } from "../lib/http-error.ts";

export const notFoundHandler: RequestHandler = (req) => {
  throw HttpError.notFound(`Route introuvable : ${req.method} ${req.path}`);
};

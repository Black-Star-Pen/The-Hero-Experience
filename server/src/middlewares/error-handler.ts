import type { ErrorRequestHandler, Response } from "express";
import { HttpError } from "../lib/http-error.ts";

interface ApiErrorBody {
  error: { code: string; message: string; details?: unknown };
}

const send = (res: Response, status: number, error: ApiErrorBody["error"]) =>
  res.status(status).json({ error } satisfies ApiErrorBody);

/** Errors raised by body-parser, express.static… (http-errors with a 4xx status). */
interface ClientError extends Error {
  status: number;
  type?: string;
}

const isClientError = (error: unknown): error is ClientError =>
  error instanceof Error &&
  "status" in error &&
  typeof error.status === "number" &&
  error.status >= 400 &&
  error.status < 500;

const clientErrorBodies: Record<string, ApiErrorBody["error"]> = {
  "entity.parse.failed": {
    code: "INVALID_BODY",
    message: "Le corps de la requête n'est pas un JSON valide.",
  },
  "entity.too.large": {
    code: "PAYLOAD_TOO_LARGE",
    message: "La requête est trop volumineuse.",
  },
};

export const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
  if (res.headersSent) {
    next(error);
    return;
  }

  if (error instanceof HttpError) {
    send(res, error.status, {
      code: error.code,
      message: error.message,
      ...(error.details !== undefined && { details: error.details }),
    });
    return;
  }

  if (isClientError(error)) {
    const body = (error.type && clientErrorBodies[error.type]) || {
      code: error.status === 404 ? "NOT_FOUND" : "BAD_REQUEST",
      message:
        error.status === 404
          ? "Ressource introuvable."
          : "La requête est invalide.",
    };
    send(res, error.status, body);
    return;
  }

  req.log.error({ err: error }, "Unhandled error");
  send(res, 500, {
    code: "INTERNAL_ERROR",
    message: "Une erreur inattendue est survenue.",
  });
};

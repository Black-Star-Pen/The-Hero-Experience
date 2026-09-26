/**
 * An error that maps to an HTTP response. Every API error has the shape
 * `{ error: { code, message, details? } }` (see middlewares/error-handler.ts).
 */
export class HttpError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: unknown;

  constructor(
    status: number,
    code: string,
    message: string,
    details?: unknown,
  ) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.code = code;
    this.details = details;
  }

  static badRequest(message: string, details?: unknown): HttpError {
    return new HttpError(400, "VALIDATION_ERROR", message, details);
  }

  static unauthorized(message = "Authentification requise."): HttpError {
    return new HttpError(401, "UNAUTHORIZED", message);
  }

  static forbidden(message = "Action non autorisée."): HttpError {
    return new HttpError(403, "FORBIDDEN", message);
  }

  static notFound(message = "Ressource introuvable."): HttpError {
    return new HttpError(404, "NOT_FOUND", message);
  }

  static conflict(message: string, code = "CONFLICT"): HttpError {
    return new HttpError(409, code, message);
  }
}

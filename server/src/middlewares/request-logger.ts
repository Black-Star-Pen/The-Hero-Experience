import { randomUUID } from "node:crypto";
import { pinoHttp } from "pino-http";
import type { Logger } from "../lib/logger.ts";

/** Logs every request with a unique id, also returned in the X-Request-Id header. */
export function requestLogger(logger: Logger) {
  return pinoHttp({
    logger,
    genReqId: (_req, res) => {
      const id = randomUUID();
      res.setHeader("X-Request-Id", id);
      return id;
    },
    customLogLevel: (_req, res, error) => {
      if (error || res.statusCode >= 500) return "error";
      if (res.statusCode >= 400) return "warn";
      return "info";
    },
    customSuccessMessage: (req, res, responseTime) =>
      `${req.method} ${req.url} ${res.statusCode} (${Math.round(responseTime)} ms)`,
    customErrorMessage: (req, res) =>
      `${req.method} ${req.url} ${res.statusCode}`,
    // Headers are left out on purpose: they are noisy and may carry secrets
    serializers: {
      req: (req: { id: string; method: string; url: string }) => ({
        id: req.id,
        method: req.method,
        url: req.url,
      }),
      res: (res: { statusCode: number }) => ({ statusCode: res.statusCode }),
    },
    // Health probes are too frequent to be logged
    autoLogging: {
      ignore: (req) => req.url?.startsWith("/api/health") ?? false,
    },
  });
}

import express, { type Express } from "express";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";
import type { Env } from "./config/env.ts";
import type { Database } from "./db/client.ts";
import type { Logger } from "./lib/logger.ts";
import { errorHandler } from "./middlewares/error-handler.ts";
import { notFoundHandler } from "./middlewares/not-found.ts";
import { requestLogger } from "./middlewares/request-logger.ts";
import { serveClient } from "./middlewares/serve-client.ts";
import { createHealthRouter } from "./modules/health/health.routes.ts";

export interface AppDependencies {
  env: Env;
  logger: Logger;
  db: Database;
}

/** Builds the Express application. Dependencies are injected to keep it testable. */
export function createApp({ env, logger, db }: AppDependencies): Express {
  const app = express();

  app.set("trust proxy", env.TRUST_PROXY ? 1 : false);
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          // Hero pictures are served by the SuperHero API CDN
          "img-src": ["'self'", "data:", "https://cdn.jsdelivr.net"],
          // HTTPS is enforced by the reverse proxy, not by the app
          "upgrade-insecure-requests": null,
        },
      },
    }),
  );
  app.use(requestLogger(logger));

  const api = express.Router();
  api.use(express.json({ limit: "100kb" }));
  api.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 600,
      standardHeaders: "draft-8",
      legacyHeaders: false,
      skip: () => env.NODE_ENV === "test",
    }),
  );
  api.use("/health", createHealthRouter({ db }));
  api.use(notFoundHandler);
  app.use("/api", api);

  if (env.NODE_ENV === "production") {
    serveClient(app, env.CLIENT_DIST_DIR, logger);
  }

  app.use(errorHandler);
  return app;
}

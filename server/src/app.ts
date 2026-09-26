import cookieParser from "cookie-parser";
import express, { type Express } from "express";
import helmet from "helmet";
import type { Env } from "./config/env.ts";
import type { Database } from "./db/client.ts";
import type { Logger } from "./lib/logger.ts";
import { errorHandler } from "./middlewares/error-handler.ts";
import { notFoundHandler } from "./middlewares/not-found.ts";
import { apiRateLimit, bruteForceRateLimit } from "./middlewares/rate-limit.ts";
import { requestLogger } from "./middlewares/request-logger.ts";
import { requireSameOrigin } from "./middlewares/same-origin.ts";
import { serveClient } from "./middlewares/serve-client.ts";
import { authenticate } from "./modules/auth/auth.middleware.ts";
import { createAuthRouter } from "./modules/auth/auth.routes.ts";
import { createAuthService } from "./modules/auth/auth.service.ts";
import { createSessionService } from "./modules/auth/session.service.ts";
import { sessionCookie } from "./modules/auth/session-cookie.ts";
import { createSessionsRepository } from "./modules/auth/sessions.repository.ts";
import { createHealthRouter } from "./modules/health/health.routes.ts";
import { createHeroesRepository } from "./modules/heroes/heroes.repository.ts";
import { createHeroesRouter } from "./modules/heroes/heroes.routes.ts";
import { createHeroesService } from "./modules/heroes/heroes.service.ts";
import { createMeRouter } from "./modules/users/me.routes.ts";
import { createUsersRepository } from "./modules/users/users.repository.ts";
import { createUsersService } from "./modules/users/users.service.ts";

export interface AppDependencies {
  env: Env;
  logger: Logger;
  db: Database;
}

/** Builds the Express application. Dependencies are injected to keep it testable. */
export function createApp({ env, logger, db }: AppDependencies): Express {
  // Composition root: repositories -> services -> routers
  const users = createUsersRepository(db);
  const sessions = createSessionService(createSessionsRepository(db));
  const cookie = sessionCookie(env);

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
  api.use(apiRateLimit(env.API_RATE_LIMIT));
  api.use(cookieParser());
  api.use(authenticate(sessions, cookie));
  api.use(requireSameOrigin);

  api.use("/health", createHealthRouter({ db }));
  api.use(
    "/auth",
    createAuthRouter({
      auth: createAuthService({ users, sessions }),
      cookie,
      bruteForceLimiter: bruteForceRateLimit(env.AUTH_RATE_LIMIT),
    }),
  );
  api.use("/me", createMeRouter(createUsersService({ users, sessions })));
  api.use(
    "/heroes",
    createHeroesRouter(createHeroesService(createHeroesRepository(db))),
  );
  api.use(notFoundHandler);
  app.use("/api", api);

  if (env.NODE_ENV === "production") {
    serveClient(app, env.CLIENT_DIST_DIR, logger);
  }

  app.use(errorHandler);
  return app;
}

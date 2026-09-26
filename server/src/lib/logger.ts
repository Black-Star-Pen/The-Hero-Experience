import { pino, type Logger } from "pino";
import type { Env } from "../config/env.ts";

export type { Logger };

export function createLogger(env: Pick<Env, "NODE_ENV" | "LOG_LEVEL">): Logger {
  return pino({
    level: env.NODE_ENV === "test" ? "silent" : env.LOG_LEVEL,
    // Never write credentials or session cookies to the logs
    redact: [
      "req.headers.cookie",
      "req.headers.authorization",
      'res.headers["set-cookie"]',
    ],
    ...(env.NODE_ENV === "development" && {
      transport: {
        target: "pino-pretty",
        options: { translateTime: "SYS:HH:MM:ss", ignore: "pid,hostname" },
      },
    }),
  });
}

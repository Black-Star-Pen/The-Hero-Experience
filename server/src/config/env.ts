import path from "node:path";
import { z } from "zod";
import { serverRoot } from "./paths.ts";

const booleanString = z
  .enum(["true", "false", "1", "0"])
  .transform((value) => value === "true" || value === "1");

const envSchema = z.preprocess(
  // Empty values in a .env file (`KEY=`) mean "not set".
  (input) =>
    Object.fromEntries(
      Object.entries(input as Record<string, unknown>).filter(
        ([, value]) => value !== "",
      ),
    ),
  z
    .object({
      NODE_ENV: z
        .enum(["development", "test", "production"])
        .default("development"),
      PORT: z.coerce.number().int().min(1).max(65_535).default(3310),
      LOG_LEVEL: z
        .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
        .default("info"),
      /** PostgreSQL connection string. Without it, an embedded PGlite database is used. */
      DATABASE_URL: z.url({ protocol: /^postgres(ql)?$/ }).optional(),
      /** Where the embedded PGlite database is stored, relative to the server package. */
      PGLITE_DATA_DIR: z
        .string()
        .default(".data/pglite")
        .transform((dir) => path.resolve(serverRoot, dir)),
      /** Set to true behind a reverse proxy so client IPs are read from X-Forwarded-For. */
      TRUST_PROXY: booleanString.default(false),
      /**
       * Header holding the client IP address, set by the edge of the hosting
       * platform and impossible to forge there (cf-connecting-ip on Render,
       * which is behind Cloudflare). Used by the rate limiters instead of the
       * address of the last proxy.
       */
      CLIENT_IP_HEADER: z
        .string()
        .regex(/^[a-z0-9-]+$/i, "Nom d'en-tête HTTP invalide.")
        .transform((header) => header.toLowerCase())
        .optional(),
      /** Requests allowed per IP address and per 15 minutes on the whole API. */
      API_RATE_LIMIT: z.coerce.number().int().positive().default(600),
      /** Failed sign-in / sign-up attempts allowed per IP address and per 15 minutes. */
      AUTH_RATE_LIMIT: z.coerce.number().int().positive().default(10),
      /** Creates the demo account, bookings and reviews on start. Defaults to true in development. */
      DEMO_DATA: booleanString.optional(),
      /** Production build of the client, served by the API in production. */
      CLIENT_DIST_DIR: z
        .string()
        .default("../client/dist")
        .transform((dir) => path.resolve(serverRoot, dir)),
    })
    .refine((env) => env.NODE_ENV !== "production" || env.DATABASE_URL, {
      message: "DATABASE_URL is required in production",
      path: ["DATABASE_URL"],
    }),
);

export type Env = z.infer<typeof envSchema>;

export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const result = envSchema.safeParse(source);
  if (!result.success) {
    throw new Error(
      `Invalid environment variables:\n${z.prettifyError(result.error)}`,
    );
  }
  return result.data;
}

import { existsSync } from "node:fs";
import path from "node:path";
import express, { type Express } from "express";
import type { Logger } from "../lib/logger.ts";

/**
 * Serves the production build of the React client and falls back to
 * index.html for client-side routes. Must be registered after the API.
 */
export function serveClient(
  app: Express,
  distDir: string,
  logger: Logger,
): void {
  const indexFile = path.join(distDir, "index.html");
  if (!existsSync(indexFile)) {
    logger.warn({ distDir }, "Client build not found, the SPA is not served");
    return;
  }

  // Vite fingerprints these files: they can be cached forever
  app.use(
    "/assets",
    express.static(path.join(distDir, "assets"), {
      immutable: true,
      maxAge: "1y",
      fallthrough: false,
    }),
  );
  app.use(express.static(distDir, { index: false, maxAge: "1h" }));
  app.get("/{*splat}", (_req, res) => {
    res.setHeader("Cache-Control", "no-cache");
    res.sendFile(indexFile);
  });
}

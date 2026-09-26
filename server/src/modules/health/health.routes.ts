import { sql } from "drizzle-orm";
import { Router, type RequestHandler } from "express";
import type { Database } from "../../db/client.ts";

/**
 * Liveness probe for the hosting platform: the process answers. It never
 * queries the database, so that frequent probes let a serverless database
 * (Neon) scale to zero between visits.
 */
export const liveness: RequestHandler = (_req, res) => {
  res.json({ status: "ok", uptime: Math.round(process.uptime()) });
};

/** Liveness + database check, for monitoring and manual diagnostics. */
export function createHealthRouter({ db }: { db: Database }): Router {
  const router = Router();

  router.get("/", async (req, res) => {
    try {
      await db.execute(sql`select 1`);
      res.json({
        status: "ok",
        database: "up",
        uptime: Math.round(process.uptime()),
      });
    } catch (error) {
      req.log.error({ err: error }, "Database health check failed");
      res.status(503).json({ status: "degraded", database: "down" });
    }
  });

  return router;
}

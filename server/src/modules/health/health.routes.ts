import { sql } from "drizzle-orm";
import { Router } from "express";
import type { Database } from "../../db/client.ts";

/** Liveness + database check, used by Docker health checks and monitoring. */
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

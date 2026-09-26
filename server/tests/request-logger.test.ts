import { Writable } from "node:stream";
import express, { Router } from "express";
import { pino } from "pino";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { requestLogger } from "../src/middlewares/request-logger.ts";

/** An app with a nested router, whose log lines are kept in memory. */
function appWithLogs() {
  const lines: { msg: string }[] = [];
  const destination = new Writable({
    write(chunk: Buffer, _encoding, done) {
      lines.push(JSON.parse(chunk.toString()) as { msg: string });
      done();
    },
  });
  const app = express();
  app.use(requestLogger(pino(destination)));
  const auth = Router();
  auth.post("/login", (_req, res) => {
    res.sendStatus(204);
  });
  auth.post("/logout", (_req, res) => {
    res.sendStatus(401);
  });
  app.use("/api/auth", auth);
  return { app, lines };
}

describe("request logger", () => {
  it("logs the full path of requests handled by a nested router", async () => {
    const { app, lines } = appWithLogs();

    await request(app).post("/api/auth/login").expect(204);
    await request(app).post("/api/auth/logout?all=1").expect(401);

    expect(lines.map((line) => line.msg)).toEqual([
      expect.stringMatching(/^POST \/api\/auth\/login 204 \(\d+ ms\)$/),
      expect.stringMatching(/^POST \/api\/auth\/logout\?all=1 401 \(\d+ ms\)$/),
    ]);
  });

  it("does not log the health probes", async () => {
    const { app, lines } = appWithLogs();
    app.get("/api/health/live", (_req, res) => {
      res.json({ status: "ok" });
    });

    await request(app).get("/api/health/live").expect(200);

    expect(lines).toEqual([]);
  });
});

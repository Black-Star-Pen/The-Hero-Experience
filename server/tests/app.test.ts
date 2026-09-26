import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createTestApp } from "./helpers/test-app.ts";

describe("API foundation", () => {
  let testApp: Awaited<ReturnType<typeof createTestApp>>;

  beforeAll(async () => {
    testApp = await createTestApp();
  });
  afterAll(() => testApp.close());

  it("reports health, including the database", async () => {
    const response = await request(testApp.app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ status: "ok", database: "up" });
    expect(response.headers["x-request-id"]).toMatch(/^[0-9a-f-]{36}$/);
  });

  it("sets security headers and hides the framework", async () => {
    const response = await request(testApp.app).get("/api/health");

    expect(response.headers["x-content-type-options"]).toBe("nosniff");
    expect(response.headers["content-security-policy"]).toContain(
      "img-src 'self' data: https://cdn.jsdelivr.net",
    );
    expect(response.headers["x-powered-by"]).toBeUndefined();
  });

  it("answers unknown API routes with a JSON 404", async () => {
    const response = await request(testApp.app).get("/api/does-not-exist");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: {
        code: "NOT_FOUND",
        message: "Route introuvable : GET /does-not-exist",
      },
    });
  });

  it("rejects malformed JSON bodies", async () => {
    const response = await request(testApp.app)
      .post("/api/health")
      .set("Content-Type", "application/json")
      .send("{ not json");

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({ error: { code: "INVALID_BODY" } });
  });

  it("rejects bodies larger than 100 kB", async () => {
    const response = await request(testApp.app)
      .post("/api/health")
      .send({ text: "x".repeat(110 * 1024) });

    expect(response.status).toBe(413);
    expect(response.body).toMatchObject({
      error: { code: "PAYLOAD_TOO_LARGE" },
    });
  });
});

describe("production client serving", () => {
  let distDir: string;
  let testApp: Awaited<ReturnType<typeof createTestApp>>;

  beforeAll(async () => {
    distDir = mkdtempSync(path.join(tmpdir(), "hero-dist-"));
    mkdirSync(path.join(distDir, "assets"));
    writeFileSync(
      path.join(distDir, "index.html"),
      "<!doctype html><title>SPA</title>",
    );
    writeFileSync(
      path.join(distDir, "assets", "app-123.js"),
      "console.log('app')",
    );
    testApp = await createTestApp({
      NODE_ENV: "production",
      CLIENT_DIST_DIR: distDir,
    });
  });
  afterAll(async () => {
    await testApp.close();
    rmSync(distDir, { recursive: true, force: true });
  });

  it("serves index.html for client-side routes", async () => {
    for (const url of ["/", "/heros/42"]) {
      const response = await request(testApp.app).get(url);
      expect(response.status).toBe(200);
      expect(response.text).toContain("<title>SPA</title>");
      expect(response.headers["cache-control"]).toBe("no-cache");
    }
  });

  it("caches fingerprinted assets forever", async () => {
    const response = await request(testApp.app).get("/assets/app-123.js");

    expect(response.status).toBe(200);
    expect(response.headers["cache-control"]).toBe(
      "public, max-age=31536000, immutable",
    );
  });

  it("returns 404 for missing assets instead of index.html", async () => {
    const response = await request(testApp.app).get("/assets/missing.js");

    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({ error: { code: "NOT_FOUND" } });
  });

  it("keeps JSON errors for unknown API routes", async () => {
    const response = await request(testApp.app).get("/api/unknown");

    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({ error: { code: "NOT_FOUND" } });
  });
});

import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { loadEnv } from "../src/config/env.ts";
import { createTestApp, type TestApp } from "./helpers/test-app.ts";

describe("rate limiting behind the edge of the platform", () => {
  let testApp: TestApp;

  beforeAll(async () => {
    testApp = await createTestApp({
      API_RATE_LIMIT: 2,
      TRUST_PROXY: true,
      CLIENT_IP_HEADER: "cf-connecting-ip",
    });
  });
  afterAll(() => testApp.close());

  // Behind Cloudflare, every request reaches the app through a shared proxy
  const get = (clientIp: string, forwardedFor: string) =>
    request(testApp.app)
      .get("/api/health")
      .set("CF-Connecting-IP", clientIp)
      .set("X-Forwarded-For", `${forwardedFor}, 172.70.1.1`);

  it("counts the requests of each visitor, not of the shared proxy", async () => {
    await get("203.0.113.1", "203.0.113.1").expect(200);
    await get("203.0.113.1", "203.0.113.1").expect(200);
    await get("203.0.113.1", "203.0.113.1").expect(429);

    // Another visitor, through the same proxy, keeps their own quota
    await get("203.0.113.2", "203.0.113.2").expect(200);
  });

  it("ignores a forged X-Forwarded-For header", async () => {
    await get("203.0.113.3", "198.51.100.1").expect(200);
    await get("203.0.113.3", "198.51.100.2").expect(200);
    await get("203.0.113.3", "198.51.100.3").expect(429);
  });

  it("reads the name of the header from the environment", () => {
    expect(
      loadEnv({ CLIENT_IP_HEADER: "CF-Connecting-IP" }).CLIENT_IP_HEADER,
    ).toBe("cf-connecting-ip");
    expect(() => loadEnv({ CLIENT_IP_HEADER: "not a header" })).toThrow(
      /CLIENT_IP_HEADER/,
    );
  });
});

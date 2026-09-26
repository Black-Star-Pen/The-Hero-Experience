import path from "node:path";
import { describe, expect, it } from "vitest";
import { loadEnv } from "../src/config/env.ts";
import { serverRoot } from "../src/config/paths.ts";

describe("loadEnv", () => {
  it("provides development defaults", () => {
    expect(loadEnv({})).toEqual({
      NODE_ENV: "development",
      PORT: 3310,
      LOG_LEVEL: "info",
      PGLITE_DATA_DIR: path.join(serverRoot, ".data/pglite"),
      TRUST_PROXY: false,
      API_RATE_LIMIT: 600,
      AUTH_RATE_LIMIT: 10,
      CLIENT_DIST_DIR: path.resolve(serverRoot, "../client/dist"),
    });
  });

  it("treats empty values as not set", () => {
    const env = loadEnv({ PORT: "", DATABASE_URL: "", TRUST_PROXY: "" });

    expect(env.PORT).toBe(3310);
    expect(env.DATABASE_URL).toBeUndefined();
    expect(env.TRUST_PROXY).toBe(false);
  });

  it("parses and coerces custom values", () => {
    const env = loadEnv({
      PORT: "8080",
      TRUST_PROXY: "true",
      DATABASE_URL: "postgres://hero:secret@db:5432/hero",
    });

    expect(env).toMatchObject({
      PORT: 8080,
      TRUST_PROXY: true,
      DATABASE_URL: "postgres://hero:secret@db:5432/hero",
    });
  });

  it.each([
    [{ PORT: "abc" }, "PORT"],
    [{ DATABASE_URL: "mysql://hero@db/hero" }, "DATABASE_URL"],
    [{ NODE_ENV: "production" }, "DATABASE_URL is required in production"],
  ])("rejects invalid configuration %o", (source, expected) => {
    expect(() => loadEnv(source)).toThrow(expected);
  });
});

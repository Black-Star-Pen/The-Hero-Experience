import { describe, expect, it } from "vitest";
import { loginLink, safeRedirect } from "./redirect.ts";

describe("safeRedirect", () => {
  it("keeps the paths of the site", () => {
    expect(safeRedirect("/heros/620?service=sport#avis")).toBe(
      "/heros/620?service=sport#avis",
    );
  });

  it("falls back to the account for a missing or foreign target", () => {
    for (const target of [
      null,
      "",
      "heros",
      "https://evil.example",
      "//evil.example",
      "/\\evil.example",
      "javascript:alert(1)",
    ]) {
      expect(safeRedirect(target)).toBe("/compte");
    }
  });
});

describe("loginLink", () => {
  it("encodes the page to come back to", () => {
    expect(loginLink("/heros?service=sport")).toBe(
      "/connexion?redirect=%2Fheros%3Fservice%3Dsport",
    );
  });
});

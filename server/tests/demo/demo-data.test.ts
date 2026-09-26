import type { Booking, HeroReviews } from "@hero-experience/shared";
import { count } from "drizzle-orm";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createLogger } from "../../src/lib/logger.ts";
import {
  DEMO_ACCOUNT,
  seedDemoData,
} from "../../src/modules/demo/demo-data.ts";
import { reviews } from "../../src/modules/reviews/reviews.schema.ts";
import { users } from "../../src/modules/users/users.schema.ts";
import { createTestApp, type TestApp } from "../helpers/test-app.ts";

const today = "2026-10-01";
const clock = () => new Date(`${today}T10:00:00Z`);
const logger = createLogger({ NODE_ENV: "test", LOG_LEVEL: "silent" });

describe("demo data", () => {
  let testApp: TestApp;

  beforeAll(async () => {
    testApp = await createTestApp({}, { clock, withHeroes: true });
    await seedDemoData({ db: testApp.db, logger, today });
  });
  afterAll(() => testApp.close());

  it("creates a demo account that can sign in and has a history", async () => {
    const agent = request.agent(testApp.app);
    const login = await agent
      .post("/api/auth/login")
      .send({ email: DEMO_ACCOUNT.email, password: DEMO_ACCOUNT.password });
    expect(login.status).toBe(200);

    const bookings = (await agent.get("/api/bookings")).body as Booking[];
    expect(
      bookings.map(({ hero, status, cancellable }) => [
        hero.name,
        status,
        cancellable,
      ]),
    ).toEqual([
      ["Superman", "cancelled", false],
      ["Wonder Woman", "confirmed", true],
      ["Hulk", "confirmed", false],
    ]);
  });

  it("adds reviews of the heroes that exist in the catalogue", async () => {
    const spiderMan = (
      await request(testApp.app).get("/api/heroes/620/reviews")
    ).body as HeroReviews;

    expect(spiderMan.summary.count).toBe(3);
    expect(spiderMan.items[0]?.author).toMatch(/^\w+ \w\.$/);
  });

  it("runs only once", async () => {
    const before = await testApp.db.select({ total: count() }).from(reviews);
    await seedDemoData({ db: testApp.db, logger, today });
    const after = await testApp.db.select({ total: count() }).from(reviews);

    expect(after).toEqual(before);
  });

  it("does nothing without a catalogue", async () => {
    const empty = await createTestApp();
    await seedDemoData({ db: empty.db, logger, today });

    const [total] = await empty.db.select({ total: count() }).from(users);
    expect(total?.total).toBe(0);
    await empty.close();
  });
});

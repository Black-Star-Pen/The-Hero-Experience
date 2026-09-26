import {
  addDays,
  type Booking,
  type HeroReviews,
  type SessionResponse,
} from "@hero-experience/shared";
import { count, eq } from "drizzle-orm";
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
const now = new Date(`${today}T10:00:00Z`);
const logger = createLogger({ NODE_ENV: "test", LOG_LEVEL: "silent" });

const summary = (bookings: Booking[]) =>
  bookings.map(({ hero, status, startDate }) => [hero.name, status, startDate]);

describe("demo data", () => {
  let testApp: TestApp;

  beforeAll(async () => {
    testApp = await createTestApp({}, { clock: () => now, withHeroes: true });
    await seedDemoData({ db: testApp.db, logger, now });
  });
  afterAll(() => testApp.close());

  const signInAsDemo = async () => {
    const agent = request.agent(testApp.app);
    await agent
      .post("/api/auth/login")
      .send({ email: DEMO_ACCOUNT.email, password: DEMO_ACCOUNT.password })
      .expect(200);
    return agent;
  };

  it("creates a demo account that can sign in and has a history", async () => {
    const agent = await signInAsDemo();

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

  it("keeps the profile and the password of the demo account", async () => {
    const agent = await signInAsDemo();

    const profile = await agent.patch("/api/me").send({ firstName: "Venom" });
    const password = await agent.put("/api/me/password").send({
      currentPassword: DEMO_ACCOUNT.password,
      newPassword: "nobody-else-can-sign-in",
    });

    for (const response of [profile, password]) {
      expect(response.status).toBe(403);
      expect(response.body).toMatchObject({
        error: { code: "DEMO_ACCOUNT_READ_ONLY" },
      });
    }
    await signInAsDemo();
  });

  it("is created only once a day", async () => {
    const before = await testApp.db.select({ total: count() }).from(reviews);
    await seedDemoData({
      db: testApp.db,
      logger,
      now: new Date(`${today}T21:30:00Z`),
    });
    const after = await testApp.db.select({ total: count() }).from(reviews);

    expect(after).toEqual(before);
  });

  it("undoes the next day what visitors changed, without signing them out", async () => {
    const agent = await signInAsDemo();
    const [wonderWoman] = (
      (await agent.get("/api/bookings")).body as Booking[]
    ).filter(({ hero }) => hero.name === "Wonder Woman");
    await agent.post(`/api/bookings/${wonderWoman?.id}/cancel`).expect(200);
    // Changed before the account was protected
    await testApp.db
      .update(users)
      .set({ firstName: "Venom" })
      .where(eq(users.email, DEMO_ACCOUNT.email));

    const tomorrow = addDays(today, 1);
    await seedDemoData({
      db: testApp.db,
      logger,
      now: new Date(`${tomorrow}T00:30:00Z`),
    });

    const session = (await agent.get("/api/auth/session"))
      .body as SessionResponse;
    expect(session.user?.firstName).toBe("Mary Jane");
    const bookings = (await agent.get("/api/bookings")).body as Booking[];
    expect(summary(bookings)).toEqual([
      ["Superman", "cancelled", addDays(tomorrow, 30)],
      ["Wonder Woman", "confirmed", addDays(tomorrow, 12)],
      ["Hulk", "confirmed", addDays(tomorrow, -40)],
    ]);
    const spiderMan = (
      await request(testApp.app).get("/api/heroes/620/reviews")
    ).body as HeroReviews;
    expect(spiderMan.summary.count).toBe(3);
  });

  it("does nothing without a catalogue", async () => {
    const empty = await createTestApp();
    await seedDemoData({ db: empty.db, logger, now });

    const [total] = await empty.db.select({ total: count() }).from(users);
    expect(total?.total).toBe(0);
    await empty.close();
  });
});

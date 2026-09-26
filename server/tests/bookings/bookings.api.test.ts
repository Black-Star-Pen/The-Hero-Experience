import type {
  Booking,
  HeroAvailability,
  HeroDetail,
  HeroSummary,
  Paginated,
} from "@hero-experience/shared";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createTestApp, type TestApp } from "../helpers/test-app.ts";

// "Today" is 2026-10-01 in Paris for the whole file
const clock = () => new Date("2026-10-01T10:00:00Z");

const address = {
  address: "20 Ingram Street",
  postalCode: "75011",
  city: "Paris",
  phone: "06 12 34 56 78",
};
const spiderMan = { heroId: 620, service: "sport", ...address };

describe("bookings API", () => {
  let testApp: TestApp;
  let customer: ReturnType<typeof request.agent>;

  const book = (
    agent: ReturnType<typeof request.agent>,
    body: Record<string, unknown>,
  ) => agent.post("/api/bookings").send(body);

  beforeAll(async () => {
    testApp = await createTestApp({}, { clock, withHeroes: true });
    customer = await testApp.signUp();
  });
  afterAll(() => testApp.close());

  it("requires a signed-in customer", async () => {
    const response = await request(testApp.app)
      .post("/api/bookings")
      .send({ ...spiderMan, startDate: "2026-10-10", endDate: "2026-10-12" });

    expect(response.status).toBe(401);
  });

  it("creates a booking priced by the server", async () => {
    const response = await book(customer, {
      ...spiderMan,
      startDate: "2026-10-10",
      endDate: "2026-10-12",
      totalPrice: 1,
      notes: "Mon fils adore le parkour",
    });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      hero: { id: 620, name: "Spider-Man" },
      service: "sport",
      startDate: "2026-10-10",
      endDate: "2026-10-12",
      days: 3,
      dailyRate: 130,
      totalPrice: 390,
      status: "confirmed",
      notes: "Mon fils adore le parkour",
      cancellable: true,
    });
  });

  it("refuses overlapping dates but accepts the next day", async () => {
    const rival = await testApp.signUp("Eddie", "Brock");

    const overlap = await book(rival, {
      ...spiderMan,
      startDate: "2026-10-12",
      endDate: "2026-10-15",
    });
    expect(overlap.status).toBe(409);
    expect(overlap.body).toMatchObject({
      error: {
        code: "HERO_UNAVAILABLE",
        message: "Spider-Man est déjà réservé sur une partie de ces dates.",
      },
    });

    const nextDay = await book(rival, {
      ...spiderMan,
      startDate: "2026-10-13",
      endDate: "2026-10-14",
    });
    expect(nextDay.status).toBe(201);
  });

  it("lets only one of two simultaneous bookings through", async () => {
    const [first, second] = await Promise.all([
      book(customer, {
        ...spiderMan,
        startDate: "2026-11-02",
        endDate: "2026-11-03",
      }),
      book(customer, {
        ...spiderMan,
        startDate: "2026-11-03",
        endDate: "2026-11-04",
      }),
    ]);

    expect([first.status, second.status].sort()).toEqual([201, 409]);
  });

  it.each([
    [{ startDate: "2026-09-30", endDate: "2026-10-02" }, "startDate"],
    [
      { service: "musique", startDate: "2026-10-20", endDate: "2026-10-20" },
      "service",
    ],
    [{ startDate: "2026-10-20", endDate: "2026-10-18" }, "endDate"],
    [{ startDate: "2026-10-20", endDate: "2026-11-20" }, "endDate"],
    [
      { startDate: "2026-10-20", endDate: "2026-10-20", postalCode: "750" },
      "postalCode",
    ],
  ])("rejects an invalid booking %o", async (overrides, field) => {
    const response = await book(customer, { ...spiderMan, ...overrides });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      error: { details: { fieldErrors: { [field]: expect.any(Array) } } },
    });
  });

  it("answers 404 for an unknown hero", async () => {
    const response = await book(customer, {
      ...spiderMan,
      heroId: 99999,
      startDate: "2026-10-20",
      endDate: "2026-10-20",
    });

    expect(response.status).toBe(404);
  });

  it("lists only the customer's own bookings, latest first", async () => {
    const response = await customer.get("/api/bookings");

    expect(response.status).toBe(200);
    const bookings = response.body as Booking[];
    expect(bookings.map((booking) => booking.startDate)).toEqual([
      expect.stringMatching(/^2026-11-0[23]$/),
      "2026-10-10",
    ]);
  });

  describe("cancellation", () => {
    it("cancels a future booking and frees its dates", async () => {
      const created = (
        await book(customer, {
          ...spiderMan,
          startDate: "2026-12-01",
          endDate: "2026-12-02",
        })
      ).body as Booking;

      const response = await customer.post(
        `/api/bookings/${created.id}/cancel`,
      );

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        status: "cancelled",
        cancellable: false,
        cancelledAt: expect.any(String),
      });
      const rebooked = await book(customer, {
        ...spiderMan,
        startDate: "2026-12-01",
        endDate: "2026-12-01",
      });
      expect(rebooked.status).toBe(201);

      const again = await customer.post(`/api/bookings/${created.id}/cancel`);
      expect(again.status).toBe(409);
    });

    it("cannot cancel a booking that starts today", async () => {
      const created = (
        await book(customer, {
          ...spiderMan,
          startDate: "2026-10-01",
          endDate: "2026-10-01",
        })
      ).body as Booking;
      expect(created.cancellable).toBe(false);

      const response = await customer.post(
        `/api/bookings/${created.id}/cancel`,
      );

      expect(response.status).toBe(409);
      expect(response.body).toMatchObject({
        error: { code: "BOOKING_NOT_CANCELLABLE" },
      });
    });

    it("hides the bookings of other customers", async () => {
      const [mine] = (await customer.get("/api/bookings")).body as Booking[];
      const stranger = await testApp.signUp("Otto", "Octavius");

      const response = await stranger.post(`/api/bookings/${mine?.id}/cancel`);

      expect(response.status).toBe(404);
    });
  });

  describe("availability", () => {
    it("exposes the booked periods only", async () => {
      const response = await request(testApp.app).get(
        "/api/heroes/620/availability?from=2026-10-01&to=2026-10-31",
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        from: "2026-10-01",
        to: "2026-10-31",
        bookedRanges: [
          { start: "2026-10-01", end: "2026-10-01" },
          { start: "2026-10-10", end: "2026-10-12" },
          { start: "2026-10-13", end: "2026-10-14" },
        ],
      } satisfies HeroAvailability);
    });

    it("defaults to the next 90 days", async () => {
      const response = await request(testApp.app).get(
        "/api/heroes/620/availability",
      );

      expect(response.body).toMatchObject({
        from: "2026-10-01",
        to: "2026-12-30",
      });
    });

    it("rejects an inverted period and an unknown hero", async () => {
      const inverted = await request(testApp.app).get(
        "/api/heroes/620/availability?from=2026-10-10&to=2026-10-01",
      );
      expect(inverted.status).toBe(400);

      const unknown = await request(testApp.app).get(
        "/api/heroes/99999/availability",
      );
      expect(unknown.status).toBe(404);
    });

    it("drives the catalogue filters and the next free day", async () => {
      const heroes = (
        await request(testApp.app).get(
          "/api/heroes?availableOn=2026-10-11&pageSize=48",
        )
      ).body as Paginated<HeroSummary>;
      expect(heroes.items.map((hero) => hero.name)).not.toContain("Spider-Man");
      expect(heroes.total).toBe(10);

      const spider = (await request(testApp.app).get("/api/heroes/620"))
        .body as HeroDetail;
      // Booked today (2026-10-01), free tomorrow
      expect(spider.nextAvailableDate).toBe("2026-10-02");
    });
  });
});

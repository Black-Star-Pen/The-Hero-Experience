import type {
  HeroReviews,
  HeroSummary,
  Paginated,
} from "@hero-experience/shared";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createTestApp, type TestApp } from "../helpers/test-app.ts";

const clock = () => new Date("2026-10-01T10:00:00Z");

describe("reviews API", () => {
  let testApp: TestApp;
  let peter: ReturnType<typeof request.agent>;

  const bookSpiderMan = (
    agent: ReturnType<typeof request.agent>,
    day = "2026-10-05",
  ) =>
    agent.post("/api/bookings").send({
      heroId: 620,
      service: "sport",
      startDate: day,
      endDate: day,
      address: "20 Ingram Street",
      postalCode: "75011",
      city: "Paris",
      phone: "06 12 34 56 78",
    });
  const reviewsOf = async (
    agent: ReturnType<typeof request.agent>,
    query = "",
  ) => {
    const response = await agent.get(`/api/heroes/620/reviews${query}`);
    expect(response.status).toBe(200);
    return response.body as HeroReviews;
  };

  beforeAll(async () => {
    testApp = await createTestApp({}, { clock, withHeroes: true });
    peter = await testApp.signUp("Peter", "parker");
  });
  afterAll(() => testApp.close());

  it("starts empty for visitors", async () => {
    expect(await reviewsOf(request(testApp.app))).toEqual({
      items: [],
      page: 1,
      pageSize: 5,
      total: 0,
      totalPages: 0,
      summary: { average: null, count: 0 },
      mine: null,
      canReview: false,
    });
  });

  it("is reserved to customers who booked the hero", async () => {
    const anonymous = await request(testApp.app)
      .put("/api/heroes/620/reviews/mine")
      .send({ rating: 5, comment: "Incroyable, je recommande !" });
    expect(anonymous.status).toBe(401);

    const withoutBooking = await peter
      .put("/api/heroes/620/reviews/mine")
      .send({ rating: 5, comment: "Incroyable, je recommande !" });
    expect(withoutBooking.status).toBe(403);
    expect(withoutBooking.body).toMatchObject({
      error: { code: "REVIEW_NOT_ALLOWED" },
    });
    expect((await reviewsOf(peter)).canReview).toBe(false);
  });

  it("publishes the review with the author's first name and initial", async () => {
    await bookSpiderMan(peter);
    expect((await reviewsOf(peter)).canReview).toBe(true);

    const response = await peter.put("/api/heroes/620/reviews/mine").send({
      rating: 5,
      comment: "  Mon fils a adoré son cours de parkour !  ",
    });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      rating: 5,
      comment: "Mon fils a adoré son cours de parkour !",
      author: "Peter P.",
    });
  });

  it("edits the review instead of adding a second one", async () => {
    await peter
      .put("/api/heroes/620/reviews/mine")
      .send({ rating: 4, comment: "Très bien, un peu en retard." });

    const reviews = await reviewsOf(peter);
    expect(reviews.total).toBe(1);
    expect(reviews.mine).toMatchObject({
      rating: 4,
      comment: "Très bien, un peu en retard.",
    });
  });

  it("aggregates the ratings on the catalogue", async () => {
    const mary = await testApp.signUp("Mary Jane", "Watson");
    expect((await bookSpiderMan(mary, "2026-10-06")).status).toBe(201);
    await mary
      .put("/api/heroes/620/reviews/mine")
      .send({ rating: 5, comment: "Un vrai gentleman, et très souple." });

    const reviews = await reviewsOf(request(testApp.app));
    expect(reviews.summary).toEqual({ average: 4.5, count: 2 });
    expect(reviews.items.map((review) => review.author)).toEqual([
      "Mary Jane W.",
      "Peter P.",
    ]);

    const byRating = (await request(testApp.app).get("/api/heroes?sort=rating"))
      .body as Paginated<HeroSummary>;
    expect(byRating.items[0]).toMatchObject({
      name: "Spider-Man",
      rating: { average: 4.5, count: 2 },
    });
  });

  it("paginates", async () => {
    const page = await reviewsOf(request(testApp.app), "?pageSize=1&page=2");

    expect(page).toMatchObject({
      page: 2,
      pageSize: 1,
      total: 2,
      totalPages: 2,
    });
    expect(page.items).toHaveLength(1);
  });

  it.each([
    [{ rating: 6, comment: "Beaucoup trop bien !" }, "rating"],
    [{ rating: 3, comment: "Bof" }, "comment"],
  ])("validates %o", async (body, field) => {
    const response = await peter.put("/api/heroes/620/reviews/mine").send(body);

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      error: { details: { fieldErrors: { [field]: expect.any(Array) } } },
    });
  });

  it("deletes the customer's review", async () => {
    expect((await peter.delete("/api/heroes/620/reviews/mine")).status).toBe(
      204,
    );
    expect((await peter.delete("/api/heroes/620/reviews/mine")).status).toBe(
      404,
    );
    expect((await reviewsOf(peter)).mine).toBeNull();
  });

  it("answers 404 for an unknown hero", async () => {
    const response = await request(testApp.app).get(
      "/api/heroes/99999/reviews",
    );

    expect(response.status).toBe(404);
  });
});

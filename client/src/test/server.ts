import {
  countDays,
  DEMO_CREDENTIALS,
  type Booking,
  type BookingInput,
  type ChangePasswordInput,
  type HeroSummary,
  type LoginInput,
  type Paginated,
  type ProfileInput,
  type RegisterInput,
  type Review,
  type ReviewInput,
  type User,
} from "@hero-experience/shared";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import {
  demoUser,
  hulk,
  spiderMan,
  spiderManAvailability,
  spiderManReviews,
} from "./fixtures.ts";

const heroes: HeroSummary[] = [spiderMan, hulk];

/** What the fake API remembers during a test (reset after each test). */
const state: {
  user: User | null;
  bookings: Booking[];
  review: Review | null;
} = { user: null, bookings: [], review: null };

export function resetFakeApi() {
  state.user = null;
  state.bookings = [];
  state.review = null;
}

/** Starts the test signed in, with the given bookings. */
export function signIn({
  user = demoUser,
  bookings = [],
}: { user?: User; bookings?: Booking[] } = {}) {
  state.user = user;
  state.bookings = structuredClone(bookings);
}

const error = (status: number, code: string, message: string) =>
  HttpResponse.json({ error: { code, message } }, { status });

const unauthorized = () =>
  error(401, "UNAUTHORIZED", "Authentification requise.");

const hasBooked = (heroId: number) =>
  state.bookings.some(
    (booking) => booking.hero.id === heroId && booking.status === "confirmed",
  );

/** Fake API used by the component tests; each test can override a handler. */
export const server = setupServer(
  http.get("*/api/heroes", ({ request }) => {
    const params = new URL(request.url).searchParams;
    const service = params.get("service");
    const search = params.get("search")?.toLowerCase();
    const items = heroes.filter(
      (hero) =>
        (!service ||
          hero.services.includes(service as HeroSummary["services"][number])) &&
        (!search || hero.name.toLowerCase().includes(search)),
    );
    return HttpResponse.json({
      items,
      page: Number(params.get("page") ?? 1),
      pageSize: 12,
      total: items.length,
      totalPages: items.length > 0 ? 1 : 0,
    } satisfies Paginated<HeroSummary>);
  }),
  http.get("*/api/heroes/620", () => HttpResponse.json(spiderMan)),
  http.get("*/api/heroes/620/availability", () =>
    HttpResponse.json(spiderManAvailability),
  ),
  http.get("*/api/heroes/620/reviews", () => {
    const mine = state.user ? state.review : null;
    return HttpResponse.json({
      ...spiderManReviews,
      items: mine ? [mine, ...spiderManReviews.items] : spiderManReviews.items,
      mine,
      canReview: state.user !== null && hasBooked(spiderMan.id),
    });
  }),
  http.put("*/api/heroes/620/reviews/mine", async ({ request }) => {
    if (!state.user) return unauthorized();
    if (!hasBooked(spiderMan.id)) {
      return error(
        403,
        "REVIEW_NOT_ALLOWED",
        "Seuls les clients ayant réservé ce héros peuvent laisser un avis.",
      );
    }
    const input = (await request.json()) as ReviewInput;
    state.review = {
      id: 99,
      ...input,
      author: `${state.user.firstName} ${state.user.lastName.charAt(0)}.`,
      createdAt: "2026-09-26T10:00:00.000Z",
      updatedAt: "2026-09-26T10:00:00.000Z",
    };
    return HttpResponse.json(state.review);
  }),
  http.delete("*/api/heroes/620/reviews/mine", () => {
    if (!state.user) return unauthorized();
    state.review = null;
    return new HttpResponse(null, { status: 204 });
  }),
  http.get("*/api/heroes/:id", () =>
    error(404, "NOT_FOUND", "Ce héros n'existe pas."),
  ),

  http.get("*/api/auth/session", () => HttpResponse.json({ user: state.user })),
  http.post("*/api/auth/login", async ({ request }) => {
    const { email, password } = (await request.json()) as LoginInput;
    if (
      email !== DEMO_CREDENTIALS.email ||
      password !== DEMO_CREDENTIALS.password
    ) {
      return error(
        401,
        "INVALID_CREDENTIALS",
        "Adresse e-mail ou mot de passe incorrect.",
      );
    }
    state.user = demoUser;
    return HttpResponse.json({ user: demoUser });
  }),
  http.post("*/api/auth/register", async ({ request }) => {
    const input = (await request.json()) as RegisterInput;
    if (input.email === demoUser.email) {
      return error(
        409,
        "EMAIL_TAKEN",
        "Un compte existe déjà avec cette adresse e-mail.",
      );
    }
    state.user = {
      id: 2,
      email: input.email,
      firstName: input.firstName,
      lastName: input.lastName,
      phone: null,
      address: null,
      postalCode: null,
      city: null,
      createdAt: "2026-09-26T10:00:00.000Z",
    };
    return HttpResponse.json({ user: state.user }, { status: 201 });
  }),
  http.post("*/api/auth/logout", () => {
    state.user = null;
    return new HttpResponse(null, { status: 204 });
  }),
  http.patch("*/api/me", async ({ request }) => {
    if (!state.user) return unauthorized();
    state.user = {
      ...state.user,
      ...((await request.json()) as ProfileInput),
    };
    return HttpResponse.json({ user: state.user });
  }),
  http.put("*/api/me/password", async ({ request }) => {
    if (!state.user) return unauthorized();
    const { currentPassword } = (await request.json()) as ChangePasswordInput;
    if (currentPassword !== DEMO_CREDENTIALS.password) {
      const message = "Le mot de passe actuel est incorrect.";
      return HttpResponse.json(
        {
          error: {
            code: "INVALID_PASSWORD",
            message,
            details: {
              formErrors: [],
              fieldErrors: { currentPassword: [message] },
            },
          },
        },
        { status: 400 },
      );
    }
    return new HttpResponse(null, { status: 204 });
  }),

  http.get("*/api/bookings", () =>
    state.user ? HttpResponse.json(state.bookings) : unauthorized(),
  ),
  http.post("*/api/bookings", async ({ request }) => {
    if (!state.user) return unauthorized();
    const input = (await request.json()) as BookingInput;
    const hero = heroes.find(({ id }) => id === input.heroId) ?? spiderMan;
    const days = countDays(input.startDate, input.endDate);
    const booking: Booking = {
      id: state.bookings.length + 1,
      hero: { id: hero.id, name: hero.name, imageUrl: hero.imageUrl },
      service: input.service,
      startDate: input.startDate,
      endDate: input.endDate,
      days,
      dailyRate: hero.dailyRate,
      totalPrice: days * hero.dailyRate,
      status: "confirmed",
      address: input.address,
      postalCode: input.postalCode,
      city: input.city,
      phone: input.phone,
      notes: input.notes ?? null,
      createdAt: "2026-09-26T10:00:00.000Z",
      cancelledAt: null,
      cancellable: true,
    };
    state.bookings.push(booking);
    return HttpResponse.json(booking, { status: 201 });
  }),
  http.post("*/api/bookings/:id/cancel", ({ params }) => {
    if (!state.user) return unauthorized();
    const booking = state.bookings.find(({ id }) => id === Number(params.id));
    if (!booking) return error(404, "NOT_FOUND", "Réservation introuvable.");
    booking.status = "cancelled";
    booking.cancelledAt = "2026-09-26T10:00:00.000Z";
    booking.cancellable = false;
    return HttpResponse.json(booking);
  }),
);

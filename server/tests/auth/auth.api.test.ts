import type { SessionResponse, User } from "@hero-experience/shared";
import { eq } from "drizzle-orm";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { users } from "../../src/modules/users/users.schema.ts";
import { createTestApp } from "../helpers/test-app.ts";

const peter = {
  email: "Peter.Parker@Example.com",
  password: "with-great-power",
  firstName: "Peter",
  lastName: "Parker",
};

const cookiesOf = (response: request.Response): string[] => {
  const header = response.headers["set-cookie"] as
    string[] | string | undefined;
  return Array.isArray(header) ? header : header ? [header] : [];
};

describe("authentication API", () => {
  let testApp: Awaited<ReturnType<typeof createTestApp>>;
  let counter = 0;

  /** Registers a fresh account and returns an agent that keeps its cookie. */
  const signUp = async (overrides: Partial<typeof peter> = {}) => {
    counter += 1;
    const agent = request.agent(testApp.app);
    const account = {
      ...peter,
      email: `user${counter}@example.com`,
      ...overrides,
    };
    const response = await agent.post("/api/auth/register").send(account);
    expect(response.status).toBe(201);
    return { agent, account, user: (response.body as { user: User }).user };
  };

  const sessionUser = async (agent: ReturnType<typeof request.agent>) =>
    ((await agent.get("/api/auth/session")).body as SessionResponse).user;

  beforeAll(async () => {
    testApp = await createTestApp();
  });
  afterAll(() => testApp.close());

  describe("register", () => {
    it("creates the account and signs the user in", async () => {
      const agent = request.agent(testApp.app);
      const response = await agent.post("/api/auth/register").send(peter);

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        user: {
          id: expect.any(Number),
          email: "peter.parker@example.com",
          firstName: "Peter",
          lastName: "Parker",
          phone: null,
          address: null,
          postalCode: null,
          city: null,
          createdAt: expect.any(String),
        },
      });
      const [cookie] = cookiesOf(response);
      expect(cookie).toMatch(/^session=[\w-]{43};/);
      expect(cookie).toContain("HttpOnly");
      expect(cookie).toContain("SameSite=Lax");
      expect(cookie).toContain("Path=/");
      expect(await sessionUser(agent)).toMatchObject({
        email: "peter.parker@example.com",
      });
    });

    it("stores an Argon2id hash, never the password", async () => {
      const [row] = await testApp.db
        .select()
        .from(users)
        .where(eq(users.email, "peter.parker@example.com"));

      expect(row?.passwordHash).toMatch(/^\$argon2id\$v=19\$m=19456,t=2,p=1\$/);
      expect(row?.passwordHash).not.toContain(peter.password);
    });

    it("refuses an e-mail already used, whatever the case", async () => {
      const response = await request(testApp.app)
        .post("/api/auth/register")
        .send({ ...peter, email: "PETER.PARKER@example.com" });

      expect(response.status).toBe(409);
      expect(response.body).toMatchObject({ error: { code: "EMAIL_TAKEN" } });
    });

    it("validates the form field by field", async () => {
      const response = await request(testApp.app)
        .post("/api/auth/register")
        .send({ email: "not-an-email", password: "short", firstName: " " });

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        error: {
          code: "VALIDATION_ERROR",
          details: {
            fieldErrors: {
              email: ["Adresse e-mail invalide."],
              password: [
                "Le mot de passe doit contenir au moins 8 caractères.",
              ],
              firstName: ["Le prénom est obligatoire."],
              lastName: expect.any(Array),
            },
          },
        },
      });
    });
  });

  describe("login", () => {
    it("signs in with the right password, whatever the e-mail case", async () => {
      const { account } = await signUp();
      const agent = request.agent(testApp.app);

      const response = await agent.post("/api/auth/login").send({
        email: account.email.toUpperCase(),
        password: account.password,
      });

      expect(response.status).toBe(200);
      expect(cookiesOf(response)[0]).toMatch(/^session=/);
      expect(await sessionUser(agent)).toMatchObject({ email: account.email });
    });

    it("gives the same answer for a wrong password and an unknown e-mail", async () => {
      const { account } = await signUp();
      const wrongPassword = await request(testApp.app)
        .post("/api/auth/login")
        .send({ email: account.email, password: "not-the-password" });
      const unknownEmail = await request(testApp.app)
        .post("/api/auth/login")
        .send({ email: "nobody@example.com", password: "not-the-password" });

      expect(wrongPassword.status).toBe(401);
      expect(unknownEmail.status).toBe(401);
      expect(wrongPassword.body).toEqual(unknownEmail.body);
      expect(wrongPassword.body).toMatchObject({
        error: { code: "INVALID_CREDENTIALS" },
      });
    });
  });

  describe("session and logout", () => {
    it("returns a null user for visitors", async () => {
      const response = await request(testApp.app).get("/api/auth/session");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ user: null });
    });

    it("clears an invalid session cookie", async () => {
      const response = await request(testApp.app)
        .get("/api/auth/session")
        .set("Cookie", "session=forged-token");

      expect(response.body).toEqual({ user: null });
      expect(cookiesOf(response)[0]).toMatch(
        /^session=;.*Expires=Thu, 01 Jan 1970/,
      );
    });

    it("revokes the session on logout", async () => {
      const { agent } = await signUp();
      const token = cookiesOf(
        await agent.post("/api/auth/login").send({
          email: `user${counter}@example.com`,
          password: peter.password,
        }),
      )[0]?.split(";")[0];

      const response = await agent.post("/api/auth/logout");

      expect(response.status).toBe(204);
      expect(cookiesOf(response)[0]).toMatch(/^session=;/);
      const replay = await request(testApp.app)
        .get("/api/auth/session")
        .set("Cookie", token ?? "");
      expect(replay.body).toEqual({ user: null });
    });
  });

  describe("PATCH /api/me", () => {
    it("requires a signed-in user", async () => {
      const response = await request(testApp.app)
        .patch("/api/me")
        .send({ city: "Paris" });

      expect(response.status).toBe(401);
      expect(response.body).toMatchObject({ error: { code: "UNAUTHORIZED" } });
    });

    it("updates the profile, empty fields becoming null", async () => {
      const { agent } = await signUp();

      const response = await agent.patch("/api/me").send({
        firstName: "  Miles ",
        phone: "06 12 34 56 78",
        address: "20 Ingram Street",
        postalCode: "75011",
        city: "",
      });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        user: {
          firstName: "Miles",
          lastName: "Parker",
          phone: "06 12 34 56 78",
          address: "20 Ingram Street",
          postalCode: "75011",
          city: null,
        },
      });
    });

    it("rejects an invalid postal code", async () => {
      const { agent } = await signUp();

      const response = await agent
        .patch("/api/me")
        .send({ postalCode: "7501" });

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        error: {
          details: {
            fieldErrors: {
              postalCode: ["Le code postal doit contenir 5 chiffres."],
            },
          },
        },
      });
    });
  });

  describe("PUT /api/me/password", () => {
    it("checks the current password", async () => {
      const { agent } = await signUp();

      const response = await agent.put("/api/me/password").send({
        currentPassword: "wrong-password",
        newPassword: "a-new-password",
      });

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        error: { code: "INVALID_PASSWORD" },
      });
    });

    it("changes the password and signs out the other devices", async () => {
      const { agent, account } = await signUp();
      const otherDevice = request.agent(testApp.app);
      await otherDevice
        .post("/api/auth/login")
        .send({ email: account.email, password: account.password });

      const response = await agent.put("/api/me/password").send({
        currentPassword: account.password,
        newPassword: "an-even-better-password",
      });

      expect(response.status).toBe(204);
      expect(await sessionUser(agent)).not.toBeNull();
      expect(await sessionUser(otherDevice)).toBeNull();
      const login = await request(testApp.app)
        .post("/api/auth/login")
        .send({ email: account.email, password: "an-even-better-password" });
      expect(login.status).toBe(200);
    });
  });

  describe("CSRF protection", () => {
    it("refuses state-changing requests from another origin", async () => {
      const response = await request(testApp.app)
        .post("/api/auth/login")
        .set("Origin", "https://evil.example")
        .send({ email: peter.email, password: peter.password });

      expect(response.status).toBe(403);
      expect(response.body).toMatchObject({ error: { code: "FORBIDDEN" } });
    });

    it("accepts requests from the same origin", async () => {
      const response = await request(testApp.app)
        .post("/api/auth/login")
        .set("Host", "hero.example")
        .set("Origin", "https://hero.example")
        .send({ email: peter.email, password: peter.password });

      expect(response.status).toBe(200);
    });
  });
});

describe("authentication hardening", () => {
  it("limits failed sign-in attempts", async () => {
    const testApp = await createTestApp({ AUTH_RATE_LIMIT: 3 });
    const attempt = () =>
      request(testApp.app)
        .post("/api/auth/login")
        .send({ email: "villain@example.com", password: "guess-1234" });

    for (let i = 0; i < 3; i += 1) expect((await attempt()).status).toBe(401);
    const blocked = await attempt();

    expect(blocked.status).toBe(429);
    expect(blocked.body).toMatchObject({
      error: { code: "TOO_MANY_ATTEMPTS" },
    });
    await testApp.close();
  });

  it("uses a Secure __Host- cookie in production", async () => {
    const testApp = await createTestApp({ NODE_ENV: "production" });

    const response = await request(testApp.app)
      .post("/api/auth/register")
      .send({ ...peter, email: "bruce.wayne@example.com" });

    expect(cookiesOf(response)[0]).toMatch(
      /^__Host-session=[\w-]{43};.*Secure/,
    );
    await testApp.close();
  });
});

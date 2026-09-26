import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  connectDatabase,
  type DatabaseConnection,
} from "../../src/db/client.ts";
import { runMigrations } from "../../src/db/migrations.ts";
import {
  createSessionService,
  hashSessionToken,
  SESSION_DURATION_MS,
} from "../../src/modules/auth/session.service.ts";
import { sessions } from "../../src/modules/auth/sessions.schema.ts";
import { createSessionsRepository } from "../../src/modules/auth/sessions.repository.ts";
import { createUsersRepository } from "../../src/modules/users/users.repository.ts";

const DAY_MS = 24 * 60 * 60 * 1000;

describe("session service", () => {
  let connection: DatabaseConnection;
  let userId: number;
  let clock: Date;
  let service: ReturnType<typeof createSessionService>;

  beforeAll(async () => {
    connection = await connectDatabase({});
    await runMigrations(connection);
    const user = await createUsersRepository(connection.db).create({
      email: "clark.kent@example.com",
      passwordHash: "not-a-real-hash",
      firstName: "Clark",
      lastName: "Kent",
    });
    userId = user!.id;
    service = createSessionService(
      createSessionsRepository(connection.db),
      () => clock,
    );
  });
  afterAll(() => connection.close());

  const start = () => {
    clock = new Date("2026-01-01T00:00:00Z");
    return service.create(userId);
  };
  const advance = (days: number) => {
    clock = new Date(clock.getTime() + days * DAY_MS);
  };

  it("stores only a hash of the token", async () => {
    const { token } = await start();
    const rows = await connection.db.select().from(sessions);

    expect(token).toMatch(/^[\w-]{43}$/);
    expect(rows.map((row) => row.id)).toContain(hashSessionToken(token));
    expect(rows.map((row) => row.id)).not.toContain(token);
  });

  it("rejects unknown tokens", async () => {
    expect(await service.validate("forged-token")).toBeNull();
  });

  it("keeps a recent session as is", async () => {
    const { token, expiresAt } = await start();
    advance(5);

    const result = await service.validate(token);

    expect(result).toMatchObject({ renewed: false, user: { id: userId } });
    expect(result?.session.expiresAt).toEqual(expiresAt);
  });

  it("extends a session used during its second half", async () => {
    const { token } = await start();
    advance(20);

    const result = await service.validate(token);

    expect(result?.renewed).toBe(true);
    expect(result?.session.expiresAt).toEqual(
      new Date(clock.getTime() + SESSION_DURATION_MS),
    );
  });

  it("rejects and deletes an expired session", async () => {
    const { token } = await start();
    advance(31);

    expect(await service.validate(token)).toBeNull();
    advance(-31);
    expect(await service.validate(token)).toBeNull();
  });
});

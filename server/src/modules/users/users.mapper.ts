import type { User } from "@hero-experience/shared";
import type { UserRow } from "./users.schema.ts";

/** Public representation of a user: never exposes the password hash. */
export const toUser = (row: UserRow): User => ({
  id: row.id,
  email: row.email,
  firstName: row.firstName,
  lastName: row.lastName,
  phone: row.phone,
  address: row.address,
  postalCode: row.postalCode,
  city: row.city,
  createdAt: row.createdAt.toISOString(),
});

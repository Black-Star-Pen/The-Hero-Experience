import type { SessionRow } from "../modules/auth/sessions.schema.ts";
import type { UserRow } from "../modules/users/users.schema.ts";

declare global {
  namespace Express {
    interface Locals {
      /** Set by the authenticate middleware for signed-in users. */
      auth?: { user: UserRow; session: SessionRow };
    }
  }
}

export {};

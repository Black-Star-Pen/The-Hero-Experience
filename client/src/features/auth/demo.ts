import { DEMO_CREDENTIALS, type User } from "@hero-experience/shared";

/** The public demo account: its profile and password cannot be changed. */
export const isDemoAccount = (user: User): boolean =>
  user.email === DEMO_CREDENTIALS.email;

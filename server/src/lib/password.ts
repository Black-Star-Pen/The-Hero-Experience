import { hash, verify } from "@node-rs/argon2";

/** Argon2id with the minimum parameters recommended by OWASP (19 MiB, 2 passes). */
const OPTIONS = { memoryCost: 19_456, timeCost: 2, parallelism: 1 } as const;

export const hashPassword = (password: string): Promise<string> =>
  hash(password, OPTIONS);

export const verifyPassword = (
  passwordHash: string,
  password: string,
): Promise<boolean> => verify(passwordHash, password);

let dummyHash: Promise<string> | undefined;

/**
 * Spends the same time as a real verification when the account does not
 * exist, so response times do not reveal which e-mails are registered.
 */
export async function verifyDummyPassword(password: string): Promise<false> {
  dummyHash ??= hashPassword("dummy password, never matches");
  await verify(await dummyHash, password);
  return false;
}

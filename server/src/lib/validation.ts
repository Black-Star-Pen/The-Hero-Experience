import { z } from "zod";
import { HttpError } from "./http-error.ts";

/**
 * Parses untrusted input (body, query, params) with a Zod schema.
 * Throws a 400 HttpError whose details list the problems field by field.
 */
export function parseInput<T extends z.ZodType>(
  schema: T,
  input: unknown,
): z.infer<T> {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw HttpError.badRequest(
      "Les données envoyées sont invalides.",
      z.flattenError(result.error),
    );
  }
  return result.data;
}

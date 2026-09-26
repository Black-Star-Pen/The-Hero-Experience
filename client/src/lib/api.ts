import type { ApiErrorBody } from "@hero-experience/shared";

/** Problems of a form, field by field (as returned by the API or by Zod). */
export type FieldErrors = Partial<Record<string, string[]>>;

/** Error thrown for every failed API call, with a message ready to display. */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fieldErrors: FieldErrors;

  constructor(status: number, error?: ApiErrorBody["error"]) {
    super(
      error?.message ?? "Une erreur est survenue, réessayez dans un instant.",
    );
    this.name = "ApiError";
    this.status = status;
    this.code = error?.code ?? "UNKNOWN_ERROR";
    this.fieldErrors = readFieldErrors(error?.details);
  }
}

function readFieldErrors(details: unknown): FieldErrors {
  if (
    details &&
    typeof details === "object" &&
    "fieldErrors" in details &&
    details.fieldErrors &&
    typeof details.fieldErrors === "object"
  ) {
    return details.fieldErrors;
  }
  return {};
}

export type QueryParams = Record<string, string | number | null | undefined>;

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  query?: QueryParams;
  signal?: AbortSignal;
}

/**
 * Calls the API (same origin, so the session cookie is sent automatically).
 * Empty query parameters are left out.
 */
export async function api<T>(
  path: string,
  { method = "GET", body, query, signal }: RequestOptions = {},
): Promise<T> {
  const url = new URL(`/api${path}`, window.location.origin);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      signal,
      headers:
        body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError")
      throw error;
    throw new ApiError(0, {
      code: "NETWORK_ERROR",
      message: "Impossible de joindre le serveur. Vérifiez votre connexion.",
    });
  }

  if (response.status === 204) return undefined as T;
  const data: unknown = await response.json().catch(() => undefined);
  if (!response.ok) {
    throw new ApiError(
      response.status,
      (data as ApiErrorBody | undefined)?.error,
    );
  }
  return data as T;
}

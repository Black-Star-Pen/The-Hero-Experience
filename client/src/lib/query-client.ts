import { QueryClient } from "@tanstack/react-query";
import { ApiError } from "./api.ts";

/** Client errors (4xx) will not succeed on a second try: only retry network and server errors. */
const shouldRetry = (failureCount: number, error: unknown) =>
  failureCount < 2 &&
  !(error instanceof ApiError && error.status >= 400 && error.status < 500);

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        retry: shouldRetry,
      },
    },
  });
}

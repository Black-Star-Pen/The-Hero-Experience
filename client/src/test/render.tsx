import { QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router";
import { routes } from "../app/routes.tsx";
import { createQueryClient } from "../lib/query-client.ts";

/** Renders the real application routes at the given URL. */
export function renderRoute(url: string) {
  const router = createMemoryRouter(routes, { initialEntries: [url] });
  const queryClient = createQueryClient();
  queryClient.setDefaultOptions({
    queries: { retry: false, staleTime: Infinity },
  });
  const user = userEvent.setup();
  const view = render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
  return { ...view, router, user };
}

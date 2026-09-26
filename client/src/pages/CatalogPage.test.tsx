import { screen, waitFor, within } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { renderRoute } from "../test/render.tsx";
import { server } from "../test/server.ts";

describe("catalogue page", () => {
  it("lists the heroes of the API", async () => {
    renderRoute("/heros");

    expect(
      await screen.findByRole("link", { name: "Spider-Man" }),
    ).toHaveAttribute("href", "/heros/620");
    expect(screen.getByRole("link", { name: "Hulk" })).toBeInTheDocument();
    expect(screen.getByText("2 héros trouvés")).toBeInTheDocument();
  });

  it("filters by service and keeps the filter in the URL", async () => {
    const { router, user } = renderRoute("/heros");
    await screen.findByRole("link", { name: "Hulk" });

    const services = screen.getByRole("group", { name: "Services" });
    await user.click(
      within(services).getByRole("button", { name: "Spectacle" }),
    );

    await waitFor(() =>
      expect(
        screen.queryByRole("link", { name: "Hulk" }),
      ).not.toBeInTheDocument(),
    );
    expect(router.state.location.search).toBe("?service=spectacle");
    expect(
      within(services).getByRole("button", { name: "Spectacle" }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("searches by name after a short pause", async () => {
    const { router, user } = renderRoute("/heros");
    await screen.findByRole("link", { name: "Hulk" });

    await user.type(
      screen.getByRole("searchbox", { name: "Rechercher un héros" }),
      "spider",
    );

    await waitFor(() =>
      expect(router.state.location.search).toBe("?search=spider"),
    );
    await waitFor(() =>
      expect(
        screen.queryByRole("link", { name: "Hulk" }),
      ).not.toBeInTheDocument(),
    );
  });

  it("offers to reset the filters when nothing matches", async () => {
    const { router, user } = renderRoute("/heros?search=batman");

    expect(
      await screen.findByText("Aucun héros ne correspond"),
    ).toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: "Voir tous les héros" }),
    );

    await waitFor(() => expect(router.state.location.search).toBe(""));
    expect(
      await screen.findByRole("link", { name: "Hulk" }),
    ).toBeInTheDocument();
  });

  it("explains when the API cannot be reached", async () => {
    server.use(http.get("*/api/heroes", () => HttpResponse.error()));
    renderRoute("/heros");

    expect(
      await screen.findByText("Impossible de charger les héros."),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Impossible de joindre le serveur. Vérifiez votre connexion.",
      ),
    ).toBeInTheDocument();
  });
});

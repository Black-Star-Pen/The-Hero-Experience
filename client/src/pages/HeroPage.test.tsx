import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderRoute } from "../test/render.tsx";

describe("hero page", () => {
  it("shows the profile, the powers and the reviews", async () => {
    renderRoute("/heros/620");

    expect(
      await screen.findByRole("heading", { level: 1, name: "Spider-Man" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Peter Parker")).toBeInTheDocument();
    expect(screen.getByText("178 cm")).toBeInTheDocument();
    expect(
      within(screen.getByRole("main")).getByRole("link", {
        name: "Aide aux devoirs",
      }),
    ).toHaveAttribute("href", "/heros?service=aide-aux-devoirs");
    expect(screen.getByText("Intelligence")).toBeInTheDocument();
    expect(
      await screen.findByText("Mon fils a adoré son cours de parkour."),
    ).toBeInTheDocument();
    expect(screen.getByText("2 avis vérifiés")).toBeInTheDocument();
  });

  it("lists the periods already booked", async () => {
    renderRoute("/heros/620");

    expect(
      await screen.findByText("du 1 janv. au 3 janv."),
    ).toBeInTheDocument();
    expect(screen.getByText("le 10 févr.")).toBeInTheDocument();
  });

  it("shows the not found page for an unknown hero", async () => {
    renderRoute("/heros/99999");

    expect(
      await screen.findByRole("heading", {
        name: "Même Superman n'a pas trouvé cette page",
      }),
    ).toBeInTheDocument();
  });

  it("redirects the URLs of the first version of the site", async () => {
    const { router } = renderRoute("/pagehero/620");

    expect(
      await screen.findByRole("heading", { level: 1, name: "Spider-Man" }),
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/heros/620");
  });
});

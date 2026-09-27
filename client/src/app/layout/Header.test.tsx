import { screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { reloadAt } from "../../lib/browser.ts";
import { renderRoute } from "../../test/render.tsx";
import { signIn } from "../../test/server.ts";

vi.mock("../../lib/browser.ts", () => ({ reloadAt: vi.fn() }));

describe("header", () => {
  it("opens the mobile menu and closes it after a navigation", async () => {
    const { user } = renderRoute("/faq");
    const toggle = await screen.findByRole("button", {
      name: "Ouvrir le menu",
    });

    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(toggle).toHaveAccessibleName("Fermer le menu");

    const navigation = screen.getByRole("navigation", {
      name: "Navigation principale",
    });
    await user.click(
      within(navigation).getByRole("link", { name: "Nos héros" }),
    );
    expect(
      await screen.findByRole("heading", { level: 1, name: "Nos héros" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Ouvrir le menu" }),
    ).toHaveAttribute("aria-expanded", "false");
  });

  it("offers a skip link to the content", async () => {
    renderRoute("/faq");

    expect(
      await screen.findByRole("link", { name: "Aller au contenu" }),
    ).toHaveAttribute("href", "#main");
  });

  it("offers visitors to sign in and come back to the current page", async () => {
    renderRoute("/heros?service=sport");

    expect(
      await screen.findByRole("link", { name: "Connexion" }),
    ).toHaveAttribute("href", "/connexion?redirect=%2Fheros%3Fservice%3Dsport");
  });

  it("signs out, then reloads the home page", async () => {
    signIn();
    const { user } = renderRoute("/compte");

    expect(
      await screen.findByRole("link", { name: "Le Prince (mon compte)" }),
    ).toHaveAttribute("href", "/compte");
    await user.click(screen.getByRole("button", { name: "Déconnexion" }));

    // Called once the API has closed the session
    await waitFor(() => expect(reloadAt).toHaveBeenCalledWith("/"));
  });
});

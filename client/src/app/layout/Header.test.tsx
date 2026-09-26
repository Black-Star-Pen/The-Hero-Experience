import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderRoute } from "../../test/render.tsx";

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
});

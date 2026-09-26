import { screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderRoute } from "../test/render.tsx";

describe("sign-in page", () => {
  it("checks the fields before calling the API", async () => {
    const { user } = renderRoute("/connexion");

    await user.click(
      await screen.findByRole("button", { name: "Se connecter" }),
    );

    expect(screen.getByText("Adresse e-mail invalide.")).toBeInTheDocument();
    expect(
      screen.getByText("Le mot de passe est obligatoire."),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByLabelText(/Adresse e-mail/)).toHaveFocus(),
    );
  });

  it("rejects wrong credentials", async () => {
    const { user } = renderRoute("/connexion");

    await user.type(
      await screen.findByLabelText(/Adresse e-mail/),
      "demo@hero-experience.test",
    );
    await user.type(screen.getByLabelText(/Mot de passe/), "kryptonite");
    await user.click(screen.getByRole("button", { name: "Se connecter" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Adresse e-mail ou mot de passe incorrect.",
    );
  });

  it("signs in and goes back to the page that was requested", async () => {
    const { user, router } = renderRoute("/connexion?redirect=%2Fheros%2F620");

    // The e-mail is normalized like on the server
    await user.type(
      await screen.findByLabelText(/Adresse e-mail/),
      "  Demo@Hero-Experience.test ",
    );
    await user.type(screen.getByLabelText(/Mot de passe/), "hero-demo-2026");
    await user.click(screen.getByRole("button", { name: "Se connecter" }));

    expect(
      await screen.findByRole("heading", { level: 1, name: "Spider-Man" }),
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/heros/620");
    expect(
      screen.getByRole("link", { name: "Mary Jane (mon compte)" }),
    ).toBeInTheDocument();
  });

  it("signs in with the demo account, never towards another website", async () => {
    const { user, router } = renderRoute(
      "/connexion?redirect=%2F%2Fevil.example",
    );

    await user.click(
      await screen.findByRole("button", {
        name: "Me connecter avec le compte de démo",
      }),
    );

    expect(
      await screen.findByRole("heading", { name: "Bonjour Mary Jane !" }),
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/compte");
  });
});

describe("sign-up page", () => {
  it("creates the account and signs in", async () => {
    const { user } = renderRoute("/inscription");

    await user.type(await screen.findByLabelText(/Prénom/), "Miles");
    await user.type(screen.getByLabelText(/^Nom/), "Morales");
    await user.type(
      screen.getByLabelText(/Adresse e-mail/),
      "miles@brooklyn.test",
    );
    await user.type(screen.getByLabelText(/Mot de passe/), "court");
    await user.click(screen.getByRole("button", { name: "Créer mon compte" }));

    expect(
      screen.getByText("Le mot de passe doit contenir au moins 8 caractères."),
    ).toBeInTheDocument();

    await user.type(screen.getByLabelText(/Mot de passe/), "-et-assez-long");
    await user.click(screen.getByRole("button", { name: "Créer mon compte" }));

    expect(
      await screen.findByRole("heading", { name: "Bonjour Miles !" }),
    ).toBeInTheDocument();
  });

  it("explains that the e-mail is already used", async () => {
    const { user } = renderRoute("/inscription");

    await user.type(await screen.findByLabelText(/Prénom/), "Mary Jane");
    await user.type(screen.getByLabelText(/^Nom/), "Watson");
    await user.type(
      screen.getByLabelText(/Adresse e-mail/),
      "demo@hero-experience.test",
    );
    await user.type(screen.getByLabelText(/Mot de passe/), "un-mot-de-passe");
    await user.click(screen.getByRole("button", { name: "Créer mon compte" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Un compte existe déjà avec cette adresse e-mail.",
    );
  });
});

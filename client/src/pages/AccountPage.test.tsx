import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { pastBooking, upcomingBooking } from "../test/fixtures.ts";
import { renderRoute } from "../test/render.tsx";
import { signIn } from "../test/server.ts";

describe("account page", () => {
  it("sends visitors to the sign-in page, then back to their account", async () => {
    // Former URL of the account page
    const { user, router } = renderRoute("/userpage");

    expect(
      await screen.findByRole("heading", { level: 1, name: "Connexion" }),
    ).toBeInTheDocument();
    expect(router.state.location.search).toBe("?redirect=%2Fcompte");

    await user.click(
      screen.getByRole("button", {
        name: "Me connecter avec le compte de démo",
      }),
    );
    expect(
      await screen.findByRole("heading", { name: "Bonjour Mary Jane !" }),
    ).toBeInTheDocument();
  });

  it("groups the bookings and cancels an upcoming one", async () => {
    signIn({ bookings: [upcomingBooking, pastBooking] });
    const { user } = renderRoute("/compte");

    const upcoming = await screen.findByRole("region", { name: "À venir (1)" });
    expect(within(upcoming).getByText("Spider-Man")).toBeInTheDocument();
    expect(
      within(upcoming).getByText("Du 1 janvier 2099 au 3 janvier 2099"),
    ).toBeInTheDocument();
    const past = screen.getByRole("region", { name: "Passées (1)" });
    expect(
      within(past).queryByRole("button", { name: "Annuler la réservation" }),
    ).not.toBeInTheDocument();

    await user.click(
      within(upcoming).getByRole("button", { name: "Annuler la réservation" }),
    );
    await user.click(screen.getByRole("button", { name: "Oui, annuler" }));

    const cancelled = await screen.findByRole("region", {
      name: "Annulées (1)",
    });
    expect(within(cancelled).getByText("Annulée")).toBeInTheDocument();
    expect(
      screen.queryByRole("region", { name: /À venir/ }),
    ).not.toBeInTheDocument();
  });

  it("invites to book when there is no booking yet", async () => {
    signIn();
    renderRoute("/compte");

    expect(
      await screen.findByText("Aucune réservation pour l'instant"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Trouver un héros" }),
    ).toHaveAttribute("href", "/heros");
  });

  it("updates the profile", async () => {
    signIn();
    const { user } = renderRoute("/compte?onglet=profil");

    const firstName = await screen.findByLabelText(/Prénom/);
    expect(firstName).toHaveValue("Mary Jane");
    await user.clear(firstName);
    await user.type(firstName, "MJ");
    await user.clear(screen.getByLabelText(/Code postal/));
    await user.type(screen.getByLabelText(/Code postal/), "750");
    await user.click(screen.getByRole("button", { name: "Enregistrer" }));

    expect(
      screen.getByText("Le code postal doit contenir 5 chiffres."),
    ).toBeInTheDocument();

    await user.type(screen.getByLabelText(/Code postal/), "18");
    await user.click(screen.getByRole("button", { name: "Enregistrer" }));

    expect(
      await screen.findByText("Votre profil a été mis à jour."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Bonjour MJ !" }),
    ).toBeInTheDocument();
  });

  it("shows the error of the API next to the password field", async () => {
    signIn();
    const { user } = renderRoute("/compte?onglet=securite");

    await user.type(
      await screen.findByLabelText(/Mot de passe actuel/),
      "pas-le-bon",
    );
    await user.type(
      screen.getByLabelText(/Nouveau mot de passe/),
      "un-nouveau-mot-de-passe",
    );
    await user.click(
      screen.getByRole("button", { name: "Changer mon mot de passe" }),
    );

    expect(
      await screen.findByText("Le mot de passe actuel est incorrect."),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Mot de passe actuel/)).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });
});

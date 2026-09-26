import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { upcomingBooking } from "../test/fixtures.ts";
import { renderRoute } from "../test/render.tsx";
import { signIn } from "../test/server.ts";

describe("reviewing a hero", () => {
  const reviews = async () =>
    screen.findByRole("region", { name: "Avis clients" });

  it("invites visitors to sign in", async () => {
    renderRoute("/heros/620");

    expect(
      await within(await reviews()).findByRole("link", {
        name: "Connectez-vous",
      }),
    ).toHaveAttribute("href", "/connexion?redirect=%2Fheros%2F620%23avis");
  });

  it("is reserved to the customers who booked the hero", async () => {
    signIn();
    renderRoute("/heros/620");

    expect(
      await within(await reviews()).findByText(
        "Seuls les clients ayant réservé Spider-Man peuvent donner leur avis.",
      ),
    ).toBeInTheDocument();
  });

  it("publishes, edits and deletes the review of a customer", async () => {
    signIn({ bookings: [upcomingBooking] });
    const { user } = renderRoute("/heros/620");
    const section = within(await reviews());

    await section.findByRole("heading", {
      name: "Donnez votre avis sur Spider-Man",
    });
    await user.click(section.getByRole("button", { name: "Publier mon avis" }));
    expect(
      section.getByText("La note doit être comprise entre 1 et 5."),
    ).toBeInTheDocument();
    expect(
      section.getByText("Votre avis doit contenir au moins 10 caractères."),
    ).toBeInTheDocument();

    await user.click(
      section.getByRole("radio", { name: "4 sur 5, Très bien" }),
    );
    await user.type(
      section.getByLabelText(/Votre avis/),
      "Il a réparé la toiture en dix minutes, toiles comprises.",
    );
    await user.click(section.getByRole("button", { name: "Publier mon avis" }));

    expect(
      await section.findByText("Merci ! Votre avis est publié."),
    ).toBeInTheDocument();
    expect(
      section.getByRole("heading", { name: "Votre avis" }),
    ).toBeInTheDocument();
    // Shown once, in "Votre avis", and not repeated in the list
    expect(
      section.getAllByText(
        "Il a réparé la toiture en dix minutes, toiles comprises.",
      ),
    ).toHaveLength(1);

    await user.click(section.getByRole("button", { name: "Modifier" }));
    expect(
      section.getByRole("radio", { name: "4 sur 5, Très bien" }),
    ).toBeChecked();
    await user.click(
      section.getByRole("radio", { name: "5 sur 5, Excellent" }),
    );
    await user.click(
      section.getByRole("button", { name: "Enregistrer mon avis" }),
    );
    const mine = within(section.getByRole("region", { name: "Votre avis" }));
    expect(
      await mine.findByRole("img", { name: "Note : 5,0 sur 5" }),
    ).toBeInTheDocument();

    await user.click(section.getByRole("button", { name: "Supprimer" }));
    await user.click(section.getByRole("button", { name: "Oui, supprimer" }));

    expect(
      await section.findByText("Votre avis a été supprimé."),
    ).toBeInTheDocument();
    expect(
      section.getByRole("heading", {
        name: "Donnez votre avis sur Spider-Man",
      }),
    ).toBeInTheDocument();
  });
});

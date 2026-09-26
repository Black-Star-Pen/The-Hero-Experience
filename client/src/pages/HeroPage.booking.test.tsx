import { fireEvent, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { demoUser } from "../test/fixtures.ts";
import { renderRoute } from "../test/render.tsx";
import { signIn } from "../test/server.ts";

const bookingPanel = async () =>
  screen.findByRole("region", { name: "Réserver Spider-Man" });

// jsdom has no date picker: the value is set directly
const setDate = (field: HTMLElement, value: string) =>
  fireEvent.change(field, { target: { value } });

describe("booking a hero", () => {
  it("invites visitors to sign in, then to come back", async () => {
    renderRoute("/heros/620");

    expect(
      within(await bookingPanel()).getByRole("link", {
        name: "Se connecter pour réserver",
      }),
    ).toHaveAttribute("href", "/connexion?redirect=%2Fheros%2F620");
  });

  it("computes the price, warns about booked days and confirms", async () => {
    signIn();
    const { user } = renderRoute("/heros/620");
    const panel = within(await bookingPanel());

    // First free day of the hero, contact details of the profile
    const start = await panel.findByLabelText(/^Du/);
    const end = panel.getByLabelText(/^Au/);
    expect(start).toHaveValue("2099-01-04");
    expect(end).toHaveValue("2099-01-04");
    expect(panel.getByLabelText(/Adresse/)).toHaveValue("20 Ingram Street");
    expect(panel.getByText("1 jour × 130 €")).toBeInTheDocument();

    setDate(end, "2099-01-06");
    expect(panel.getByText("3 jours × 130 €")).toBeInTheDocument();
    const total = panel.getByText("Total").parentElement;
    expect(total).toHaveTextContent("390 €");

    setDate(start, "2099-01-02");
    expect(
      panel.getByText("Dates indisponibles").parentElement,
    ).toHaveTextContent(
      "Spider-Man est déjà réservé du 1 janv. au 3 janv. : choisissez d'autres dates.",
    );
    expect(
      panel.getByRole("button", { name: "Confirmer la réservation" }),
    ).toBeDisabled();

    setDate(start, "2099-01-05");
    await user.selectOptions(panel.getByLabelText(/Service/), "spectacle");
    await user.click(
      panel.getByRole("button", { name: "Confirmer la réservation" }),
    );

    expect(
      await panel.findByText("Réservation confirmée !"),
    ).toBeInTheDocument();
    expect(
      panel.getByText(/interviendra pour « Spectacle » du 5 janvier 2099/),
    ).toHaveTextContent("pour un total de 260 €");
    expect(
      panel.getByRole("link", { name: "Voir mes réservations" }),
    ).toHaveAttribute("href", "/compte");
  });

  it("shows the errors of the form", async () => {
    signIn({ user: { ...demoUser, phone: null } });
    const { user } = renderRoute("/heros/620");
    const panel = within(await bookingPanel());

    await user.click(
      await panel.findByRole("button", { name: "Confirmer la réservation" }),
    );

    expect(
      await panel.findByText("Numéro de téléphone invalide."),
    ).toBeInTheDocument();
    expect(panel.getByLabelText(/Téléphone/)).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });
});

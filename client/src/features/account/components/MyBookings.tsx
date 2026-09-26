import { todayIso, type Booking } from "@hero-experience/shared";
import { FiCalendar } from "react-icons/fi";
import { Alert } from "../../../components/ui/Alert.tsx";
import { ButtonLink } from "../../../components/ui/Button.tsx";
import { EmptyState } from "../../../components/ui/EmptyState.tsx";
import { Loading } from "../../../components/ui/Spinner.tsx";
import { useMyBookings } from "../../bookings/api.ts";
import { BookingCard } from "./BookingCard.tsx";
import styles from "./MyBookings.module.css";

function group(bookings: Booking[]) {
  const today = todayIso();
  return [
    {
      id: "upcoming",
      title: "À venir",
      items: bookings
        .filter(
          (booking) =>
            booking.status === "confirmed" && booking.endDate >= today,
        )
        .sort((a, b) => a.startDate.localeCompare(b.startDate)),
    },
    {
      id: "past",
      title: "Passées",
      items: bookings.filter(
        (booking) => booking.status === "confirmed" && booking.endDate < today,
      ),
    },
    {
      id: "cancelled",
      title: "Annulées",
      items: bookings.filter((booking) => booking.status === "cancelled"),
    },
  ].filter((section) => section.items.length > 0);
}

export function MyBookings() {
  const bookings = useMyBookings();

  if (bookings.isPending)
    return <Loading label="Chargement de vos réservations…" />;
  if (bookings.isError)
    return <Alert tone="error">{bookings.error.message}</Alert>;
  if (bookings.data.length === 0) {
    return (
      <EmptyState
        icon={<FiCalendar />}
        title="Aucune réservation pour l'instant"
        action={<ButtonLink to="/heros">Trouver un héros</ButtonLink>}
      >
        Votre premier super-héros n'attend que vous.
      </EmptyState>
    );
  }

  return (
    <div className={styles.sections}>
      {group(bookings.data).map((section) => (
        <section key={section.id} aria-labelledby={`bookings-${section.id}`}>
          <h2 id={`bookings-${section.id}`} className={styles.title}>
            {section.title}{" "}
            <span className={styles.count}>({section.items.length})</span>
          </h2>
          <ul className={styles.list}>
            {section.items.map((booking) => (
              <li key={booking.id}>
                <BookingCard booking={booking} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

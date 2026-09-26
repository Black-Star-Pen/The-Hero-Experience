import { getService, type Booking } from "@hero-experience/shared";
import { useState } from "react";
import { Link } from "react-router";
import { Alert } from "../../../components/ui/Alert.tsx";
import { Badge } from "../../../components/ui/Badge.tsx";
import { Button } from "../../../components/ui/Button.tsx";
import { formatDate, formatPrice, pluralize } from "../../../lib/format.ts";
import { useCancelBooking } from "../../bookings/api.ts";
import styles from "./BookingCard.module.css";

const period = ({ startDate, endDate }: Booking) =>
  startDate === endDate
    ? `Le ${formatDate(startDate)}`
    : `Du ${formatDate(startDate)} au ${formatDate(endDate)}`;

export function BookingCard({ booking }: { booking: Booking }) {
  const [confirming, setConfirming] = useState(false);
  const cancel = useCancelBooking();

  return (
    <article className={styles.card}>
      <img
        src={booking.hero.imageUrl}
        alt=""
        width={80}
        height={120}
        className={styles.image}
      />
      <div className={styles.body}>
        <div className={styles.header}>
          <h3 className={styles.hero}>
            <Link to={`/heros/${booking.hero.id}`}>{booking.hero.name}</Link>
          </h3>
          {booking.status === "cancelled" ? (
            <Badge tone="danger">Annulée</Badge>
          ) : (
            <Badge tone="success">Confirmée</Badge>
          )}
        </div>
        <p className={styles.service}>{getService(booking.service).label}</p>
        <p>{period(booking)}</p>
        <p className={styles.details}>
          {booking.address}, {booking.postalCode} {booking.city}
        </p>
        <p className={styles.price}>
          <strong>{formatPrice(booking.totalPrice)}</strong> ·{" "}
          {pluralize(booking.days, "jour")} × {formatPrice(booking.dailyRate)}
        </p>

        {booking.cancellable && !confirming && (
          <Button
            variant="danger"
            size="sm"
            onClick={() => setConfirming(true)}
          >
            Annuler la réservation
          </Button>
        )}
        {confirming && (
          <div
            className={styles.confirm}
            role="group"
            aria-label="Confirmer l'annulation"
          >
            <p>
              Annuler cette réservation ? Le héros sera de nouveau disponible.
            </p>
            <div className={styles.actions}>
              <Button
                variant="danger"
                size="sm"
                loading={cancel.isPending}
                onClick={() =>
                  cancel.mutate(booking.id, {
                    onSuccess: () => setConfirming(false),
                  })
                }
              >
                Oui, annuler
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setConfirming(false)}
              >
                Garder ma réservation
              </Button>
            </div>
          </div>
        )}
        {cancel.isError && <Alert tone="error">{cancel.error.message}</Alert>}
      </div>
    </article>
  );
}

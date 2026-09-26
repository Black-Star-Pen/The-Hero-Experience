import type { HeroDetail } from "@hero-experience/shared";
import { Alert } from "../../../components/ui/Alert.tsx";
import { formatPrice } from "../../../lib/format.ts";
import { AvailabilityBadge } from "../../heroes/components/HeroMeta.tsx";
import { Availability } from "./Availability.tsx";
import styles from "./BookingPanel.module.css";

/** Price and availability of a hero, next to their profile. */
export function BookingPanel({ hero }: { hero: HeroDetail }) {
  return (
    <section className={styles.panel} aria-labelledby="booking-title">
      <h2 id="booking-title" className={styles.title}>
        Réserver {hero.name}
      </h2>
      <p className={styles.price}>
        <strong>{formatPrice(hero.dailyRate)}</strong> par jour
      </p>
      <AvailabilityBadge date={hero.nextAvailableDate} />
      <Availability heroId={hero.id} />
      <Alert tone="info">La réservation en ligne arrive très bientôt.</Alert>
    </section>
  );
}

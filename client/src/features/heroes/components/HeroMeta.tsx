import type { RatingSummary } from "@hero-experience/shared";
import { todayIso } from "@hero-experience/shared";
import { FiCalendar } from "react-icons/fi";
import { Badge } from "../../../components/ui/Badge.tsx";
import { Stars } from "../../../components/ui/Stars.tsx";
import {
  formatAvailability,
  formatRating,
  pluralize,
} from "../../../lib/format.ts";
import styles from "./HeroMeta.module.css";

export function AvailabilityBadge({ date }: { date: string | null }) {
  if (date === null) {
    return <Badge tone="danger">Complet pour 3 mois</Badge>;
  }
  const today = date <= todayIso();
  return (
    <Badge tone={today ? "success" : "warning"}>
      <FiCalendar aria-hidden="true" />
      {today
        ? "Disponible aujourd'hui"
        : `Disponible ${formatAvailability(date)}`}
    </Badge>
  );
}

export function RatingLine({
  rating,
  size = "sm",
}: {
  rating: RatingSummary;
  size?: "sm" | "md";
}) {
  if (rating.average === null) {
    return <p className={styles.rating}>Pas encore d'avis</p>;
  }
  return (
    <p className={styles.rating}>
      <Stars value={rating.average} size={size} />
      <span>
        <strong>{formatRating(rating.average)}</strong> (
        {pluralize(rating.count, "avis", "avis")})
      </span>
    </p>
  );
}

import { FiCalendar } from "react-icons/fi";
import { formatShortDate } from "../../../lib/format.ts";
import { useHeroAvailability } from "../../heroes/api.ts";
import styles from "./Availability.module.css";

/** Periods already booked in the next 90 days. */
export function Availability({ heroId }: { heroId: number }) {
  const availability = useHeroAvailability(heroId);
  if (!availability.data) return null;

  const { bookedRanges } = availability.data;
  if (bookedRanges.length === 0) {
    return (
      <p className={styles.free}>
        Aucune réservation dans les 3 prochains mois.
      </p>
    );
  }
  return (
    <div className={styles.availability}>
      <p className={styles.title}>
        <FiCalendar aria-hidden="true" /> Déjà réservé :
      </p>
      <ul className={styles.ranges}>
        {bookedRanges.map((range) => (
          <li key={range.start}>
            {range.start === range.end
              ? `le ${formatShortDate(range.start)}`
              : `du ${formatShortDate(range.start)} au ${formatShortDate(range.end)}`}
          </li>
        ))}
      </ul>
    </div>
  );
}

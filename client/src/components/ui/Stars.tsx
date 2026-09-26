import { FaRegStar, FaStar, FaStarHalfAlt } from "react-icons/fa";
import { formatRating } from "../../lib/format.ts";
import styles from "./Stars.module.css";

/** Read-only rating from 0 to 5, rounded to the half star. */
export function Stars({
  value,
  size = "md",
}: {
  value: number;
  size?: "sm" | "md" | "lg";
}) {
  const halves = Math.round(value * 2);
  return (
    <span
      className={`${styles.stars} ${styles[size]}`}
      role="img"
      aria-label={`Note : ${formatRating(value)} sur 5`}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const Icon =
          halves >= star * 2
            ? FaStar
            : halves === star * 2 - 1
              ? FaStarHalfAlt
              : FaRegStar;
        return <Icon key={star} aria-hidden="true" />;
      })}
    </span>
  );
}

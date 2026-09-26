import type { Review } from "@hero-experience/shared";
import { Stars } from "../../../components/ui/Stars.tsx";
import styles from "./ReviewList.module.css";

const reviewDate = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" });

export function ReviewCard({ review }: { review: Review }) {
  return (
    <article className={styles.review}>
      <header className={styles.header}>
        <span className={styles.avatar} aria-hidden="true">
          {review.author.charAt(0)}
        </span>
        <div>
          <p className={styles.author}>{review.author}</p>
          <p className={styles.date}>
            <time dateTime={review.createdAt}>
              {reviewDate.format(new Date(review.createdAt))}
            </time>
            {" · Client vérifié"}
          </p>
        </div>
        <Stars value={review.rating} size="sm" />
      </header>
      <p className={styles.comment}>{review.comment}</p>
    </article>
  );
}

export function ReviewList({ reviews }: { reviews: Review[] }) {
  return (
    <ul className={styles.list}>
      {reviews.map((review) => (
        <li key={review.id}>
          <ReviewCard review={review} />
        </li>
      ))}
    </ul>
  );
}

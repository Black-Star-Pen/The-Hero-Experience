import { useId, useState } from "react";
import { FaStar } from "react-icons/fa";
import styles from "./StarRatingInput.module.css";

const LABELS = ["Décevant", "Moyen", "Bien", "Très bien", "Excellent"];

/** Five radio buttons shaped as stars (keyboard: arrow keys). */
export function StarRatingInput({
  name,
  defaultValue = 0,
  error,
}: {
  name: string;
  defaultValue?: number;
  error?: string[] | undefined;
}) {
  const [value, setValue] = useState(defaultValue);
  const [hovered, setHovered] = useState<number | null>(null);
  const id = useId();
  const shown = hovered ?? value;
  const message = error?.[0];

  return (
    <fieldset
      className={styles.fieldset}
      role="radiogroup"
      aria-required="true"
      aria-invalid={message ? true : undefined}
      aria-describedby={message ? `${id}-error` : undefined}
    >
      <legend className={styles.legend}>
        Votre note
        <span className={styles.required} aria-hidden="true">
          {" "}
          *
        </span>
      </legend>
      <div className={styles.stars} onMouseLeave={() => setHovered(null)}>
        {LABELS.map((label, index) => {
          const star = index + 1;
          return (
            <label
              key={star}
              className={styles.star}
              data-active={star <= shown}
              onMouseEnter={() => setHovered(star)}
            >
              <input
                type="radio"
                name={name}
                value={star}
                checked={value === star}
                onChange={() => setValue(star)}
                className={styles.input}
              />
              <FaStar aria-hidden="true" />
              <span className="visually-hidden">
                {star} sur 5, {label}
              </span>
            </label>
          );
        })}
        <span className={styles.caption} aria-hidden="true">
          {shown > 0 ? LABELS[shown - 1] : "Choisissez une note"}
        </span>
      </div>
      {message && (
        <p id={`${id}-error`} className={styles.error}>
          {message}
        </p>
      )}
    </fieldset>
  );
}

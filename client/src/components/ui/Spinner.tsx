import styles from "./Spinner.module.css";

export function Spinner({
  size = "md",
  label,
}: {
  size?: "sm" | "md" | "lg";
  /** Announced to screen readers; the spinner is decorative without it. */
  label?: string;
}) {
  return (
    <span
      className={`${styles.spinner} ${styles[size]}`}
      role={label ? "status" : undefined}
      aria-hidden={label ? undefined : true}
    >
      {label && <span className="visually-hidden">{label}</span>}
    </span>
  );
}

/** Centered spinner for a section or a page that is loading. */
export function Loading({ label = "Chargement…" }: { label?: string }) {
  return (
    <div className={styles.loading}>
      <Spinner size="lg" label={label} />
    </div>
  );
}

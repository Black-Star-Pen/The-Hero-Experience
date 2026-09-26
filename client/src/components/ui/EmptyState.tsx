import type { ReactNode } from "react";
import styles from "./EmptyState.module.css";

/** Placeholder for an empty list or a failed load, with an optional action. */
export function EmptyState({
  icon,
  title,
  children,
  action,
}: {
  icon?: ReactNode;
  title: ReactNode;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className={styles.empty}>
      {icon !== undefined && (
        <div className={styles.icon} aria-hidden="true">
          {icon}
        </div>
      )}
      <h2 className={styles.title}>{title}</h2>
      {children !== undefined && <div className={styles.text}>{children}</div>}
      {action}
    </div>
  );
}

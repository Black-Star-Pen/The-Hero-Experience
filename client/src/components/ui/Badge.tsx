import type { ReactNode } from "react";
import styles from "./Badge.module.css";

export function Badge({
  tone = "neutral",
  children,
}: {
  tone?: "neutral" | "brand" | "success" | "warning" | "danger";
  children: ReactNode;
}) {
  return <span className={`${styles.badge} ${styles[tone]}`}>{children}</span>;
}

import type { ReactNode } from "react";
import styles from "./Container.module.css";

/** Centers the content with the site's maximum width and side gutters. */
export function Container({
  children,
  size = "default",
  className,
}: {
  children: ReactNode;
  size?: "default" | "narrow";
  className?: string;
}) {
  return (
    <div
      className={[styles.container, styles[size], className]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}

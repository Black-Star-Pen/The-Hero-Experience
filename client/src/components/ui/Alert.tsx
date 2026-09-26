import type { ReactNode } from "react";
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiInfo,
  FiXCircle,
} from "react-icons/fi";
import styles from "./Alert.module.css";

const ICONS = {
  info: FiInfo,
  success: FiCheckCircle,
  warning: FiAlertTriangle,
  error: FiXCircle,
};

export function Alert({
  tone = "info",
  title,
  children,
}: {
  tone?: keyof typeof ICONS;
  title?: ReactNode;
  children?: ReactNode;
}) {
  const Icon = ICONS[tone];
  return (
    // Errors interrupt screen readers, other messages wait politely
    <div
      className={`${styles.alert} ${styles[tone]}`}
      role={tone === "error" ? "alert" : "status"}
    >
      <Icon className={styles.icon} aria-hidden="true" />
      <div>
        {title !== undefined && <p className={styles.title}>{title}</p>}
        {children}
      </div>
    </div>
  );
}

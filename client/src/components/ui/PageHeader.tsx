import type { ReactNode } from "react";
import { Container } from "./Container.tsx";
import styles from "./PageHeader.module.css";

/** Navy banner with the page title, used at the top of the inner pages. */
export function PageHeader({
  title,
  children,
  eyebrow,
}: {
  title: ReactNode;
  children?: ReactNode;
  eyebrow?: ReactNode;
}) {
  return (
    <div className={styles.header}>
      <Container>
        {eyebrow !== undefined && <p className={styles.eyebrow}>{eyebrow}</p>}
        <h1 className={styles.title}>{title}</h1>
        {children !== undefined && (
          <div className={styles.text}>{children}</div>
        )}
      </Container>
    </div>
  );
}

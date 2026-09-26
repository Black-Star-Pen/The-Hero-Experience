import type { ReactNode } from "react";
import { Container } from "../../../components/ui/Container.tsx";
import { PageHeader } from "../../../components/ui/PageHeader.tsx";
import styles from "./AuthLayout.module.css";

/** Page with a title banner and a centered card, for the sign-in and sign-up forms. */
export function AuthLayout({
  title,
  intro,
  children,
  footer,
}: {
  title: string;
  intro: ReactNode;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <>
      <title>{`${title} · The Hero Experience`}</title>
      <PageHeader title={title} eyebrow="Espace client">
        {intro}
      </PageHeader>
      <Container size="narrow" className={styles.page}>
        <div className={styles.card}>{children}</div>
        <p className={styles.footer}>{footer}</p>
      </Container>
    </>
  );
}

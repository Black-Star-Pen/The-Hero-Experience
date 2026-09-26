import { Outlet, ScrollRestoration } from "react-router";
import { Footer } from "./Footer.tsx";
import { Header } from "./Header.tsx";
import styles from "./RootLayout.module.css";

export function RootLayout() {
  return (
    <div className={styles.layout}>
      <a className={styles.skipLink} href="#main">
        Aller au contenu
      </a>
      <Header />
      <main id="main" className={styles.main} tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
      <ScrollRestoration />
    </div>
  );
}

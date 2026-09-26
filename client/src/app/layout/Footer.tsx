import { SERVICES } from "@hero-experience/shared";
import { FaGithub } from "react-icons/fa";
import { Link } from "react-router";
import logo from "../../assets/logo.png";
import { Container } from "../../components/ui/Container.tsx";
import styles from "./Footer.module.css";

const REPOSITORY_URL = "https://github.com/Black-Star-Pen/the-hero-experience";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <Container className={styles.columns}>
        <div className={styles.about}>
          <Link to="/" className={styles.brand}>
            <img
              src={logo}
              alt=""
              width={55}
              height={32}
              className={styles.logo}
            />
            The Hero Experience
          </Link>
          <p>
            Déménagement, cours, événements, enquêtes : des super-héros à votre
            service pour rendre votre quotidien extraordinaire.
          </p>
        </div>

        <nav aria-label="Liens du site">
          <h2 className={styles.heading}>Le site</h2>
          <ul className={styles.list}>
            <li>
              <Link to="/heros">Nos héros</Link>
            </li>
            <li>
              <Link to="/#comment-ca-marche">Comment ça marche</Link>
            </li>
            <li>
              <Link to="/faq">Questions fréquentes</Link>
            </li>
          </ul>
        </nav>

        <nav aria-label="Nos services">
          <h2 className={styles.heading}>Services</h2>
          <ul className={styles.list}>
            {SERVICES.map((service) => (
              <li key={service.slug}>
                <Link to={`/heros?service=${service.slug}`}>
                  {service.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className={styles.heading}>Le projet</h2>
          <ul className={styles.list}>
            <li>
              <a href={REPOSITORY_URL} className={styles.external}>
                <FaGithub aria-hidden="true" /> Code source
              </a>
            </li>
            <li>
              <a href="https://github.com/akabab/superhero-api">
                Données : SuperHero API
              </a>
            </li>
          </ul>
          <p className={styles.credits}>
            Imaginé en 2024 par « Les 4 Fantastiques » (Wild Code School),
            entièrement refondu en 2026.
          </p>
        </div>
      </Container>
      <Container className={styles.bottom}>
        <p>
          © 2024-2026 The Hero Experience. Site fictif, réalisé à des fins
          pédagogiques : aucune prestation ni aucun paiement réels. Les
          personnages appartiennent à leurs éditeurs respectifs.
        </p>
      </Container>
    </footer>
  );
}

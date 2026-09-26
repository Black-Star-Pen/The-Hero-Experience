import { SERVICES } from "@hero-experience/shared";
import { FiArrowRight, FiShield, FiStar, FiZap } from "react-icons/fi";
import { Link } from "react-router";
import stepBook from "../assets/illustrations/step-book.svg";
import stepEnjoy from "../assets/illustrations/step-enjoy.svg";
import stepSearch from "../assets/illustrations/step-search.svg";
import { ButtonLink } from "../components/ui/Button.tsx";
import { Container } from "../components/ui/Container.tsx";
import { Loading } from "../components/ui/Spinner.tsx";
import { useHeroes } from "../features/heroes/api.ts";
import { HeroGrid } from "../features/heroes/components/HeroCard.tsx";
import { ServiceIcon } from "../features/services/ServiceIcon.tsx";
import { formatNumber } from "../lib/format.ts";
import styles from "./HomePage.module.css";

const HERO_IMAGES =
  "https://cdn.jsdelivr.net/gh/akabab/superhero-api@0.3.0/api/images/md";

const COLLAGE = [
  { id: 720, file: "720-wonder-woman.jpg", name: "Wonder Woman" },
  { id: 620, file: "620-spider-man.jpg", name: "Spider-Man" },
  { id: 332, file: "332-hulk.jpg", name: "Hulk" },
];

const STEPS = [
  {
    image: stepSearch,
    title: "Trouvez votre héros",
    text: "Filtrez par service, budget ou date, comparez leurs super-pouvoirs et les avis de nos clients.",
  },
  {
    image: stepBook,
    title: "Réservez en quelques clics",
    text: "Choisissez vos dates : le prix s'affiche aussitôt et votre héros est bloqué rien que pour vous.",
  },
  {
    image: stepEnjoy,
    title: "Profitez de ses pouvoirs",
    text: "Le jour venu, votre héros intervient. Il ne vous reste plus qu'à partager votre avis !",
  },
];

export function HomePage() {
  const featured = useHeroes({ sort: "rating", pageSize: 4 });
  const heroCount = featured.data
    ? formatNumber(featured.data.total)
    : "Plus de 500";

  return (
    <>
      <title>The Hero Experience · Réservez un super-héros</title>

      <section className={styles.hero}>
        <Container className={styles.heroInner}>
          <div className={styles.heroText}>
            <p className={styles.eyebrow}>Services à domicile… héroïques</p>
            <h1 className={styles.heroTitle}>
              Rendez votre quotidien{" "}
              <span className={styles.highlight}>extraordinaire</span>
            </h1>
            <p className={styles.lead}>
              Déménagements sans stress, cours de sport dynamiques,
              anniversaires mémorables et bien plus encore : réservez dès
              aujourd'hui un super-héros à vos côtés.
            </p>
            <div className={styles.actions}>
              <ButtonLink to="/heros" size="lg">
                Trouver mon héros <FiArrowRight aria-hidden="true" />
              </ButtonLink>
              <ButtonLink
                to="/#comment-ca-marche"
                size="lg"
                variant="ghost"
                className={styles.ghost}
              >
                Comment ça marche ?
              </ButtonLink>
            </div>
            <ul className={styles.perks}>
              <li>
                <FiZap aria-hidden="true" /> {heroCount} héros disponibles
              </li>
              <li>
                <FiStar aria-hidden="true" /> Avis 100 % vérifiés
              </li>
              <li>
                <FiShield aria-hidden="true" /> Annulation gratuite
              </li>
            </ul>
          </div>
          <div className={styles.collage} aria-hidden="true">
            {COLLAGE.map((hero) => (
              <img
                key={hero.id}
                src={`${HERO_IMAGES}/${hero.file}`}
                alt=""
                width={320}
                height={480}
                className={styles.collageImage}
              />
            ))}
          </div>
        </Container>
      </section>

      <section
        id="services"
        className={styles.section}
        aria-labelledby="services-title"
      >
        <Container>
          <div className={styles.sectionHeader}>
            <h2 id="services-title" className={styles.sectionTitle}>
              Un héros pour chaque mission
            </h2>
            <p>
              Huit services, des centaines de super-pouvoirs à votre
              disposition.
            </p>
          </div>
          <ul className={styles.services}>
            {SERVICES.map((service) => (
              <li key={service.slug}>
                <Link
                  to={`/heros?service=${service.slug}`}
                  className={styles.service}
                >
                  <span className={styles.serviceIcon}>
                    <ServiceIcon slug={service.slug} />
                  </span>
                  <span className={styles.serviceLabel}>{service.label}</span>
                  <span className={styles.serviceText}>
                    {service.description}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section
        id="comment-ca-marche"
        className={`${styles.section} ${styles.steps}`}
        aria-labelledby="steps-title"
      >
        <Container>
          <div className={styles.sectionHeader}>
            <h2 id="steps-title" className={styles.sectionTitle}>
              Comment ça marche ?
            </h2>
            <p>Trois étapes, et même pas besoin de cape.</p>
          </div>
          <ol className={styles.stepList}>
            {STEPS.map((step, index) => (
              <li key={step.title} className={styles.step}>
                <img
                  src={step.image}
                  alt=""
                  className={styles.stepImage}
                  loading="lazy"
                />
                <span className={styles.stepNumber} aria-hidden="true">
                  {index + 1}
                </span>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section className={styles.section} aria-labelledby="featured-title">
        <Container>
          <div className={styles.sectionHeader}>
            <h2 id="featured-title" className={styles.sectionTitle}>
              Les chouchous de nos clients
            </h2>
            <p>Les héros les mieux notés du moment.</p>
          </div>
          {featured.data ? (
            <HeroGrid heroes={featured.data.items} />
          ) : featured.isError ? null : (
            <Loading label="Chargement des héros…" />
          )}
          <div className={styles.more}>
            <ButtonLink to="/heros" variant="secondary">
              Voir tous les héros <FiArrowRight aria-hidden="true" />
            </ButtonLink>
          </div>
        </Container>
      </section>

      <section
        className={styles.cta}
        aria-labelledby="cta-title"
        data-flush-bottom
      >
        <Container className={styles.ctaInner}>
          <h2 id="cta-title" className={styles.ctaTitle}>
            Prêt à vivre l'expérience ?
          </h2>
          <p>{heroCount} héros n'attendent que votre appel.</p>
          <ButtonLink to="/heros" size="lg">
            Réserver un héros
          </ButtonLink>
        </Container>
      </section>
    </>
  );
}

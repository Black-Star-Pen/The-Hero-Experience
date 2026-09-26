import {
  getService,
  type Alignment,
  type HeroDetail,
} from "@hero-experience/shared";
import { Link, useParams } from "react-router";
import { Alert } from "../components/ui/Alert.tsx";
import { Badge } from "../components/ui/Badge.tsx";
import { Container } from "../components/ui/Container.tsx";
import { Loading } from "../components/ui/Spinner.tsx";
import { BookingPanel } from "../features/bookings/components/BookingPanel.tsx";
import { useHero } from "../features/heroes/api.ts";
import { RatingLine } from "../features/heroes/components/HeroMeta.tsx";
import { PowerStats } from "../features/heroes/components/PowerStats.tsx";
import { HeroReviews } from "../features/reviews/components/HeroReviews.tsx";
import { ServiceIcon } from "../features/services/ServiceIcon.tsx";
import { ApiError } from "../lib/api.ts";
import { formatNumber } from "../lib/format.ts";
import styles from "./HeroPage.module.css";
import { NotFoundPage } from "./NotFoundPage.tsx";

const ALIGNMENTS: Record<
  Alignment,
  { label: string; tone: "brand" | "danger" | "neutral" }
> = {
  good: { label: "Héros", tone: "brand" },
  bad: { label: "Méchant repenti", tone: "danger" },
  neutral: { label: "Neutre", tone: "neutral" },
};

const formatWeight = (kg: number) =>
  kg >= 10_000
    ? `${formatNumber(Math.round(kg / 1000))} t`
    : `${formatNumber(kg)} kg`;

function Facts({ hero }: { hero: HeroDetail }) {
  const facts = [
    ["Métier", hero.occupation],
    ["Base", hero.base],
    ["Espèce", hero.race],
    ["Taille", hero.heightCm && `${formatNumber(hero.heightCm)} cm`],
    ["Poids", hero.weightKg && formatWeight(hero.weightKg)],
    ["Lieu de naissance", hero.placeOfBirth],
    ["Première apparition", hero.firstAppearance],
  ].filter((fact): fact is [string, string] => Boolean(fact[1]));

  return (
    <dl className={styles.facts}>
      {facts.map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function HeroPage() {
  const params = useParams();
  const heroId = Number(params.id);
  const validId = Number.isInteger(heroId) && heroId > 0;
  const hero = useHero(heroId, { enabled: validId });

  if (
    !validId ||
    (hero.error instanceof ApiError && hero.error.status === 404)
  ) {
    return <NotFoundPage />;
  }
  if (hero.isPending) return <Loading label="Chargement du héros…" />;
  if (hero.isError) {
    return (
      <Container className={styles.error}>
        <Alert tone="error" title="Impossible de charger ce héros.">
          {hero.error.message}
        </Alert>
      </Container>
    );
  }

  const { data } = hero;
  const alignment = data.alignment && ALIGNMENTS[data.alignment];

  return (
    <>
      <title>{`${data.name} · The Hero Experience`}</title>
      <div className={styles.banner} />
      <Container className={styles.layout}>
        <div className={styles.content}>
          <section className={styles.identity}>
            <img
              src={data.images.lg}
              alt={`Portrait de ${data.name}`}
              width={480}
              height={640}
              className={styles.portrait}
            />
            <div className={styles.summary}>
              <nav aria-label="Fil d'Ariane" className={styles.breadcrumb}>
                <Link to="/heros">Nos héros</Link>{" "}
                <span aria-hidden="true">/</span>{" "}
                <span aria-current="page">{data.name}</span>
              </nav>
              <h1 className={styles.name}>{data.name}</h1>
              {data.fullName && data.fullName !== data.name && (
                <p className={styles.fullName}>{data.fullName}</p>
              )}
              <div className={styles.badges}>
                {alignment && (
                  <Badge tone={alignment.tone}>{alignment.label}</Badge>
                )}
                {data.publisher && <Badge>{data.publisher}</Badge>}
              </div>
              <RatingLine rating={data.rating} size="md" />
              <h2 className="visually-hidden">Services proposés</h2>
              <ul className={styles.services}>
                {data.services.map((slug) => (
                  <li key={slug}>
                    <Link
                      to={`/heros?service=${slug}`}
                      className={styles.service}
                    >
                      <ServiceIcon slug={slug} />
                      {getService(slug).label}
                    </Link>
                  </li>
                ))}
              </ul>
              <Facts hero={data} />
            </div>
          </section>

          <section aria-labelledby="stats-title" className={styles.section}>
            <h2 id="stats-title" className={styles.sectionTitle}>
              Super-pouvoirs
            </h2>
            <PowerStats stats={data.powerstats} />
          </section>

          <section
            aria-labelledby="reviews-title"
            id="avis"
            className={styles.section}
          >
            <h2 id="reviews-title" className={styles.sectionTitle}>
              Avis clients
            </h2>
            <HeroReviews heroId={data.id} heroName={data.name} />
          </section>
        </div>

        <aside className={styles.sidebar}>
          <BookingPanel hero={data} />
        </aside>
      </Container>
    </>
  );
}

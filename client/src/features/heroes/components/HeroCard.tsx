import { getService, type HeroSummary } from "@hero-experience/shared";
import { Link } from "react-router";
import { Badge } from "../../../components/ui/Badge.tsx";
import { formatPrice } from "../../../lib/format.ts";
import { ServiceIcon } from "../../services/ServiceIcon.tsx";
import styles from "./HeroCard.module.css";
import { AvailabilityBadge, RatingLine } from "./HeroMeta.tsx";

const VISIBLE_SERVICES = 2;

export function HeroCard({ hero }: { hero: HeroSummary }) {
  const hidden = hero.services.length - VISIBLE_SERVICES;
  return (
    <article className={styles.card}>
      <div className={styles.media}>
        <img
          src={hero.imageUrl}
          alt=""
          loading="lazy"
          decoding="async"
          width={320}
          height={480}
          className={styles.image}
        />
        <div className={styles.availability}>
          <AvailabilityBadge date={hero.nextAvailableDate} />
        </div>
      </div>
      <div className={styles.body}>
        <h3 className={styles.name}>
          {/* The link covers the whole card (see .link::after) */}
          <Link to={`/heros/${hero.id}`} className={styles.link}>
            {hero.name}
          </Link>
        </h3>
        {hero.fullName && hero.fullName !== hero.name && (
          <p className={styles.fullName}>{hero.fullName}</p>
        )}
        <RatingLine rating={hero.rating} />
        <ul className={styles.services} aria-label="Services proposés">
          {hero.services.slice(0, VISIBLE_SERVICES).map((slug) => (
            <li key={slug}>
              <Badge tone="brand">
                <ServiceIcon slug={slug} />
                {getService(slug).label}
              </Badge>
            </li>
          ))}
          {hidden > 0 && (
            <li>
              <Badge>
                +{hidden}
                <span className="visually-hidden"> autres services</span>
              </Badge>
            </li>
          )}
        </ul>
        <p className={styles.price}>
          <strong>{formatPrice(hero.dailyRate)}</strong> / jour
        </p>
      </div>
    </article>
  );
}

export function HeroGrid({ heroes }: { heroes: HeroSummary[] }) {
  return (
    <ul className={styles.grid}>
      {heroes.map((hero) => (
        <li key={hero.id}>
          <HeroCard hero={hero} />
        </li>
      ))}
    </ul>
  );
}

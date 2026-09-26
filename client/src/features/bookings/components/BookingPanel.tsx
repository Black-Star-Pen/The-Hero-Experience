import type { HeroDetail } from "@hero-experience/shared";
import { Link } from "react-router";
import { ButtonLink } from "../../../components/ui/Button.tsx";
import { Loading } from "../../../components/ui/Spinner.tsx";
import { formatPrice } from "../../../lib/format.ts";
import { useSession } from "../../auth/api.ts";
import { loginLink } from "../../auth/redirect.ts";
import { AvailabilityBadge } from "../../heroes/components/HeroMeta.tsx";
import { Availability } from "./Availability.tsx";
import { BookingForm } from "./BookingForm.tsx";
import styles from "./BookingPanel.module.css";

/** The booking form for customers, an invitation to sign in for visitors. */
function BookingAction({ hero }: { hero: HeroDetail }) {
  const session = useSession();

  if (session.isPending) return <Loading />;
  if (session.data) return <BookingForm hero={hero} user={session.data} />;

  const back = `/heros/${hero.id}`;
  return (
    <div className={styles.visitor}>
      <ButtonLink to={loginLink(back)} size="lg" block>
        Se connecter pour réserver
      </ButtonLink>
      <p className={styles.hint}>
        Pas encore de compte ?{" "}
        <Link to={`/inscription?redirect=${encodeURIComponent(back)}`}>
          Inscrivez-vous
        </Link>{" "}
        en quelques secondes.
      </p>
    </div>
  );
}

/** Price, availability and booking form of a hero, next to their profile. */
export function BookingPanel({ hero }: { hero: HeroDetail }) {
  return (
    <section className={styles.panel} aria-labelledby="booking-title">
      <h2 id="booking-title" className={styles.title}>
        Réserver {hero.name}
      </h2>
      <p className={styles.price}>
        <strong>{formatPrice(hero.dailyRate)}</strong> par jour
      </p>
      <AvailabilityBadge date={hero.nextAvailableDate} />
      <Availability heroId={hero.id} />
      <BookingAction hero={hero} />
    </section>
  );
}

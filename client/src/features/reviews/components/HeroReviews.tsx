import { Alert } from "../../../components/ui/Alert.tsx";
import { Button } from "../../../components/ui/Button.tsx";
import { Loading } from "../../../components/ui/Spinner.tsx";
import { Stars } from "../../../components/ui/Stars.tsx";
import { formatRating, pluralize } from "../../../lib/format.ts";
import { useHeroReviews } from "../../heroes/api.ts";
import styles from "./HeroReviews.module.css";
import { ReviewList } from "./ReviewList.tsx";

export function HeroReviews({
  heroId,
  heroName,
}: {
  heroId: number;
  heroName: string;
}) {
  const reviews = useHeroReviews(heroId);

  if (reviews.isPending) return <Loading label="Chargement des avis…" />;
  if (reviews.isError) {
    return <Alert tone="error">Les avis n'ont pas pu être chargés.</Alert>;
  }

  const [first] = reviews.data.pages;
  const items = reviews.data.pages.flatMap((page) => page.items);
  const summary = first?.summary ?? { average: null, count: 0 };

  return (
    <div className={styles.reviews}>
      {summary.average === null ? (
        <p className={styles.empty}>
          Personne n'a encore donné son avis sur {heroName}. Réservez ses
          services et soyez le premier !
        </p>
      ) : (
        <div className={styles.summary}>
          <p className={styles.average}>{formatRating(summary.average)}</p>
          <div>
            <Stars value={summary.average} size="lg" />
            <p className={styles.count}>
              {pluralize(summary.count, "avis vérifié", "avis vérifiés")}
            </p>
          </div>
        </div>
      )}

      {items.length > 0 && <ReviewList reviews={items} />}

      {reviews.hasNextPage && (
        <Button
          variant="ghost"
          onClick={() => void reviews.fetchNextPage()}
          loading={reviews.isFetchingNextPage}
          className={styles.more}
        >
          Afficher plus d'avis
        </Button>
      )}
    </div>
  );
}

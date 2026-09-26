import { reviewInputSchema, type Review } from "@hero-experience/shared";
import { useState } from "react";
import { Link } from "react-router";
import { Alert } from "../../../components/ui/Alert.tsx";
import { Button } from "../../../components/ui/Button.tsx";
import { TextareaField } from "../../../components/ui/Field.tsx";
import { useZodForm } from "../../../lib/forms.ts";
import { useSession } from "../../auth/api.ts";
import { loginLink } from "../../auth/redirect.ts";
import { useDeleteReview, useSaveReview } from "../api.ts";
import styles from "./ReviewComposer.module.css";
import { ReviewCard } from "./ReviewList.tsx";
import { StarRatingInput } from "./StarRatingInput.tsx";

function ReviewForm({
  heroId,
  review,
  onDone,
  onCancel,
}: {
  heroId: number;
  review: Review | null;
  onDone: () => void;
  onCancel?: () => void;
}) {
  const save = useSaveReview(heroId);
  const { fieldErrors, formError, handleSubmit } = useZodForm(
    reviewInputSchema,
    async (input) => {
      await save.mutateAsync(input);
      onDone();
    },
  );

  return (
    <form
      className={styles.form}
      noValidate
      onSubmit={handleSubmit((values) => ({
        ...values,
        // No star selected: 0 is rejected with the message of the schema
        rating: values.rating ? Number(values.rating) : 0,
      }))}
    >
      <StarRatingInput
        name="rating"
        defaultValue={review?.rating}
        error={fieldErrors.rating}
      />
      <TextareaField
        label="Votre avis"
        name="comment"
        required
        maxLength={1000}
        hint="Ponctualité, efficacité, dégâts collatéraux… Au moins 10 caractères."
        defaultValue={review?.comment}
        error={fieldErrors.comment}
      />
      {formError && <Alert tone="error">{formError}</Alert>}
      <div className={styles.actions}>
        <Button type="submit" loading={save.isPending}>
          {review ? "Enregistrer mon avis" : "Publier mon avis"}
        </Button>
        {onCancel && (
          <Button variant="ghost" onClick={onCancel}>
            Annuler
          </Button>
        )}
      </div>
    </form>
  );
}

function MyReview({
  heroId,
  review,
  canEdit,
  onEdit,
  onDeleted,
}: {
  heroId: number;
  review: Review;
  canEdit: boolean;
  onEdit: () => void;
  onDeleted: () => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const remove = useDeleteReview(heroId);

  return (
    <>
      <ReviewCard review={review} />
      {confirming ? (
        <div
          className={styles.confirm}
          role="group"
          aria-label="Confirmer la suppression"
        >
          <p>Supprimer votre avis ? Cette action est définitive.</p>
          <div className={styles.actions}>
            <Button
              variant="danger"
              size="sm"
              loading={remove.isPending}
              onClick={() => remove.mutate(undefined, { onSuccess: onDeleted })}
            >
              Oui, supprimer
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConfirming(false)}
            >
              Garder mon avis
            </Button>
          </div>
        </div>
      ) : (
        <div className={styles.actions}>
          {canEdit && (
            <Button variant="secondary" size="sm" onClick={onEdit}>
              Modifier
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => setConfirming(true)}>
            Supprimer
          </Button>
        </div>
      )}
      {remove.isError && <Alert tone="error">{remove.error.message}</Alert>}
    </>
  );
}

/**
 * Lets the signed-in customer write, edit or delete their review. Only
 * customers who booked the hero can review them.
 */
export function ReviewComposer({
  heroId,
  heroName,
  mine,
  canReview,
}: {
  heroId: number;
  heroName: string;
  mine: Review | null;
  canReview: boolean;
}) {
  const session = useSession();
  const [editing, setEditing] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  if (session.isPending || session.isError) return null;

  if (!session.data) {
    return (
      <p className={styles.note}>
        Vous avez fait appel à {heroName} ?{" "}
        <Link to={loginLink(`/heros/${heroId}#avis`)}>Connectez-vous</Link> pour
        donner votre avis.
      </p>
    );
  }

  if (!mine && !canReview) {
    return (
      <p className={styles.note}>
        Seuls les clients ayant réservé {heroName} peuvent donner leur avis.
      </p>
    );
  }

  const done = (message: string) => () => {
    setEditing(false);
    setNotice(message);
  };

  return (
    <section className={styles.composer} aria-labelledby="my-review-title">
      <h3 id="my-review-title" className={styles.title}>
        {mine ? "Votre avis" : `Donnez votre avis sur ${heroName}`}
      </h3>
      {notice && <Alert tone="success">{notice}</Alert>}
      {mine && !editing ? (
        <MyReview
          heroId={heroId}
          review={mine}
          canEdit={canReview}
          onEdit={() => {
            setEditing(true);
            setNotice(null);
          }}
          onDeleted={done("Votre avis a été supprimé.")}
        />
      ) : (
        <ReviewForm
          heroId={heroId}
          review={mine}
          onDone={done("Merci ! Votre avis est publié.")}
          onCancel={mine ? () => setEditing(false) : undefined}
        />
      )}
    </section>
  );
}

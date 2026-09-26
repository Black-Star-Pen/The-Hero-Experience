import { ButtonLink } from "../components/ui/Button.tsx";
import { Container } from "../components/ui/Container.tsx";
import styles from "./NotFoundPage.module.css";

export function NotFoundPage() {
  return (
    <Container size="narrow" className={styles.page}>
      <title>Page introuvable · The Hero Experience</title>
      <p className={styles.code} aria-hidden="true">
        404
      </p>
      <h1 className={styles.title}>Même Superman n'a pas trouvé cette page</h1>
      <p className={styles.text}>
        Le lien est peut-être erroné, ou la page a été emportée par un
        super-vilain.
      </p>
      <div className={styles.actions}>
        <ButtonLink to="/">Retour à l'accueil</ButtonLink>
        <ButtonLink to="/heros" variant="ghost">
          Voir les héros
        </ButtonLink>
      </div>
    </Container>
  );
}

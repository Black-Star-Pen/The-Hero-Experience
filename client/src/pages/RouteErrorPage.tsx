import { isRouteErrorResponse, useRouteError } from "react-router";
import { Button, ButtonLink } from "../components/ui/Button.tsx";
import { Container } from "../components/ui/Container.tsx";
import { NotFoundPage } from "./NotFoundPage.tsx";
import styles from "./NotFoundPage.module.css";

/** A lazy-loaded page that no longer exists after a new deployment. */
const isOutdatedBundle = (error: unknown) =>
  error instanceof TypeError &&
  /dynamically imported module|module script/i.test(error.message);

export function RouteErrorPage() {
  const error = useRouteError();
  if (isRouteErrorResponse(error) && error.status === 404)
    return <NotFoundPage />;

  const outdated = isOutdatedBundle(error);
  return (
    <Container size="narrow" className={styles.page}>
      <title>Erreur · The Hero Experience</title>
      <h1 className={styles.title}>
        {outdated
          ? "Une nouvelle version du site est disponible"
          : "Un super-vilain a tout cassé"}
      </h1>
      <p className={styles.text}>
        {outdated
          ? "Rechargez la page pour en profiter."
          : "Une erreur inattendue est survenue. Rechargez la page ou revenez à l'accueil."}
      </p>
      <div className={styles.actions}>
        <Button onClick={() => window.location.reload()}>
          Recharger la page
        </Button>
        <ButtonLink to="/" variant="ghost">
          Retour à l'accueil
        </ButtonLink>
      </div>
    </Container>
  );
}

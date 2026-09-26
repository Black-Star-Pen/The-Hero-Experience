import { Link, useSearchParams } from "react-router";
import { Alert } from "../components/ui/Alert.tsx";
import { Container } from "../components/ui/Container.tsx";
import { PageHeader } from "../components/ui/PageHeader.tsx";
import { Loading } from "../components/ui/Spinner.tsx";
import { MyBookings } from "../features/account/components/MyBookings.tsx";
import { PasswordForm } from "../features/account/components/PasswordForm.tsx";
import { ProfileForm } from "../features/account/components/ProfileForm.tsx";
import { useSession } from "../features/auth/api.ts";
import { isDemoAccount } from "../features/auth/demo.ts";
import styles from "./AccountPage.module.css";

const TABS = [
  { id: "reservations", label: "Mes réservations" },
  { id: "profil", label: "Mon profil" },
  { id: "securite", label: "Sécurité" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function AccountPage() {
  const session = useSession();
  const [params] = useSearchParams();
  const requested = params.get("onglet");
  const tab: TabId = TABS.some((item) => item.id === requested)
    ? (requested as TabId)
    : "reservations";

  // RequireAuth guarantees a signed-in user
  if (!session.data) return <Loading />;
  const user = session.data;
  const demo = isDemoAccount(user);

  return (
    <>
      <title>Mon compte · The Hero Experience</title>
      <PageHeader title={`Bonjour ${user.firstName} !`} eyebrow="Espace client">
        Suivez vos réservations et gérez vos informations.
      </PageHeader>
      <Container className={styles.page}>
        <nav aria-label="Rubriques du compte" className={styles.tabs}>
          {TABS.map((item) => (
            <Link
              key={item.id}
              to={`?onglet=${item.id}`}
              className={styles.tab}
              aria-current={item.id === tab ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        {demo && (
          <Alert tone="info" title="Compte de démo">
            <p>
              Réservez, annulez, donnez votre avis : tout est remis à zéro
              chaque nuit. Le profil et le mot de passe de ce compte partagé ne
              peuvent pas être modifiés.
            </p>
          </Alert>
        )}
        <div className={styles.panel}>
          {tab === "reservations" && <MyBookings />}
          {tab === "profil" && <ProfileForm user={user} />}
          {tab === "securite" && <PasswordForm readOnly={demo} />}
        </div>
      </Container>
    </>
  );
}

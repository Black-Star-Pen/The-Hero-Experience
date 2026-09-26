import { PASSWORD_MIN_LENGTH, registerSchema } from "@hero-experience/shared";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router";
import { Alert } from "../components/ui/Alert.tsx";
import { Button } from "../components/ui/Button.tsx";
import { TextField } from "../components/ui/Field.tsx";
import { useRegister, useSession } from "../features/auth/api.ts";
import { AuthLayout } from "../features/auth/components/AuthLayout.tsx";
import styles from "../features/auth/components/AuthLayout.module.css";
import { safeRedirect } from "../features/auth/redirect.ts";
import { useZodForm } from "../lib/forms.ts";

export function RegisterPage() {
  const [params] = useSearchParams();
  const redirect = safeRedirect(params.get("redirect"));
  const navigate = useNavigate();
  const session = useSession();
  const register = useRegister();
  const { fieldErrors, formError, handleSubmit } = useZodForm(
    registerSchema,
    async (input) => {
      await register.mutateAsync(input);
      await navigate(redirect, { replace: true });
    },
  );

  if (session.data && !register.isPending)
    return <Navigate to={redirect} replace />;

  return (
    <AuthLayout
      title="Créer un compte"
      intro="Quelques secondes suffisent pour réserver votre premier héros."
      footer={
        <>
          Déjà inscrit ?{" "}
          <Link to={`/connexion?redirect=${encodeURIComponent(redirect)}`}>
            Se connecter
          </Link>
        </>
      }
    >
      <form className={styles.form} noValidate onSubmit={handleSubmit()}>
        <div className={styles.row}>
          <TextField
            label="Prénom"
            name="firstName"
            autoComplete="given-name"
            required
            error={fieldErrors.firstName}
          />
          <TextField
            label="Nom"
            name="lastName"
            autoComplete="family-name"
            required
            error={fieldErrors.lastName}
          />
        </div>
        <TextField
          label="Adresse e-mail"
          name="email"
          type="email"
          autoComplete="email"
          required
          error={fieldErrors.email}
        />
        <TextField
          label="Mot de passe"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          hint={`Au moins ${PASSWORD_MIN_LENGTH} caractères. Une phrase facile à retenir fait très bien l'affaire.`}
          error={fieldErrors.password}
        />
        {formError && <Alert tone="error">{formError}</Alert>}
        <Button type="submit" size="lg" block loading={register.isPending}>
          Créer mon compte
        </Button>
      </form>
    </AuthLayout>
  );
}

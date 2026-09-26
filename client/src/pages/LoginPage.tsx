import { DEMO_CREDENTIALS, loginSchema } from "@hero-experience/shared";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router";
import { Alert } from "../components/ui/Alert.tsx";
import { Button } from "../components/ui/Button.tsx";
import { TextField } from "../components/ui/Field.tsx";
import { useLogin, useSession } from "../features/auth/api.ts";
import { AuthLayout } from "../features/auth/components/AuthLayout.tsx";
import styles from "../features/auth/components/AuthLayout.module.css";
import { safeRedirect } from "../features/auth/redirect.ts";
import { useZodForm } from "../lib/forms.ts";

export function LoginPage() {
  const [params] = useSearchParams();
  const redirect = safeRedirect(params.get("redirect"));
  const navigate = useNavigate();
  const session = useSession();
  const login = useLogin();
  const { fieldErrors, formError, handleSubmit } = useZodForm(
    loginSchema,
    async (input) => {
      await login.mutateAsync(input);
      await navigate(redirect, { replace: true });
    },
  );

  // Already signed in (or just signed in): go on
  if (session.data && !login.isPending)
    return <Navigate to={redirect} replace />;

  const signInAsDemo = () => {
    login.mutate(DEMO_CREDENTIALS, {
      onSuccess: () => void navigate(redirect, { replace: true }),
    });
  };
  // Error of the form, or of the demo button
  const error = formError ?? login.error?.message;
  const submit = handleSubmit();

  return (
    <AuthLayout
      title="Connexion"
      intro="Retrouvez vos réservations et vos héros préférés."
      footer={
        <>
          Pas encore de compte ?{" "}
          <Link to={`/inscription?redirect=${encodeURIComponent(redirect)}`}>
            Créer un compte
          </Link>
        </>
      }
    >
      <form
        className={styles.form}
        noValidate
        onSubmit={(event) => {
          login.reset();
          submit(event);
        }}
      >
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
          autoComplete="current-password"
          required
          error={fieldErrors.password}
        />
        {error && <Alert tone="error">{error}</Alert>}
        <Button type="submit" size="lg" block loading={login.isPending}>
          Se connecter
        </Button>
      </form>
      <Alert tone="info" title="Envie de tester ?">
        <p>
          Compte de démo : <strong>{DEMO_CREDENTIALS.email}</strong> /{" "}
          <strong>{DEMO_CREDENTIALS.password}</strong>
        </p>
        <Button size="sm" variant="ghost" onClick={signInAsDemo}>
          Me connecter avec le compte de démo
        </Button>
      </Alert>
    </AuthLayout>
  );
}

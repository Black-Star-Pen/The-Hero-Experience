import {
  changePasswordSchema,
  PASSWORD_MIN_LENGTH,
} from "@hero-experience/shared";
import { useState } from "react";
import { Alert } from "../../../components/ui/Alert.tsx";
import { Button } from "../../../components/ui/Button.tsx";
import { TextField } from "../../../components/ui/Field.tsx";
import { useZodForm } from "../../../lib/forms.ts";
import { useChangePassword } from "../../auth/api.ts";
import styles from "../../auth/components/AuthLayout.module.css";

export function PasswordForm() {
  const change = useChangePassword();
  const [done, setDone] = useState(false);
  // Remounting the form empties its fields after a successful change
  const [formKey, setFormKey] = useState(0);
  const { fieldErrors, formError, handleSubmit } = useZodForm(
    changePasswordSchema,
    async (input) => {
      setDone(false);
      await change.mutateAsync(input);
      setDone(true);
      setFormKey((key) => key + 1);
    },
  );

  return (
    <form
      key={formKey}
      className={styles.form}
      noValidate
      onSubmit={handleSubmit()}
    >
      <TextField
        label="Mot de passe actuel"
        name="currentPassword"
        type="password"
        autoComplete="current-password"
        required
        error={fieldErrors.currentPassword}
      />
      <TextField
        label="Nouveau mot de passe"
        name="newPassword"
        type="password"
        autoComplete="new-password"
        required
        hint={`Au moins ${PASSWORD_MIN_LENGTH} caractères.`}
        error={fieldErrors.newPassword}
      />
      {formError && <Alert tone="error">{formError}</Alert>}
      {done && (
        <Alert tone="success">
          Mot de passe modifié. Vos autres appareils ont été déconnectés.
        </Alert>
      )}
      <Button type="submit" loading={change.isPending}>
        Changer mon mot de passe
      </Button>
    </form>
  );
}

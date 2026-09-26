import { profileSchema, type User } from "@hero-experience/shared";
import { useState } from "react";
import { Alert } from "../../../components/ui/Alert.tsx";
import { Button } from "../../../components/ui/Button.tsx";
import { TextField } from "../../../components/ui/Field.tsx";
import { useZodForm } from "../../../lib/forms.ts";
import { useUpdateProfile } from "../../auth/api.ts";
import { isDemoAccount } from "../../auth/demo.ts";
import styles from "../../auth/components/AuthLayout.module.css";

export function ProfileForm({ user }: { user: User }) {
  const update = useUpdateProfile();
  const [saved, setSaved] = useState(false);
  const { fieldErrors, formError, handleSubmit } = useZodForm(
    profileSchema,
    async (profile) => {
      setSaved(false);
      await update.mutateAsync(profile);
      setSaved(true);
    },
  );

  return (
    <form noValidate onSubmit={handleSubmit()}>
      <fieldset className={styles.fields} disabled={isDemoAccount(user)}>
        <p>
          Ces coordonnées pré-remplissent vos réservations. Votre adresse e-mail
          : <strong>{user.email}</strong>
        </p>
        <div className={styles.row}>
          <TextField
            label="Prénom"
            name="firstName"
            autoComplete="given-name"
            required
            defaultValue={user.firstName}
            error={fieldErrors.firstName}
          />
          <TextField
            label="Nom"
            name="lastName"
            autoComplete="family-name"
            required
            defaultValue={user.lastName}
            error={fieldErrors.lastName}
          />
        </div>
        <TextField
          label="Téléphone"
          name="phone"
          type="tel"
          autoComplete="tel"
          defaultValue={user.phone ?? ""}
          error={fieldErrors.phone}
        />
        <TextField
          label="Adresse"
          name="address"
          autoComplete="street-address"
          defaultValue={user.address ?? ""}
          error={fieldErrors.address}
        />
        <div className={styles.row}>
          <TextField
            label="Code postal"
            name="postalCode"
            inputMode="numeric"
            autoComplete="postal-code"
            defaultValue={user.postalCode ?? ""}
            error={fieldErrors.postalCode}
          />
          <TextField
            label="Ville"
            name="city"
            autoComplete="address-level2"
            defaultValue={user.city ?? ""}
            error={fieldErrors.city}
          />
        </div>
        {formError && <Alert tone="error">{formError}</Alert>}
        {saved && <Alert tone="success">Votre profil a été mis à jour.</Alert>}
        <Button type="submit" loading={update.isPending}>
          Enregistrer
        </Button>
      </fieldset>
    </form>
  );
}

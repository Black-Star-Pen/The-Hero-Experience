import {
  addDays,
  BOOKING_MAX_DAYS,
  bookingInputSchema,
  countDays,
  getService,
  todayIso,
  type Booking,
  type HeroDetail,
  type ServiceSlug,
  type User,
} from "@hero-experience/shared";
import { useState } from "react";
import { Alert } from "../../../components/ui/Alert.tsx";
import { Button, ButtonLink } from "../../../components/ui/Button.tsx";
import {
  SelectField,
  TextareaField,
  TextField,
} from "../../../components/ui/Field.tsx";
import {
  formatDate,
  formatPrice,
  formatShortDate,
  pluralize,
} from "../../../lib/format.ts";
import { useZodForm } from "../../../lib/forms.ts";
import { useHeroAvailability } from "../../heroes/api.ts";
import { useCreateBooking } from "../api.ts";
import styles from "./BookingForm.module.css";

function Confirmation({
  booking,
  onAgain,
}: {
  booking: Booking;
  onAgain: () => void;
}) {
  return (
    <div className={styles.confirmation}>
      <Alert tone="success" title="Réservation confirmée !">
        <p>
          {booking.hero.name} interviendra pour «{" "}
          {getService(booking.service).label} »{" "}
          {booking.startDate === booking.endDate
            ? `le ${formatDate(booking.startDate)}`
            : `du ${formatDate(booking.startDate)} au ${formatDate(booking.endDate)}`}
          , pour un total de {formatPrice(booking.totalPrice)}.
        </p>
      </Alert>
      <ButtonLink to="/compte" block>
        Voir mes réservations
      </ButtonLink>
      <Button variant="ghost" block onClick={onAgain}>
        Faire une autre réservation
      </Button>
    </div>
  );
}

export function BookingForm({ hero, user }: { hero: HeroDetail; user: User }) {
  const today = todayIso();
  const firstFreeDay =
    hero.nextAvailableDate && hero.nextAvailableDate > today
      ? hero.nextAvailableDate
      : today;
  const [service, setService] = useState<ServiceSlug | undefined>(
    hero.services[0],
  );
  const [startDate, setStartDate] = useState(firstFreeDay);
  const [endDate, setEndDate] = useState(firstFreeDay);
  const [booking, setBooking] = useState<Booking | null>(null);
  const availability = useHeroAvailability(hero.id);
  const create = useCreateBooking();
  const { fieldErrors, formError, handleSubmit } = useZodForm(
    bookingInputSchema,
    async (input) => {
      setBooking(await create.mutateAsync(input));
    },
  );

  if (booking)
    return <Confirmation booking={booking} onAgain={() => setBooking(null)} />;

  const validPeriod = startDate !== "" && endDate >= startDate;
  const days = validPeriod ? countDays(startDate, endDate) : 0;
  const conflict = validPeriod
    ? availability.data?.bookedRanges.find(
        (range) => range.start <= endDate && range.end >= startDate,
      )
    : undefined;

  return (
    <form
      className={styles.form}
      noValidate
      onSubmit={handleSubmit((values) => ({ ...values, heroId: hero.id }))}
    >
      <SelectField
        label="Service"
        name="service"
        value={service}
        onChange={(event) => setService(event.target.value as ServiceSlug)}
        error={fieldErrors.service}
      >
        {hero.services.map((slug) => (
          <option key={slug} value={slug}>
            {getService(slug).label}
          </option>
        ))}
      </SelectField>
      <div className={styles.period}>
        <TextField
          label="Du"
          name="startDate"
          type="date"
          required
          min={today}
          value={startDate}
          onChange={(event) => {
            setStartDate(event.target.value);
            if (endDate < event.target.value) setEndDate(event.target.value);
          }}
          error={fieldErrors.startDate}
        />
        <TextField
          label="Au"
          name="endDate"
          type="date"
          required
          min={startDate || today}
          max={startDate ? addDays(startDate, BOOKING_MAX_DAYS - 1) : undefined}
          value={endDate}
          onChange={(event) => setEndDate(event.target.value)}
          error={fieldErrors.endDate}
        />
      </div>
      {conflict && (
        <Alert tone="warning" title="Dates indisponibles">
          {/* Short months end with a dot ("janv."): no dot after the dates */}
          {hero.name} est déjà réservé{" "}
          {conflict.start === conflict.end
            ? `le ${formatShortDate(conflict.start)}`
            : `du ${formatShortDate(conflict.start)} au ${formatShortDate(conflict.end)}`}{" "}
          : choisissez d'autres dates.
        </Alert>
      )}

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Lieu de l'intervention</legend>
        <TextField
          label="Adresse"
          name="address"
          required
          autoComplete="street-address"
          defaultValue={user.address ?? ""}
          error={fieldErrors.address}
        />
        <div className={styles.pair}>
          <TextField
            label="Code postal"
            name="postalCode"
            required
            inputMode="numeric"
            autoComplete="postal-code"
            defaultValue={user.postalCode ?? ""}
            error={fieldErrors.postalCode}
          />
          <TextField
            label="Ville"
            name="city"
            required
            autoComplete="address-level2"
            defaultValue={user.city ?? ""}
            error={fieldErrors.city}
          />
        </div>
        <TextField
          label="Téléphone"
          name="phone"
          type="tel"
          required
          autoComplete="tel"
          defaultValue={user.phone ?? ""}
          error={fieldErrors.phone}
        />
        <TextareaField
          label="Message pour le héros"
          name="notes"
          hint="Facultatif : étage, digicode, taille du piano…"
          maxLength={500}
          error={fieldErrors.notes}
        />
      </fieldset>

      <dl className={styles.summary} aria-live="polite">
        <div>
          <dt>
            {pluralize(days, "jour")} × {formatPrice(hero.dailyRate)}
          </dt>
          <dd>{formatPrice(days * hero.dailyRate)}</dd>
        </div>
        <div className={styles.total}>
          <dt>Total</dt>
          <dd>{formatPrice(days * hero.dailyRate)}</dd>
        </div>
      </dl>

      {formError && <Alert tone="error">{formError}</Alert>}
      <Button
        type="submit"
        size="lg"
        block
        loading={create.isPending}
        disabled={Boolean(conflict)}
      >
        Confirmer la réservation
      </Button>
      <p className={styles.note}>
        Paiement simulé : aucun débit, ce site est fictif. Annulation gratuite
        jusqu'à la veille de l'intervention.
      </p>
    </form>
  );
}

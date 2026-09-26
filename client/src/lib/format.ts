import { todayIso } from "@hero-experience/shared";

const euros = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

export const formatPrice = (amount: number): string => euros.format(amount);

export const formatNumber = (value: number): string =>
  value.toLocaleString("fr-FR");

export const formatRating = (value: number): string =>
  value.toLocaleString("fr-FR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

// Calendar dates (YYYY-MM-DD) are formatted in UTC to avoid any day shift
const longDate = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});
const shortDate = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

const fromIsoDate = (isoDate: string) => new Date(`${isoDate}T00:00:00Z`);

export const formatDate = (isoDate: string): string =>
  longDate.format(fromIsoDate(isoDate));

export const formatShortDate = (isoDate: string): string =>
  shortDate.format(fromIsoDate(isoDate));

/** "aujourd'hui", "demain" or "le 29 sept.". */
export function formatAvailability(isoDate: string): string {
  const today = todayIso();
  if (isoDate <= today) return "aujourd'hui";
  const tomorrow = fromIsoDate(today);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  if (isoDate === tomorrow.toISOString().slice(0, 10)) return "demain";
  return `le ${formatShortDate(isoDate)}`;
}

/** "3 jours", "1 jour". */
export const pluralize = (
  count: number,
  singular: string,
  plural = `${singular}s`,
) => `${formatNumber(count)} ${count > 1 ? plural : singular}`;

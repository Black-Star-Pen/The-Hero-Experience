/** Heroes work in France: "today" is always computed in this time zone. */
export const APP_TIME_ZONE = "Europe/Paris";

const DAY_MS = 24 * 60 * 60 * 1000;

/** Today's date (YYYY-MM-DD) in the app time zone. */
export function todayIso(now: Date = new Date()): string {
  // The en-CA locale formats dates as YYYY-MM-DD
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

const toUtcDate = (isoDate: string) => new Date(`${isoDate}T00:00:00Z`);

/** Adds (or subtracts) days to a YYYY-MM-DD date. */
export function addDays(isoDate: string, days: number): string {
  return new Date(toUtcDate(isoDate).getTime() + days * DAY_MS)
    .toISOString()
    .slice(0, 10);
}

/** Number of days from start to end, both included. */
export function countDays(start: string, end: string): number {
  return (
    Math.round(
      (toUtcDate(end).getTime() - toUtcDate(start).getTime()) / DAY_MS,
    ) + 1
  );
}

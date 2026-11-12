/**
 * Jalali date formatting shared by all kit implementations.
 * Fixed timezone (Asia/Tehran) and fixed locale options keep rendering
 * deterministic across browsers and machines.
 * No external date library — Intl handles the Persian calendar natively.
 */

const TEHRAN = 'Asia/Tehran';

const dateFormatter = new Intl.DateTimeFormat('fa-IR-u-ca-persian-nu-arabext', {
  timeZone: TEHRAN,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** ISO/Gregorian input → Jalali numeric date with Persian digits (e.g. ۱۴۰۳/۰۷/۱۲). */
export function formatJalaliDate(iso: string): string {
  const parts = dateFormatter.formatToParts(new Date(iso));
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  // fa-IR numeric format renders as «۱۴۰۳/۰۷/۱۲» — normalize the separators.
  const year = get('year');
  const month = get('month');
  const day = get('day');
  return `${year}/${month}/${day}`;
}

/** For sort keys and the table column: plain ISO date portion (deterministic). */
export function isoDay(iso: string): string {
  return iso.slice(0, 10);
}

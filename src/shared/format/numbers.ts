/**
 * Persian digit formatting shared by all kit implementations.
 * Display-only: raw values (phone numbers, dates) are never modified in data.
 */

const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'] as const;

/** Maps every ASCII digit to its Persian counterpart; leaves everything else untouched. */
export function toPersianDigits(value: string | number): string {
  return String(value).replace(/[0-9]/g, (d) => PERSIAN_DIGITS[Number(d)]);
}

/** Grouped integer formatting with Persian digits (e.g. ۱٬۳۹۵). */
export function formatCount(value: number): string {
  return toPersianDigits(value.toLocaleString('fa-IR'));
}

/**
 * Shared domain types for the synthetic CRM dataset.
 * Every UI kit implementation consumes these exact types (FR-05).
 * All data is synthetic; names are randomly combined Persian name parts
 * and must never be treated as real people (see docs/DECISIONS.md).
 */

export type CustomerStatus = 'active' | 'inactive' | 'pending' | 'blocked';

export interface Organization {
  id: string;
  name: string;
  city: string;
}

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  /** Always derived from firstName + lastName at generation time — never a second source of truth. */
  fullName: string;
  organizationId: string;
  /** Denormalized for table rendering; generated from the same organizations list, so it can never diverge. */
  organizationName: string;
  /** Synthetic, non-dialable number (see fixtures.ts) — stored raw, formatted for display only. */
  phone: string;
  email: string;
  city: string;
  status: CustomerStatus;
  /** ISO date string (Gregorian); rendered as Jalali only at display time (Asia/Tehran). */
  createdAt: string;
}

/** Sorting keys allowed by the shared behavioral contract (§7). */
export type CustomerSortKey = 'fullName' | 'organizationName' | 'city' | 'createdAt';

export interface TableSort {
  key: CustomerSortKey;
  desc: boolean;
}

export type TableFilterValue = string | 'all';

export interface CustomerFilter {
  city: TableFilterValue;
  status: CustomerStatus | 'all';
}

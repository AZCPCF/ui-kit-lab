/**
 * Shared behavioral contract + pure selectors for the Customer Table
 * scenario. Every kit implementation must produce the same results from
 * these functions; kit files only map this contract to their own components.
 */

import type { Contact, CustomerFilter, CustomerSortKey, TableSort } from '../../data/types';
import { tableLabels, statusLabels } from '../../data/labels';

export type CustomerTableState = {
  query: string;
  city: CustomerFilter['city'];
  status: CustomerFilter['status'];
  sort: TableSort | null;
  page: number; // 1-based
  pageSize: 10 | 25 | 50;
  /** Test-state switches, part of the behavioral contract (loading/empty states). */
  simulateLoading: boolean;
  emptyDataset: boolean;
};

export const INITIAL_TABLE_STATE: CustomerTableState = {
  query: '',
  city: 'all',
  status: 'all',
  sort: null,
  page: 1,
  pageSize: 10,
  simulateLoading: false,
  emptyDataset: false,
};

export const PAGE_SIZES: ReadonlyArray<10 | 25 | 50> = [10, 25, 50];

export const SORT_KEYS: ReadonlyArray<CustomerSortKey> = [
  'fullName',
  'organizationName',
  'city',
  'createdAt',
];

const SEARCH_FIELDS: Array<(c: Contact) => string> = [
  (c) => c.fullName,
  (c) => c.organizationName,
  (c) => c.phone,
  (c) => c.email,
];

export function searchContacts(contacts: readonly Contact[], query: string): Contact[] {
  const q = query.trim().toLowerCase();
  if (!q) return [...contacts];
  return contacts.filter((c) => SEARCH_FIELDS.some((field) => field(c).toLowerCase().includes(q)));
}

export function filterContacts(
  contacts: readonly Contact[],
  { query, city, status }: Pick<CustomerTableState, 'query' | 'city' | 'status'>,
): Contact[] {
  let out = searchContacts(contacts, query);
  if (city !== 'all') out = out.filter((c) => c.city === city);
  if (status !== 'all') out = out.filter((c) => c.status === status);
  return out;
}

/** Persian-aware comparator (shared by TanStack sortFns and antd sorter). */
export function comparePersian(a: string, b: string): number {
  return a.localeCompare(b, 'fa', { sensitivity: 'base', numeric: true });
}

export function sortContacts(contacts: readonly Contact[], sort: TableSort | null): Contact[] {
  if (!sort) return [...contacts];
  const { key, desc } = sort;
  const out = [...contacts];
  out.sort((a, b) => {
    const va = a[key];
    const vb = b[key];
    const cmp =
      typeof va === 'string' && typeof vb === 'string'
        ? comparePersian(va, vb)
        : va < vb
          ? -1
          : va > vb
            ? 1
            : 0;
    return desc ? -cmp : cmp;
  });
  return out;
}

export function paginate(contacts: readonly Contact[], page: number, pageSize: number) {
  const total = contacts.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), pageCount);
  const start = (safePage - 1) * pageSize;
  return {
    rows: contacts.slice(start, start + pageSize),
    total,
    pageCount,
    page: safePage,
    from: total === 0 ? 0 : start + 1,
    to: Math.min(start + pageSize, total),
  };
}

export const cityOptions = (cities: readonly string[]) => cities;

export { statusLabels, tableLabels };

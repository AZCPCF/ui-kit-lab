/**
 * Deterministic synthetic CRM fixtures.
 *
 * - Fixed seed + mulberry32 PRNG → the dataset is byte-stable across runs.
 * - Exactly 385 organizations and 1,395 contacts (Hirad context figures).
 * - Names are combinations of common Persian name parts — synthetic, not
 *   real people. Phones use the non-dialable "+98 000" operator block.
 * - Emails use example.test / example.org reserved domains (RFC 2606).
 * - Generated once at module load, never per render.
 */

import type { Contact, CustomerStatus, Organization } from './types';

const ORGANIZATION_COUNT = 385;
const CONTACT_COUNT = 1395;

/** Fixed seed — changing it changes the dataset; the seed is part of the fixture identity. */
const SEED = 20261112;

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FIRST_NAMES = [
  'علی', 'محمد', 'رضا', 'حسین', 'امیر', 'سعید', 'مهدی', 'مجید', 'کارن', 'آرش',
  'بهنام', 'کامران', 'فرهاد', 'بابک', 'نوید', 'پویا', 'سامان', 'میثم', 'وحید', 'شهرام',
  'زهرا', 'فاطمه', 'مریم', 'سارا', 'نگار', 'شیوا', 'پریسا', 'نازنین', 'الهام', 'رویا',
  'شیرین', 'مینا', 'هانیه', 'لیلا', 'سمیرا', 'نیلوفر', 'ترانه', 'آیدا', 'سپیده', 'غزاله',
];

const LAST_NAMES = [
  'احمدی', 'محمدی', 'حسینی', 'رضایی', 'کریمی', 'موسوی', 'جعفری', 'نوری', 'شریفی', 'قاسمی',
  'صادقی', 'عباسی', 'ابراهیمی', 'حیدری', 'رحیمی', 'نیک‌نام', 'علوی', 'تهرانی', 'فارسی', 'بهرامی',
  'زمانی', 'کاشانی', 'سعیدی', 'مرادی', 'بهرامی‌نژاد', 'یزدانی', 'شیروانی', 'اهری', 'گلستانی', 'پارسا',
];

const NAME_PARTS_A = [
  'پارس', 'هیراد', 'آریا', 'دیان', 'فن‌آور', 'داده‌کاوه', 'سامان', 'رهیاب', 'تابان', 'کاسپین',
  'بوم', 'زیست', 'نگین', 'مهر', 'رایان', 'توسن', 'البرز', 'زربین',
];

const NAME_PARTS_B = [
  'فن', 'داده', 'سامانه', 'گستر', 'پویا', 'آسا', 'پرداز', 'نگار', 'افزار', 'راهان',
];

const LEGAL_FORMS = ['شرکت', 'گروه', 'مؤسسه', 'مجمع'];

const CITIES = [
  'تهران', 'مشهد', 'اصفهان', 'تبریز', 'شیراز', 'کرج', 'اهواز', 'قم', 'رشت', 'کرمان',
  'یزد', 'همدان', 'اردبیل', 'بندرعباس', 'سنندج',
];
const STATUSES: CustomerStatus[] = ['active', 'inactive', 'pending', 'blocked'];

/** Status distribution weights: active ≈ 55%, pending ≈ 20%, inactive ≈ 15%, blocked ≈ 10%. */
const STATUS_WEIGHTS: Array<[CustomerStatus, number]> = [
  ['active', 0.55],
  ['pending', 0.75],
  ['inactive', 0.9],
  ['blocked', 1.0],
];

function pickStatus(r: number): CustomerStatus {
  for (const [status, upper] of STATUS_WEIGHTS) {
    if (r < upper) return status;
  }
  return 'active';
}

/** Fixed Gregorian creation window: 2023-03-21 … 2025-10-31 (≈ 1402–1404 Jalali). */
const DATE_START_MS = Date.UTC(2023, 2, 21);
const DATE_END_MS = Date.UTC(2025, 9, 31);

function isoDate(r1: number, r2: number): string {
  const ms = DATE_START_MS + Math.floor(r1 * (DATE_END_MS - DATE_START_MS));
  // r2 varies the time-of-day so sorts by date are meaningfully ordered; the
  // date itself stays inside the fixed window (Tehran offset applied at render).
  const dayOffset = Math.floor(r2 * 24) * 3600_000;
  return new Date(ms + dayOffset).toISOString();
}

let orgCounter = 0;
function organizationId(): string {
  orgCounter += 1;
  return `org-${String(orgCounter).padStart(3, '0')}`;
}

let contactCounter = 0;
function contactId(): string {
  contactCounter += 1;
  return `contact-${String(contactCounter).padStart(4, '0')}`;
}

/** Non-dialable: the "+98 000" operator block is not allocated in Iran. */
function syntheticPhone(r1: number, r2: number): string {
  const block = String(1000 + Math.floor(r1 * 9000));
  const last = String(1000 + Math.floor(r2 * 9000));
  return `+98 000 ${block} ${last}`;
}

const EMAIL_DOMAINS = ['example.test', 'example.org', 'example.com'];

function generate(): { organizations: Organization[]; contacts: Contact[] } {
  const rand = mulberry32(SEED);

  const organizations: Organization[] = Array.from({ length: ORGANIZATION_COUNT }, () => {
    const name = `${LEGAL_FORMS[Math.floor(rand() * LEGAL_FORMS.length)]} ${
      NAME_PARTS_A[Math.floor(rand() * NAME_PARTS_A.length)]
    }${NAME_PARTS_B[Math.floor(rand() * NAME_PARTS_B.length)]}`;
    return {
      id: organizationId(),
      name,
      city: CITIES[Math.floor(rand() * CITIES.length)],
    };
  });

  const contacts: Contact[] = Array.from({ length: CONTACT_COUNT }, () => {
    const firstName = FIRST_NAMES[Math.floor(rand() * FIRST_NAMES.length)];
    const lastName = LAST_NAMES[Math.floor(rand() * LAST_NAMES.length)];
    const organization = organizations[Math.floor(rand() * organizations.length)];
    return {
      id: contactId(),
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`,
      organizationId: organization.id,
      organizationName: organization.name,
      phone: syntheticPhone(rand(), rand()),
      email: `user${contactCounter}@${EMAIL_DOMAINS[Math.floor(rand() * EMAIL_DOMAINS.length)]}`,
      city: CITIES[Math.floor(rand() * CITIES.length)],
      status: pickStatus(rand()),
      createdAt: isoDate(rand(), rand()),
    };
  });

  return { organizations, contacts };
}

const { organizations, contacts } = generate();

export { organizations, contacts, CITIES as cities, STATUSES as statuses };

/* ---- Development-time integrity assertions (stripped in production) ---- */

if (import.meta.env.DEV) {
  if (organizations.length !== ORGANIZATION_COUNT) {
    throw new Error(`Fixture corruption: expected ${ORGANIZATION_COUNT} organizations, got ${organizations.length}`);
  }
  if (contacts.length !== CONTACT_COUNT) {
    throw new Error(`Fixture corruption: expected ${CONTACT_COUNT} contacts, got ${contacts.length}`);
  }
  const orgIds = new Set(organizations.map((o) => o.id));
  if (orgIds.size !== ORGANIZATION_COUNT) {
    throw new Error('Fixture corruption: duplicate organization ids');
  }
  const contactIds = new Set(contacts.map((c) => c.id));
  if (contactIds.size !== CONTACT_COUNT) {
    throw new Error('Fixture corruption: duplicate contact ids');
  }
  const orphans = contacts.filter((c) => !orgIds.has(c.organizationId));
  if (orphans.length > 0) {
    throw new Error(`Fixture corruption: ${orphans.length} contacts reference missing organizations`);
  }
  const mismatched = contacts.filter(
    (c) => c.fullName !== `${c.firstName} ${c.lastName}`,
  );
  if (mismatched.length > 0) {
    throw new Error('Fixture corruption: fullName does not derive from name parts');
  }
}

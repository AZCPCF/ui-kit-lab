/**
 * Shared labels for the playground. Kit panels in the CSS-isolation spike
 * keep their own sample-content.ts (frozen artifact); the playground uses
 * this file so all kit implementations show exactly equivalent strings.
 */

export const scenarioMeta = {
  customerTable: 'سناریو ۱ — جدول مشتریان',
} as const;

export const shellLabels = {
  appTitle: 'آزمایشگاه کتابخانه‌های رابط کاربری',
  kitSelector: 'کتابخانه رابط',
  themeSelector: 'تم',
  directionSelector: 'جهت',
  scenario: 'سناریو',
  spikeLink: 'آزمون ایزولاسیون CSS',
  spikeBack: 'بازگشت به پلی‌گراند',
} as const;

export const kitNames = {
  mantine: 'Mantine',
  antd: 'Ant Design',
  shadcn: 'shadcn/ui',
} as const;

export const tableLabels = {
  columns: {
    fullName: 'نام و نام خانوادگی',
    organization: 'سازمان',
    phone: 'شماره تماس',
    email: 'ایمیل',
    city: 'شهر',
    status: 'وضعیت',
    createdAt: 'تاریخ ایجاد',
    actions: 'عملیات',
  },
  searchPlaceholder: 'جستجو: نام، سازمان، تلفن، ایمیل…',
  cityFilterAll: 'همه شهرها',
  statusFilterAll: 'همه وضعیت‌ها',
  clearFilters: 'پاک‌سازی فیلترها',
  pageSizeLabel: 'تعداد در صفحه',
  pageInfo: (from: string, to: string, total: string) =>
    `نمایش ${from} تا ${to} از ${total}`,
  prevPage: 'قبلی',
  nextPage: 'بعدی',
  loading: 'در حال بارگذاری…',
  emptyDataset: 'هیچ مشتری در دیتاست نیست (حالت آزمون دیتاست خالی).',
  noResults: 'هیچ نتیجه‌ای برای جستجو/فیلتر فعلی یافت نشد.',
  simulateLoading: 'شبیه‌سازی بارگذاری',
  emptyDatasetToggle: 'دیتاست خالی',
  rowsLabel: 'ردیف',
  actionsOpen: 'عملیات',
  actionDetails: 'مشاهده جزئیات',
  actionEdit: 'ویرایش',
  actionDelete: 'حذف',
} as const;

export const statusLabels: Record<
  'active' | 'inactive' | 'pending' | 'blocked',
  string
> = {
  active: 'فعال',
  inactive: 'غیرفعال',
  pending: 'در انتظار',
  blocked: 'مسدود',
};

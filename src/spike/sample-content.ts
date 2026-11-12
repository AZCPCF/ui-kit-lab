/**
 * Shared Persian sample labels for all three kit panels.
 * Panels must render equivalent content so that visual/behavioral
 * comparison stays fair. No kit-specific imports here.
 */

export const kitMeta = {
  mantine: { name: 'Mantine', sub: '@mantine/core 9.8.0' },
  antd: { name: 'Ant Design', sub: 'antd 6.7.0' },
  shadcn: { name: 'shadcn/ui', sub: 'Radix primitives + Tailwind v4' },
} as const;

export const labels = {
  darkToggle: 'حالت تیره',
  lightToggle: 'حالت روشن',
  rtlToggle: 'راست‌چین',
  ltrToggle: 'چپ‌چین',
  stateDark: 'تیره',
  stateLight: 'روشن',
  stateRtl: 'راست‌به‌چپ',
  stateLtr: 'چپ‌به‌راست',
  buttonLabel: 'ذخیره تغییرات',
  buttonPressed: 'ذخیره شد ✓',
  inputLabel: 'نام شرکت',
  inputPlaceholder: 'مثلاً شرکت پارس‌فن',
  dialogTrigger: 'جزئیات مشتری',
  dialogTitle: 'اطلاعات مشتری',
  dialogBody:
    'این پنجره برای آزمون ایزولاسیون پورتال باز شده است. باید فقط در محدوده پنل خودش قلم‌و رنگ بگیرد.',
  dialogConfirm: 'تأیید',
  dialogCancel: 'بستن',
  popoverTrigger: 'عملیات سریع',
  popoverTitle: 'اقدامات',
  popoverItems: ['ویرایش اطلاعات', 'افزودن یادداشت', 'حذف مشتری'],
  popperNote:
    'جزء پورتال‌شده: جایگاه و جهت این جزء باید از پنل خودش پیروی کند.',
} as const;

import { MantinePanel } from './mantine/MantinePanel';
import { AntdPanel } from './antd/AntdPanel';
import { ShadcnPanel } from './shadcn/ShadcnPanel';

/**
 * Neutral shell for the CSS isolation spike.
 * Everything outside the three panels is plain shell CSS on purpose:
 * any visual change to this chrome after mounting a kit is CSS leakage.
 */
export function SpikeShell() {
  return (
    <div className="spike-shell" dir="rtl">
      <header className="spike-header">
        <h1>آزمایشگاه کتابخانه‌های رابط کاربری</h1>
        <p>
          آزمون همزیستی CSS — سه پنل مستقل (Mantine، Ant Design، shadcn/ui) در
          یک SPA. پوسته بی‌طرف نباید از هیچ کتابخانه‌ای اثر بپذیرد.
        </p>
        <nav className="spike-nav">
          <a href="#panels">پنل‌ها</a>
          <a href="#notes">محیط بی‌طرف</a>
          <a href="#docs">مستندات</a>
        </nav>
      </header>

      <main className="spike-panels" id="panels">
        <MantinePanel />
        <AntdPanel />
        <ShadcnPanel />
      </main>

      <section className="spike-notes" id="notes">
        <h2>محیط بی‌طرف پوسته</h2>
        <p>
          این بخش با CSS پوسته ساخته شده و هیچ کتابخانه‌ای آن را مدیریت نمی‌کند.
          فونت، پس‌زمینه، اندازه عنوان‌ها و جعبه‌های زیر باید در تمام حالت‌ها
          (تغییر تم یا جهت هر پنل) ثابت بمانند. هر تغییری نشانه نشت CSS است.
        </p>
        <ul>
          <li>فونت پوسته: system-ui / Tahoma</li>
          <li>پس‌زمینه سند: خاکستری گرم روشن</li>
          <li>جهت سند: بدون ویژگی dir روی html</li>
        </ul>
        <p>
          <button type="button" className="spike-neutral-button">
            دکمه بی‌طرف
          </button>{' '}
          <input
            type="text"
            className="spike-neutral-input"
            placeholder="ورودی بی‌طرف"
          />
        </p>
      </section>

      <footer className="spike-footer" id="docs">
        نسخه‌های نصب‌شده: @mantine/core 9.8.0 · antd 6.7.0 · radix-ui 1.8.1 ·
        tailwindcss 4.3.5 — جزئیات در docs/CSS_ISOLATION_SPIKE.md
      </footer>
    </div>
  );
}

'use client';

import { useLocale, useTranslations } from 'next-intl';

import { Link, usePathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

import styles from './Switch.module.css';

/*
 * Переключатель языка (design/components.md → switch type=text): EN / RU.
 * Визуально — тот же switch, но это ссылки на ту же страницу в другой локали (навигация,
 * работает без JS, видна поисковикам), поэтому role="radiogroup" здесь не используется.
 */
export function LocaleSwitch() {
  const t = useTranslations('LocaleSwitch');
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <nav className={`${styles.switch} ${styles.text}`} aria-label={t('label')}>
      {routing.locales.map((value) => (
        <Link
          key={value}
          href={pathname}
          locale={value}
          hrefLang={value}
          className={styles.option}
          aria-label={t(value)}
          title={t(value)}
          aria-current={value === locale ? 'page' : undefined}
        >
          {value}
        </Link>
      ))}
    </nav>
  );
}

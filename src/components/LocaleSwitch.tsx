'use client';

import { useLocale, useTranslations } from 'next-intl';

import { Link, usePathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

import styles from './Switcher.module.css';

export function LocaleSwitch() {
  const t = useTranslations('LocaleSwitch');
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <nav className={styles.group} aria-label={t('label')}>
      {routing.locales.map((value) => (
        <Link
          key={value}
          href={pathname}
          locale={value}
          hrefLang={value}
          className={styles.item}
          aria-current={value === locale ? 'page' : undefined}
        >
          {t(value)}
        </Link>
      ))}
    </nav>
  );
}

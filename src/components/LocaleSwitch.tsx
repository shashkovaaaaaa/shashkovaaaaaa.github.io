'use client';

import { useLocale, useTranslations } from 'next-intl';

import { Link, usePathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

import buttonStyles from './Button.module.css';
import styles from './Switcher.module.css';

type LocaleSwitchProps = {
  // compact — одна ссылка на другую локаль с кодом языка (десктопный хедер);
  // full — все локали полными названиями (мобильное меню).
  variant?: 'compact' | 'full';
};

export function LocaleSwitch({ variant = 'full' }: LocaleSwitchProps) {
  const t = useTranslations('LocaleSwitch');
  const locale = useLocale();
  const pathname = usePathname();

  if (variant === 'compact') {
    return (
      <>
        {routing.locales
          .filter((value) => value !== locale)
          .map((value) => (
            <Link
              key={value}
              href={pathname}
              locale={value}
              hrefLang={value}
              aria-label={t(value)}
              className={`${buttonStyles.button} ${buttonStyles.link} ${styles.code}`}
            >
              {value}
            </Link>
          ))}
      </>
    );
  }

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

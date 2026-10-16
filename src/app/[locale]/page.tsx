import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { LocaleSwitch } from '@/components/LocaleSwitch';
import { ThemeToggle } from '@/components/ThemeToggle';
import { routing } from '@/i18n/routing';

import styles from './page.module.css';

export default async function HomePage({ params }: PageProps<'/[locale]'>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations('HomePage');

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>{t('title')}</h1>
      {/* Временные контролы для проверки каркаса — уедут в Header. */}
      <div className={styles.controls}>
        <ThemeToggle />
        <LocaleSwitch />
      </div>
    </main>
  );
}

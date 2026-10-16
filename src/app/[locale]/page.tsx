import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { Cta } from '@/components/Cta';
import { routing } from '@/i18n/routing';

export default async function HomePage({ params }: PageProps<'/[locale]'>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations('HomePage');

  return (
    <main>
      {/* Временный h1 до появления hero («Hello, I’m Nastya.») на следующем шаге. */}
      <h1 className="visually-hidden">{t('title')}</h1>
      <Cta />
    </main>
  );
}

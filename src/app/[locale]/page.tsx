import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';

import { Cta } from '@/components/Cta';
import { Hero } from '@/components/Hero';
import { Projects } from '@/components/Projects';
import { routing } from '@/i18n/routing';

export default async function HomePage({ params }: PageProps<'/[locale]'>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <main>
      <Hero />
      <Projects />
      <Cta />
    </main>
  );
}

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { AboutIntro } from '@/components/about/AboutIntro';
import { Experience } from '@/components/about/Experience';
import { Cta } from '@/components/Cta';
import { withBasePath } from '@/config/site';
import { routing } from '@/i18n/routing';

import styles from './page.module.css';

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/about'>): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const t = await getTranslations({ locale, namespace: 'About' });
  const path = (l: string) => withBasePath(`/${l}/about/`);

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: {
      canonical: path(locale),
      languages: Object.fromEntries(routing.locales.map((l) => [l, path(l)])),
    },
  };
}

// design/pages/about-desktop.md: как страница кейса — тело 1200 (gap 60), затем CTA и футер.
export default async function AboutPage({ params }: PageProps<'/[locale]/about'>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <main data-layout="case">
      <div className={styles.body}>
        <AboutIntro />
        <Experience />
      </div>
      <Cta />
    </main>
  );
}

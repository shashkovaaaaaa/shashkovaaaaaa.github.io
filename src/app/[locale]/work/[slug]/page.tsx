import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { CaseNav } from '@/components/CaseNav';
import { Cta } from '@/components/Cta';
import { withBasePath } from '@/config/site';
import { getCase, publishedCases } from '@/content/cases';
import { routing } from '@/i18n/routing';

import styles from './page.module.css';

export const dynamicParams = false;

// Вызывается для каждой локали из [locale]/layout → locale × slug.
export function generateStaticParams() {
  return publishedCases.map(({ slug }) => ({ slug }));
}

async function resolve(params: PageProps<'/[locale]/work/[slug]'>['params']) {
  const { locale, slug } = await params;
  const item = getCase(slug);
  if (!hasLocale(routing.locales, locale) || !item?.published) notFound();
  return { locale, slug, item };
}

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/work/[slug]'>): Promise<Metadata> {
  const { locale, slug, item } = await resolve(params);
  const path = (l: string) => withBasePath(`/${l}/work/${slug}/`);
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  return {
    title: item.title[locale],
    description: item.description[locale],
    alternates: {
      canonical: path(locale),
      languages: Object.fromEntries(routing.locales.map((l) => [l, path(l)])),
    },
    openGraph: {
      type: 'article',
      siteName: t('siteName'),
      locale: t('ogLocale'),
      url: path(locale),
      title: item.title[locale],
      description: item.description[locale],
      images: item.ogImage
        ? [
            {
              url: withBasePath(item.ogImage),
              width: 1200,
              height: 630,
              alt: item.coverAlt[locale],
            },
          ]
        : undefined,
    },
  };
}

export default async function CasePage({ params }: PageProps<'/[locale]/work/[slug]'>) {
  const { locale, slug, item } = await resolve(params);
  setRequestLocale(locale);
  const { default: Content } = await import(`@/content/cases/${slug}/${locale}.mdx`);

  return (
    <main data-layout="case">
      <article className={`${styles.body} ${item.sectionGap === 'loose' ? styles.loose : ''}`}>
        <Content />
      </article>
      <CaseNav slug={slug} locale={locale} />
      <Cta />
    </main>
  );
}

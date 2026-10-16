import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { siteUrl } from '@/config/site';
import { routing } from '@/i18n/routing';

import { inter } from '../fonts';
import styles from './layout.module.css';

export const dynamicParams = false;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: Omit<LayoutProps<'/[locale]'>, 'children'>): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  return {
    metadataBase: new URL(siteUrl),
    title: { default: t('title'), template: `%s — ${t('siteName')}` },
    description: t('description'),
  };
}

export default async function LocaleLayout({ children, params }: LayoutProps<'/[locale]'>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    // suppressHydrationWarning: data-theme на <html> ставит скрипт темы до гидратации.
    <html lang={locale} className={inter.variable} suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <NextIntlClientProvider>
            <div className={styles.page}>
              <Header />
              <div className={styles.content}>
                {children}
                <Footer />
              </div>
            </div>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

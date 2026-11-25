import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';

import { typographDeep } from '@/lib/typograph.mjs';

import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  return {
    locale,
    // Неразрывные пробелы после предлогов/союзов во всех строках интерфейса.
    messages: typographDeep((await import(`../messages/${locale}.json`)).default),
  };
});

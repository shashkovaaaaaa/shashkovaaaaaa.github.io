import type { Metadata } from 'next';

import { routing } from '@/i18n/routing';

import { inter } from './fonts';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export const metadata: Metadata = {
  title: 'Anastasiia Shashkova — Product Designer',
  robots: { index: false },
};

// Middleware в static export нет, поэтому язык выбираем на клиенте.
const redirectScript = `(function () {
  var locales = ${JSON.stringify(routing.locales)};
  var fallback = ${JSON.stringify(routing.defaultLocale)};
  var langs = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language];
  var target = fallback;
  for (var i = 0; i < langs.length; i++) {
    var code = String(langs[i] || '').toLowerCase().split('-')[0];
    if (locales.indexOf(code) !== -1) { target = code; break; }
  }
  window.location.replace(${JSON.stringify(basePath)} + '/' + target + '/');
})();`;

export default function RootRedirectPage() {
  return (
    <html lang={routing.defaultLocale} className={inter.variable}>
      <body>
        <script dangerouslySetInnerHTML={{ __html: redirectScript }} />
        <noscript>
          <p>
            <a href={`${basePath}/en/`}>English</a> · <a href={`${basePath}/ru/`}>Русский</a>
          </p>
        </noscript>
      </body>
    </html>
  );
}

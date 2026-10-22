import type { Locale } from 'next-intl';

// design/CHANGES-v3.md, п. 5. LinkedIn и Behance в v2 макета убраны.
// Пустая строка — контакта нет, кнопка не рендерится.
export const contacts = {
  email: 'mailto:st.shashkova@yandex.ru',
  telegram: 'https://t.me/shashkovaaaaaa',
  whatsapp: 'https://wa.me/79111151400',
} as const;

// Резюме на языке текущей локали: файл из public/ и имя при скачивании.
export const resume: Record<Locale, { href: string; fileName: string }> = {
  en: { href: '/resume-en.pdf', fileName: 'Anastasiia-Shashkova-CV-EN.pdf' },
  ru: { href: '/resume-ru.pdf', fileName: 'Anastasiia-Shashkova-CV-RU.pdf' },
};

export type ContactKey = keyof typeof contacts | 'resume';

export type ContactLink = { key: ContactKey; href: string; download?: string };

// Порядок — как в макете: хедер (иконки на desktop, ссылки в мобильном меню) и CTA.
export const headerContacts = [
  'telegram',
  'email',
  'resume',
] as const satisfies readonly ContactKey[];

export const ctaContacts = [
  'email',
  'telegram',
  'whatsapp',
] as const satisfies readonly ContactKey[];

function getContactLink(key: ContactKey, locale: Locale): ContactLink | null {
  if (key === 'resume') {
    const { href, fileName } = resume[locale];
    return { key, href, download: fileName };
  }
  const href = contacts[key];
  return href ? { key, href } : null;
}

// Ссылки для списка контактов; пустые (без адреса) отбрасываются.
export function getContactLinks<K extends ContactKey>(keys: readonly K[], locale: Locale) {
  return keys
    .map((key) => getContactLink(key, locale))
    .filter((link): link is ContactLink & { key: K } => link !== null);
}

// mailto и относительные ссылки открываем в той же вкладке.
export function isExternal(href: string) {
  return /^https?:\/\//.test(href);
}

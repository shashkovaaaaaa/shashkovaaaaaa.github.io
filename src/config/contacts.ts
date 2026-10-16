// TODO: заменить плейсхолдеры реальными ссылками.
// LinkedIn и Behance в v2 макета убраны.
export const contacts = {
  email: 'mailto:TODO@example.com',
  telegram: 'https://t.me/TODO',
  whatsapp: 'https://wa.me/TODO',
  // Файл резюме положить в public/ (например, public/resume.pdf) и указать путь '/resume.pdf';
  // либо внешняя ссылка (Google Drive и т.п.).
  resume: 'TODO',
} as const;

export type ContactKey = keyof typeof contacts;

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

// mailto и относительные ссылки открываем в той же вкладке.
export function isExternal(href: string) {
  return /^https?:\/\//.test(href);
}

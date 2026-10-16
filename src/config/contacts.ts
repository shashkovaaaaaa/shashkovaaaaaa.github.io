// TODO: заменить плейсхолдеры реальными ссылками.
export const contacts = {
  email: 'mailto:TODO@example.com',
  telegram: 'https://t.me/TODO',
  whatsapp: 'https://wa.me/TODO',
  linkedin: 'https://www.linkedin.com/in/TODO',
  behance: 'https://www.behance.net/TODO',
  resume: 'TODO',
} as const;

export type ContactKey = keyof typeof contacts;

// Порядок кнопок — как в макете.
export const headerContacts = [
  'telegram',
  'email',
  'linkedin',
  'behance',
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

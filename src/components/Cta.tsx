import { useLocale, useTranslations } from 'next-intl';

import { ctaContacts, getContactLinks } from '@/config/contacts';

import { ButtonLink } from './Button';
import styles from './Cta.module.css';

export function Cta() {
  const t = useTranslations('Cta');
  const tContacts = useTranslations('Contacts');
  const locale = useLocale();

  return (
    <section className={styles.cta} aria-labelledby="cta-title">
      {/* <br></br> в Cta.title — ручной перенос (RU: «Обсудим вашу / следующую идею»). */}
      <h2 id="cta-title" className={styles.title}>
        {t.rich('title', { br: () => <br /> })}
      </h2>
      <ul className={styles.buttons}>
        {/* Контакты без адреса (сейчас WhatsApp) не рендерятся. */}
        {getContactLinks(ctaContacts, locale).map(({ key, href }) => (
          <li key={key}>
            <ButtonLink href={href} variant="outline">
              {tContacts(key)}
            </ButtonLink>
          </li>
        ))}
      </ul>
    </section>
  );
}

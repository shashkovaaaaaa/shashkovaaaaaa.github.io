import { useTranslations } from 'next-intl';

import { contacts, ctaContacts } from '@/config/contacts';

import { ButtonLink } from './Button';
import styles from './Cta.module.css';

export function Cta() {
  const t = useTranslations('Cta');
  const tContacts = useTranslations('Contacts');

  return (
    <section className={styles.cta} aria-labelledby="cta-title">
      <h2 id="cta-title" className={styles.title}>
        {t('title')}
      </h2>
      <ul className={styles.buttons}>
        {ctaContacts.map((key) => (
          <li key={key}>
            <ButtonLink href={contacts[key]} variant="outline">
              {tContacts(key)}
            </ButtonLink>
          </li>
        ))}
      </ul>
    </section>
  );
}

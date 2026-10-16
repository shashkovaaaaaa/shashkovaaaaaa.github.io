import { useTranslations } from 'next-intl';

import styles from './Footer.module.css';

export function Footer() {
  const t = useTranslations('Footer');

  return (
    <footer className={styles.footer}>
      <p>{t('location')}</p>
      <p>{t('updated')}</p>
    </footer>
  );
}

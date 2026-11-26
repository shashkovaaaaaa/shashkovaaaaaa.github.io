import { useTranslations } from 'next-intl';

import styles from './Footer.module.css';
import { LocalTime } from './LocalTime';

// Три колонки: кто я · где я и который там час · когда обновлён сайт.
// Desktop/tablet — в ряд (слева / по центру / справа), mobile — столбиком по центру.
export function Footer() {
  const t = useTranslations('Footer');

  return (
    <footer className={styles.footer}>
      <div className={`${styles.group} ${styles.start}`}>
        <p className={styles.medium}>{t('name')}</p>
        <p>{t('position')}</p>
      </div>
      <div className={`${styles.group} ${styles.center}`}>
        <p>{t('location')}</p>
        <p className={styles.medium}>
          <LocalTime timeZone="Asia/Bangkok" label="GMT+7" />
        </p>
      </div>
      <div className={`${styles.group} ${styles.end} ${styles.version}`}>
        <p className={styles.updated}>{t('updated')}</p>
        <p className={styles.versionLine}>{t('version')}</p>
      </div>
    </footer>
  );
}

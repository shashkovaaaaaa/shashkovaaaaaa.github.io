import { useTranslations } from 'next-intl';

import styles from './AboutIntro.module.css';

// design/pages/about-desktop.md → decision-1: текст 570 + фото 590×590 (как Decision в кейсах).
export function AboutIntro() {
  const t = useTranslations('About');

  return (
    <section className={styles.intro}>
      <div className={styles.text}>
        <h1 className={styles.title}>{t('title')}</h1>
        <div className={styles.body}>
          <p>{t('intro1')}</p>
          <p>{t('intro2')}</p>
        </div>
      </div>
      {/* TODO: фото от дизайнера (590×590). Пока — пустой плейсхолдер. */}
      <div className={styles.photo} aria-hidden />
    </section>
  );
}

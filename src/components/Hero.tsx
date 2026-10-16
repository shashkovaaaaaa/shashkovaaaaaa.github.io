import { useTranslations } from 'next-intl';

import styles from './Hero.module.css';

export function Hero() {
  const t = useTranslations('HomePage.hero');

  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.text}>
        <h1 id="hero-title" className={styles.title}>
          {t('title')}
        </h1>
        <p className={styles.subtitle}>{t('subtitle')}</p>
      </div>
    </section>
  );
}

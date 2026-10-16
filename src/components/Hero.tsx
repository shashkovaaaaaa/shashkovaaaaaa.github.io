import { useTranslations } from 'next-intl';

import styles from './Hero.module.css';

export function Hero() {
  const t = useTranslations('HomePage.hero');

  // id="about": страницы «About me» нет, ссылка из хедера ведёт сюда.
  return (
    <section id="about" className={styles.hero}>
      <div className={styles.text}>
        <h1 className={styles.title}>{t('title')}</h1>
        <p className={styles.subtitle}>{t('subtitle')}</p>
      </div>
    </section>
  );
}

import { useTranslations } from 'next-intl';

import styles from './AboutIntro.module.css';

// design/pages/work-about-*.md → decision-1 / text: текст + фото (desktop 570 + 590, tablet 344 + 364 в ряд,
// mobile столбиком 370).
export function AboutIntro() {
  const t = useTranslations('About');

  return (
    <section className={styles.intro}>
      <div className={styles.text}>
        {/* TODO: вычитка RU-заголовка (ru.json → About.title): в резюме нет приветствия,
            «Привет, я Анастасия —» добавлено по аналогии с EN (design/about-texts.md). */}
        <h1 className={styles.title}>{t('title')}</h1>
        <div className={styles.body}>
          <p>{t('intro1')}</p>
          <p>{t('intro2')}</p>
        </div>
      </div>
      {/* TODO: фото от дизайнера (590 / 364 / 370). Пока — пустой плейсхолдер. */}
      <div className={styles.photo} aria-hidden />
    </section>
  );
}

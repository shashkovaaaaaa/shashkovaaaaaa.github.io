import ExportedImage from 'next-image-export-optimizer';
import { useLocale, useTranslations } from 'next-intl';

import { basePath } from '@/config/site';
import { aboutPhoto } from '@/content/about';

import styles from './AboutIntro.module.css';

// design/pages/work-about-*.md → decision-1 / text: текст + фото (desktop 570 + 590, tablet 344 + 364 в ряд,
// mobile столбиком 370). Фото — из src/content/about.ts, может отсутствовать.
export function AboutIntro() {
  const t = useTranslations('About');
  const locale = useLocale();

  return (
    <section className={styles.intro}>
      <div className={styles.text}>
        {/* TODO: вычитка RU-заголовка (ru.json → About.title): в резюме нет приветствия,
            «Привет, я Анастасия —» добавлено по аналогии с EN (design/about-texts.md). */}
        {/* <br></br> в About.title — ручные переносы строк, только на desktop (≥1200). */}
        <h1 className={styles.title}>
          {t.rich('title', { br: () => <br className={styles.lineBreak} /> })}
        </h1>
        <div className={styles.body}>
          <p>{t('intro1')}</p>
          <p>{t('intro2')}</p>
        </div>
      </div>
      {aboutPhoto ? (
        <div className={styles.photo}>
          {/* Первый экран — грузим сразу, без lazy. */}
          <ExportedImage
            src={aboutPhoto.src}
            alt={aboutPhoto.alt[locale]}
            fill
            sizes="(min-width: 1200px) 590px, (min-width: 768px) calc((100vw - 60px) * 364 / 708), calc(100vw - 20px)"
            loading="eager"
            fetchPriority="high"
            placeholder="empty"
            basePath={basePath}
            className={styles.image}
          />
        </div>
      ) : (
        // Фото нет: на desktop/tablet ячейка держит раскладку (текст на том же месте), на mobile скрыта.
        <div className={styles.photoSlot} aria-hidden />
      )}
    </section>
  );
}

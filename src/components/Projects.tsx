import { useLocale, useTranslations } from 'next-intl';

import { cases } from '@/content/cases';

import { ProjectCard } from './ProjectCard';
import styles from './Projects.module.css';

export function Projects() {
  const t = useTranslations('HomePage.projects');
  const locale = useLocale();

  return (
    <section id="works" className={styles.projects} aria-labelledby="works-title">
      <div className={styles.head}>
        <h2 id="works-title" className={styles.title}>
          {t('title')}
        </h2>
        <p className={styles.subtitle}>{t('subtitle')}</p>
      </div>

      <div className={styles.grid}>
        {cases.map((item) => (
          <ProjectCard key={item.slug} item={item} locale={locale} />
        ))}
        {/* С 2 колонок: в макете четвёртая ячейка — заглушка (на 1920 уходит во второй ряд). */}
        <p className={styles.whatsNext}>{t('whatsNext')}</p>
      </div>
    </section>
  );
}

import ExportedImage from 'next-image-export-optimizer';
import type { Locale } from 'next-intl';

import type { CaseMeta } from '@/content/cases';
import { Link } from '@/i18n/navigation';

import { BadgeRow } from './BadgeRow';
import styles from './ProjectCard.module.css';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

type ProjectCardProps = {
  item: CaseMeta;
  locale: Locale;
};

export function ProjectCard({ item, locale }: ProjectCardProps) {
  const alt = item.coverAlt[locale];

  return (
    <article className={styles.card}>
      <div className={styles.thumbnail}>
        <ExportedImage
          src={item.cover}
          alt={alt}
          sizes="(min-width: 1600px) 33vw, (min-width: 1100px) 50vw, (min-width: 768px) 728px, 100vw"
          basePath={basePath}
          className={styles.image}
        />
      </div>

      <div className={styles.description}>
        <BadgeRow items={item.badges[locale]} />
        <div className={styles.text}>
          <h3 className={styles.title}>
            {/* Ссылка растянута на всю карточку через ::after. */}
            <Link href={`/work/${item.slug}/`} className={styles.link}>
              {item.title[locale]}
            </Link>
          </h3>
          <p className={styles.summary}>{item.description[locale]}</p>
        </div>
      </div>
    </article>
  );
}

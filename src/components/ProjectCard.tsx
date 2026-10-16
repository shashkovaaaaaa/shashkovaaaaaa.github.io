import ExportedImage from 'next-image-export-optimizer';
import type { Locale } from 'next-intl';

import type { CaseMeta } from '@/content/cases';
import { Link } from '@/i18n/navigation';

import { Badge } from './Badge';
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
      {/* Две обложки: на mobile в макете свой квадратный кроп. Скрытая через CSS не грузится (lazy). */}
      <div className={styles.thumbnail}>
        <ExportedImage
          src={item.cover}
          alt={alt}
          sizes="(min-width: 1600px) 33vw, (min-width: 1100px) 50vw, (min-width: 768px) 728px, 1px"
          basePath={basePath}
          className={`${styles.image} ${styles.imageDesktop}`}
        />
        <ExportedImage
          src={item.coverMobile}
          alt={alt}
          sizes="(max-width: 767px) calc(100vw - 20px), 1px"
          basePath={basePath}
          className={`${styles.image} ${styles.imageMobile}`}
        />
      </div>

      <div className={styles.description}>
        <ul className={styles.badges}>
          {item.badges[locale].map((badge) => (
            <li key={badge}>
              <Badge>{badge}</Badge>
            </li>
          ))}
        </ul>
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

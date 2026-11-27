import ExportedImage from 'next-image-export-optimizer';
import type { Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import { getAdjacentCases, type CaseMeta } from '@/content/cases';
import { Link } from '@/i18n/navigation';

import { BadgeRow } from './BadgeRow';
import { ButtonLink } from './Button';
import { IconArrowLeft, IconArrowRight } from './icons';
import styles from './CaseNav.module.css';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

/*
 * Figma → cases navigation (внизу каждого кейса, перед CTA).
 * desktop/tablet: две колонки через 40 — «Предыдущий кейс» слева, «Следующий кейс» справа,
 *   под кнопкой (через 10) карточка; на desktop превью и текст в ряд, на tablet — друг под другом.
 * mobile: обе кнопки в одну строку, под ними — только карточка следующего кейса.
 */
export async function CaseNav({ slug, locale }: { slug: string; locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'CaseNav' });
  const { prev, next } = getAdjacentCases(slug);

  return (
    <nav className={styles.nav} aria-label={t('label')}>
      <ButtonLink variant="outline" href={`/work/${prev.slug}/`} className={styles.prevButton}>
        <IconArrowLeft className={styles.icon} />
        {t('prev')}
      </ButtonLink>
      <ButtonLink variant="outline" href={`/work/${next.slug}/`} className={styles.nextButton}>
        {t('next')}
        <IconArrowRight className={styles.icon} />
      </ButtonLink>
      <NavCard item={prev} locale={locale} className={styles.prevCard} />
      <NavCard item={next} locale={locale} className={styles.nextCard} />
    </nav>
  );
}

function NavCard({
  item,
  locale,
  className,
}: {
  item: CaseMeta;
  locale: Locale;
  className: string;
}) {
  return (
    <article className={`${styles.card} ${className}`}>
      <div className={styles.thumbnail}>
        <ExportedImage
          src={item.cover}
          alt={item.coverAlt[locale]}
          sizes="(min-width: 1100px) 300px, (min-width: 768px) 50vw, 100vw"
          basePath={basePath}
          className={styles.image}
        />
      </div>
      <div className={styles.description}>
        <BadgeRow items={item.navBadges[locale]} />
        <div className={styles.text}>
          <p className={styles.title}>
            {/* Ссылка растянута на всю карточку через ::after. */}
            <Link href={`/work/${item.slug}/`} className={styles.link}>
              {item.title[locale]}
            </Link>
          </p>
          <p className={styles.summary}>{item.description[locale]}</p>
        </div>
      </div>
    </article>
  );
}

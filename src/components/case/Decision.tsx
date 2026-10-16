import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

import { BadgeList } from './BadgeList';
import shared from './case.module.css';
import { CaseImage } from './CaseImage';
import styles from './Decision.module.css';

type DecisionProps = {
  // Номер решения — подпись «Decision N.». Без него — просто «текст + картинка» (Askezio: Approach, Reflection).
  index?: number;
  title: string;
  image: string;
  alt: string;
  // Факты бейджами столбиком под текстом (Askezio → Approach).
  facts?: string[];
  children: ReactNode;
};

// decision-N / approach / reflection: текст слева, картинка 590×590 справа; на tablet/mobile — столбиком.
export function Decision({ index, title, image, alt, facts, children }: DecisionProps) {
  const t = useTranslations('Case');

  return (
    <section className={`${styles.decision} ${index ? '' : styles.plain}`}>
      <div className={styles.text}>
        {index ? (
          <hgroup className={styles.head}>
            <p className={styles.label}>{t('decision', { index })}</p>
            <h2 className={styles.title}>{title}</h2>
          </hgroup>
        ) : (
          <h2 className={styles.title}>{title}</h2>
        )}
        <div className={shared.prose}>{children}</div>
        {facts && <BadgeList items={facts} direction="column" />}
      </div>
      <CaseImage
        src={image}
        alt={alt}
        className={styles.image}
        sizes="(min-width: 1200px) 590px, (min-width: 768px) calc(100vw - 40px), calc(100vw - 20px)"
      />
    </section>
  );
}

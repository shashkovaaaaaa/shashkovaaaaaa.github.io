import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

import shared from './case.module.css';
import { CaseImage } from './CaseImage';
import styles from './Decision.module.css';

type DecisionProps = {
  index: number;
  title: string;
  image: string;
  alt: string;
  children: ReactNode;
};

// decision-N: текст слева, картинка 590×590 справа; на tablet/mobile — столбиком.
export function Decision({ index, title, image, alt, children }: DecisionProps) {
  const t = useTranslations('Case');

  return (
    <section className={styles.decision}>
      <div className={styles.text}>
        <hgroup className={styles.head}>
          <p className={styles.label}>{t('decision', { index })}</p>
          <h2 className={styles.title}>{title}</h2>
        </hgroup>
        <div className={shared.prose}>{children}</div>
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

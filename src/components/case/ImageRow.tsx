import { useTranslations } from 'next-intl';
import type { CSSProperties } from 'react';

import { CaseImage } from './CaseImage';
import styles from './ImageRow.module.css';

type ImageRowProps = {
  images: { src: string; alt: string }[];
};

// images group: 2–3 квадратные картинки в ряд; на mobile — горизонтальная лента по 320px.
export function ImageRow({ images }: ImageRowProps) {
  const t = useTranslations('Case');
  const count = images.length;

  return (
    // tabIndex + region: ленту на mobile можно прокрутить с клавиатуры.
    <div
      className={styles.row}
      style={{ '--count': count } as CSSProperties}
      role="region"
      aria-label={t('images')}
      tabIndex={0}
    >
      {images.map(({ src, alt }) => (
        <CaseImage
          key={src}
          src={src}
          alt={alt}
          className={styles.item}
          sizes={`(min-width: 1200px) ${Math.round(1200 / count)}px, (min-width: 768px) calc((100vw - 40px) / ${count}), 320px`}
        />
      ))}
    </div>
  );
}

import { useTranslations } from 'next-intl';
import type { CSSProperties } from 'react';

import { CaseImage } from './CaseImage';
import styles from './ImageRow.module.css';

export type CaseImageItem = { src: string; alt: string };

type ImageRowProps = {
  images: CaseImageItem[];
  // Пропорция картинок на desktop/tablet: '1' (квадраты), '2 / 1', '12 / 7' …
  ratio?: string;
  // Свой набор для mobile (в макете Prokladovki на mobile другие кропы и даже количество).
  mobileImages?: CaseImageItem[];
  mobileRatio?: string;
};

/*
 * images group / image: 1–3 картинки в ряд (radius 8, gap 16).
 * mobile: 3 и больше — горизонтальная лента по 320 (Supply Leader), меньше — столбиком (Askezio).
 */
export function ImageRow({ images, ratio = '1', mobileImages, mobileRatio = '1' }: ImageRowProps) {
  const t = useTranslations('Case');
  const count = images.length;
  const desktopSizes = `(min-width: 1200px) ${Math.round(1200 / count)}px, (min-width: 768px) calc((100vw - 40px) / ${count})`;

  if (mobileImages) {
    return (
      <div className={styles.wrapper}>
        <Group
          images={images}
          ratio={ratio}
          className={`${styles.row} ${styles.desktopOnly}`}
          sizes={`${desktopSizes}, 1px`}
        />
        <Group
          images={mobileImages}
          ratio={mobileRatio}
          className={`${styles.row} ${styles.mobileOnly}`}
          sizes="(max-width: 767px) calc(100vw - 20px), 1px"
        />
      </div>
    );
  }

  const carousel = count >= 3;
  return (
    <Group
      images={images}
      ratio={ratio}
      className={`${styles.row} ${carousel ? styles.carousel : ''}`}
      sizes={`${desktopSizes}, ${carousel ? '320px' : 'calc(100vw - 20px)'}`}
      // Ленту на mobile можно прокрутить с клавиатуры.
      regionLabel={carousel ? t('images') : undefined}
    />
  );
}

type GroupProps = {
  images: CaseImageItem[];
  ratio: string;
  className: string;
  sizes: string;
  regionLabel?: string;
};

function Group({ images, ratio, className, sizes, regionLabel }: GroupProps) {
  return (
    <div
      className={className}
      style={{ '--count': images.length } as CSSProperties}
      {...(regionLabel ? { role: 'region', 'aria-label': regionLabel, tabIndex: 0 } : {})}
    >
      {images.map(({ src, alt }) => (
        <CaseImage
          key={src}
          src={src}
          alt={alt}
          ratio={ratio}
          className={styles.item}
          sizes={sizes}
        />
      ))}
    </div>
  );
}

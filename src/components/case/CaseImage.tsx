import ExportedImage from 'next-image-export-optimizer';

import { basePath } from '@/config/site';

import styles from './CaseImage.module.css';

export type CaseImageProps = {
  // Путь внутри public/images/cases, например `supply-leader/hero.webp`.
  src: string;
  alt: string;
  // CSS aspect-ratio контейнера: '2 / 1', '1', …
  ratio?: string;
  sizes: string;
  className?: string;
  // Первый экран кейса: грузить сразу и с высоким приоритетом (LCP), а не лениво.
  eager?: boolean;
};

// Картинка кейса: контейнер с пропорцией и radius 8, сама картинка — cover (как `fill` в Figma).
export function CaseImage({ src, alt, ratio = '1', sizes, className, eager }: CaseImageProps) {
  return (
    <div
      className={[styles.frame, className].filter(Boolean).join(' ')}
      style={{ aspectRatio: ratio }}
    >
      <ExportedImage
        src={`/images/cases/${src}`}
        alt={alt}
        fill
        sizes={sizes}
        loading={eager ? 'eager' : 'lazy'}
        fetchPriority={eager ? 'high' : undefined}
        basePath={basePath}
        className={styles.image}
      />
    </div>
  );
}

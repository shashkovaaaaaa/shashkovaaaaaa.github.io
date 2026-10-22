import type { StaticImageData } from 'next/image';
import type { Locale } from 'next-intl';

import photo from '@/assets/images/about/photo.webp';

type Localized<T> = Record<Locale, T>;

export type AboutPhoto = {
  src: StaticImageData;
  alt: Localized<string>;
};

// Фото во вступлении About (design/pages/work-about-*.md → image: 590 / 364 / 370, radius 8).
// null — фото нет: на desktop/tablet место зарезервировано пустой ячейкой, на mobile блока нет.
// Фото от владельца: 640×640 (меньше 2× слота 1180 — не апскейлим), без метаданных.
export const aboutPhoto: AboutPhoto | null = {
  src: photo,
  alt: { en: 'Anastasiia Shashkova', ru: 'Анастасия Шашкова' },
};

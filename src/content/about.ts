import type { StaticImageData } from 'next/image';
import type { Locale } from 'next-intl';

type Localized<T> = Record<Locale, T>;

export type AboutPhoto = {
  src: StaticImageData;
  alt: Localized<string>;
};

// Фото во вступлении About (design/pages/work-about-*.md → image: 590 / 364 / 370, radius 8).
// null — фото нет: на desktop/tablet место зарезервировано пустой ячейкой, на mobile блока нет.
// Фото убрано по просьбе владельца: место держит пустая ячейка, позже сюда встанет видео-анимация.
export const aboutPhoto: AboutPhoto | null = null;

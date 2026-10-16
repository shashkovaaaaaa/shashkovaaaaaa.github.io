import type { StaticImageData } from 'next/image';
import type { Locale } from 'next-intl';

import askezioCover from '../../public/images/cases/askezio/cover.webp';
import askezioCoverMobile from '../../public/images/cases/askezio/cover-mobile.webp';
import prokladovkiCover from '../../public/images/cases/prokladovki/cover.webp';
import prokladovkiCoverMobile from '../../public/images/cases/prokladovki/cover-mobile.webp';
import supplyLeaderCover from '../../public/images/cases/supply-leader/cover.webp';
import supplyLeaderCoverMobile from '../../public/images/cases/supply-leader/cover-mobile.webp';

type Localized<T> = Record<Locale, T>;

export type CaseMeta = {
  slug: string;
  // Есть страница кейса (content/cases/<slug>/<locale>.mdx). Остальные карточки пока ведут на 404.
  published?: boolean;
  // Open Graph: public/og/<slug>.jpg, 1200×630 (scripts/prepare-images.mjs).
  ogImage?: string;
  // Отступ между секциями кейса на tablet/desktop: 60 (по умолчанию) или 100 (Prokladovki).
  sectionGap?: 'default' | 'loose';
  // desktop/tablet — 5:4, mobile — 1:1 (в макете разные кропы).
  cover: StaticImageData;
  coverMobile: StaticImageData;
  coverAlt: Localized<string>;
  badges: Localized<string[]>;
  title: Localized<string>;
  description: Localized<string>;
};

// TODO: бейджи в макете у всех карточек одинаковые (похоже на тексты мастер-компонента) — уточнить у дизайнера.
const defaultBadges: Localized<string[]> = {
  en: ['Case Study', 'B2B', 'SaaS', 'Redesign'],
  ru: ['Кейс', 'B2B', 'SaaS', 'Редизайн'],
};

// Порядок — как на главной в макете. RU — черновой перевод, TODO: вычитка.
export const cases: CaseMeta[] = [
  {
    slug: 'prokladovki',
    published: true,
    ogImage: '/og/prokladovki.jpg',
    sectionGap: 'loose',
    cover: prokladovkiCover,
    coverMobile: prokladovkiCoverMobile,
    coverAlt: {
      en: 'Host onboarding screens: passport upload and company TIN lookup',
      ru: 'Экраны онбординга хоста: загрузка паспорта и поиск компании по ИНН',
    },
    badges: defaultBadges,
    title: {
      en: 'Redesigning Host Onboarding for a Self-Storage Marketplace',
      ru: 'Редизайн онбординга хостов для маркетплейса self-storage',
    },
    description: {
      en: 'I rethought the host onboarding experience, turning a complex manual process into a scalable self-service flow – from verification to publishing the first storage listing',
      ru: 'Переосмыслила онбординг хостов и превратила сложный ручной процесс в масштабируемый self-service — от верификации до публикации первого склада',
    },
  },
  {
    slug: 'askezio',
    published: true,
    ogImage: '/og/askezio.jpg',
    cover: askezioCover,
    coverMobile: askezioCoverMobile,
    coverAlt: {
      en: 'Askezio quiz and test builder interface',
      ru: 'Интерфейс конструктора квизов и тестов Askezio',
    },
    badges: defaultBadges,
    title: {
      en: 'Quiz and Test-builder from MVP to release',
      ru: 'Конструктор квизов и тестов: от MVP до релиза',
    },
    description: {
      en: 'A product-minded founder found me through a test assignment and, within weeks, turned it into a long-term collaboration',
      ru: 'Фаундер с продуктовым мышлением нашёл меня через тестовое задание, и за несколько недель оно переросло в долгое сотрудничество',
    },
  },
  {
    slug: 'supply-leader',
    published: true,
    ogImage: '/og/supply-leader.jpg',
    cover: supplyLeaderCover,
    coverMobile: supplyLeaderCoverMobile,
    coverAlt: {
      en: 'Supply Leader product catalog with price history charts',
      ru: 'Каталог товаров Supply Leader с графиками истории цен',
    },
    badges: defaultBadges,
    title: {
      en: 'Marketplace for suppliers from Amazon and Walmart',
      ru: 'Маркетплейс поставщиков Amazon и Walmart',
    },
    description: {
      en: 'I was initially brought on to refresh the visual layer – make it feel more modern and «European». But as I explored the product, it became clear the outdated UI was hiding much deeper UX issues',
      ru: 'Сначала меня позвали освежить визуал — сделать его современнее и «европейнее». Но чем глубже я погружалась в продукт, тем яснее становилось: устаревший UI скрывал куда более серьёзные UX-проблемы',
    },
  },
];

export const publishedCases = cases.filter((c) => c.published);

export function getCase(slug: string) {
  return cases.find((c) => c.slug === slug);
}

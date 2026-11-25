import type { StaticImageData } from 'next/image';
import type { Locale } from 'next-intl';

import askezioLogo from '@/assets/images/experience/askezio.webp';
import freelanceLogo from '@/assets/images/experience/freelance.webp';
import prokladovkiLogo from '@/assets/images/experience/prokladovki.webp';
import reklaLogo from '@/assets/images/experience/rekla.webp';
import { typographDeep } from '@/lib/typograph.mjs';

type Localized<T> = Record<Locale, T>;

export type ExperienceItem = {
  id: string;
  company: Localized<string>;
  position: Localized<string>;
  period: string;
  // Плитка 48×48: логотип (96×96, 2×) или, если его нет, первая буква.
  logo?: StaticImageData;
  letter: string;
  achievements: Localized<string[]>;
};

// design/pages/work-about-*.md → experience block: порядок и периоды — как в макете.
// Тексты — дословно из design/about-texts.md (из резюме public/resume-{en,ru}.pdf), вычитка не нужна.
// Названия компаний на RU — как в русском резюме (на английском), кроме «Фриланс».
export const experience: ExperienceItem[] = typographDeep([
  {
    id: 'askezio',
    company: {
      en: 'Askezio: Test Creation Platform',
      ru: 'Askezio: Test Creation Platform',
    },
    position: { en: 'Product Designer', ru: 'Продуктовый дизайнер' },
    period: '2025–26',
    logo: askezioLogo,
    letter: 'A',
    achievements: {
      en: [
        'Designed user flows and interfaces for a B2B SaaS product, from information architecture and logic to prototypes and final UI designs.',
        'Redesigned a key user journey and simplified the login experience. Designed and delivered 65+ screens in 3 months.',
        'Conducted market and competitor research, contributing to product concepts and feature development.',
        'Designed and implemented 6 new question types, expanding user scenarios and product capabilities.',
        'Designed new features, including AI-powered tools, and integrated them into the existing product logic.',
        'Collaborated closely with developers, accounting for technical constraints, preparing dev handoff, and conducting design reviews.',
      ],
      ru: [
        'Проектировала пользовательские сценарии и интерфейсы B2B SaaS-продукта: от логики и структуры до прототипов и финальных макетов.',
        'Переработала ключевой пользовательский путь и упростила вход в систему. За 3 месяца спроектировала и внедрила 65+ экранов.',
        'Исследовала рынок и конкурентов, участвовала в поиске концепций и развитии функциональности продукта.',
        'Спроектировала и внедрила 6 новых типов вопросов, расширив пользовательские сценарии и возможности сервиса.',
        'Проектировала новые функции, включая AI-инструменты, и интегрировала их в существующую логику продукта.',
        'Работала с разработчиками: учитывала технические ограничения, готовила dev handoff и проводила дизайн-ревью.',
      ],
    },
  },
  {
    id: 'prokladovki',
    company: { en: 'Pro-Kladovki Service', ru: 'Pro-Kladovki Service' },
    position: { en: 'Product Designer', ru: 'Продуктовый дизайнер' },
    // TODO: в макете 2024–2026, в резюме 2025–2026 — оставлен макет (DESIGN-QUESTIONS.md, 38).
    period: '2024–26',
    logo: prokladovkiLogo,
    letter: 'P',
    achievements: {
      en: [
        'Designed a self-storage search and booking service from scratch, from information architecture and user flows to final UI.',
        'Designed the website and user account experience for desktop, tablet, and mobile.',
        'Maintained and evolved the product’s visual identity, ensuring consistency across interfaces.',
        'Adapted the design to regulatory changes and product constraints.',
        'Took the product from concept and design through launch and first sales.',
      ],
      ru: [
        'Спроектировала сервис поиска и бронирования кладовок с нуля — от структуры и пользовательских сценариев до финального UI.',
        'Разработала сайт и личный кабинет пользователя для desktop, tablet и mobile.',
        'Поддерживала и развивала фирменный стиль продукта, обеспечивая визуальную целостность интерфейсов.',
        'Адаптировала дизайн под изменения законодательства и продуктовые ограничения.',
        'Довела продукт от концепции и дизайна до запуска и первых продаж.',
      ],
    },
  },
  {
    id: 'rekla',
    company: {
      en: 'Rekla: Telegram Autoposting Service',
      ru: 'Rekla: Telegram Autoposting Service',
    },
    position: { en: 'Product Designer', ru: 'Продуктовый дизайнер' },
    period: '2023–24',
    logo: reklaLogo,
    letter: 'R',
    achievements: {
      en: [
        'Developed a B2B SaaS product for Telegram automation, designing new features and user flows.',
        'Evolved the design system and component library, maintaining a consistent visual language across the product.',
        'Quickly adapted interfaces to changes and limitations in Telegram while keeping interactions clear and intuitive.',
        'Collaborated with developers on handoff, implementation details, and design reviews.',
        'Worked with the team to launch 5 new features and designed 50 unique product pages.',
      ],
      ru: [
        'Развивала B2B SaaS-продукт для автоматизации работы с Telegram: проектировала новые функции и пользовательские сценарии.',
        'Развивала дизайн-систему и компонентную библиотеку, поддерживая единый визуальный язык продукта.',
        'Быстро адаптировала интерфейсы под изменения и ограничения Telegram, сохраняя понятную логику взаимодействия.',
        'Работала с разработчиками: готовила макеты к передаче, уточняла детали реализации и проводила дизайн-ревью.',
        'Совместно с командой внедрила 5 новых фич и спроектировала 50 уникальных страниц.',
      ],
    },
  },
  {
    id: 'freelance',
    // В макете опечатка «Freelace» (tablet/desktop).
    company: { en: 'Freelance', ru: 'Фриланс' },
    // На mobile в макете «Product, UX/UI designer» — берём текст из резюме, как на tablet/desktop.
    position: { en: 'Product and UX/UI designer', ru: 'Продуктовый и UX/UI дизайнер' },
    period: '2022–26',
    logo: freelanceLogo,
    letter: 'F',
    achievements: {
      en: [
        'Worked on 40+ digital products, including B2B SaaS, web services, mobile apps, landing pages, and Telegram Apps.',
        'Independently managed projects and client communication, from defining requirements to design handoff.',
        'Delivered 100% of projects on time, with 14 reviews averaging 5.0.',
        '18 of 38 clients returned with additional projects, resulting in a 47% repeat-client rate.',
      ],
      ru: [
        'Работала над 40+ digital-продуктами: B2B SaaS, веб-сервисами, мобильными приложениями, лендингами и Telegram Apps.',
        'Самостоятельно вела проекты и коммуникацию с заказчиками — от постановки задачи до передачи дизайна в разработку.',
        '100% проектов завершены в срок; 14 отзывов со средней оценкой 5.0.',
        '18 из 38 клиентов вернулись с повторными задачами — 47% повторных обращений.',
      ],
    },
  },
]);

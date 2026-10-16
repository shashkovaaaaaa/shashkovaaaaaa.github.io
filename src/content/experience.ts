import type { Locale } from 'next-intl';

type Localized<T> = Record<Locale, T>;

export type ExperienceItem = {
  id: string;
  company: Localized<string>;
  position: Localized<string>;
  period: string;
  // Плитка логотипа: SVG логотипов от дизайнера пока нет — показываем первую букву.
  letter: string;
  achievements: Localized<string[]>;
};

// TODO: тексты достижений есть только у Askezio — остальные ждём от дизайнера.
const todo: Localized<string[]> = {
  en: ['TODO: achievements'],
  ru: ['TODO: достижения'],
};

// design/pages/about-desktop.md → experience block. RU — черновой перевод, TODO: вычитка.
export const experience: ExperienceItem[] = [
  {
    id: 'askezio',
    company: {
      en: 'Askezio: Test Creation Platform',
      ru: 'Askezio: платформа для создания тестов',
    },
    position: { en: 'Product Designer', ru: 'Продуктовый дизайнер' },
    period: '2025–2026',
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
        'Проектировала пользовательские сценарии и интерфейсы B2B SaaS-продукта — от информационной архитектуры и логики до прототипов и финального UI.',
        'Переработала ключевой пользовательский путь и упростила вход в продукт. Спроектировала и сдала 65+ экранов за 3 месяца.',
        'Провела исследование рынка и конкурентов, участвовала в формировании концепции продукта и развитии функций.',
        'Спроектировала и внедрила 6 новых типов вопросов, расширив пользовательские сценарии и возможности продукта.',
        'Спроектировала новые функции, включая инструменты на базе ИИ, и встроила их в существующую логику продукта.',
        'Тесно работала с разработчиками: учитывала технические ограничения, готовила передачу в разработку и проводила дизайн-ревью.',
      ],
    },
  },
  {
    id: 'prokladovki',
    company: { en: 'Pro-Kladovki Service', ru: 'Сервис Pro-Kladovki' },
    position: { en: 'Product Designer', ru: 'Продуктовый дизайнер' },
    period: '2024–2026',
    letter: 'P',
    achievements: todo,
  },
  {
    id: 'rekla',
    company: {
      en: 'Rekla: Telegram Autoposting Service',
      ru: 'Rekla: сервис автопостинга в Telegram',
    },
    position: { en: 'Product Designer', ru: 'Продуктовый дизайнер' },
    period: '2023–2024',
    letter: 'R',
    achievements: todo,
  },
  {
    id: 'freelance',
    // В макете опечатка «Freelace».
    company: { en: 'Freelance', ru: 'Фриланс' },
    position: { en: 'Product and UX/UI designer', ru: 'Продуктовый и UX/UI-дизайнер' },
    period: '2022–2026',
    letter: 'F',
    achievements: todo,
  },
];

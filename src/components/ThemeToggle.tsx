'use client';

import { useTranslations } from 'next-intl';

import buttonStyles from './Button.module.css';
import styles from './Switcher.module.css';
import { useTheme } from './theme/ThemeProvider';
import { THEMES, type Theme as ThemeName } from './theme/themeStore';

type ThemeToggleProps = {
  // icon — одна кнопка, перебирает темы по кругу (десктопный хедер);
  // segmented — три кнопки (мобильное меню).
  variant?: 'icon' | 'segmented';
};

export function ThemeToggle({ variant = 'segmented' }: ThemeToggleProps) {
  const t = useTranslations('ThemeToggle');
  // theme === undefined до гидратации: активное состояние ещё не показываем.
  const { theme, setTheme } = useTheme();
  const current: ThemeName = theme ?? 'system';

  if (variant === 'icon') {
    const next = THEMES[(THEMES.indexOf(current) + 1) % THEMES.length];
    const label = theme ? t('switchTo', { current: t(current) }) : t('label');

    return (
      <button
        type="button"
        className={`${buttonStyles.button} ${buttonStyles.link} ${styles.iconButton}`}
        aria-label={label}
        title={label}
        onClick={() => setTheme(next)}
      >
        <ThemeIcon theme={current} />
      </button>
    );
  }

  return (
    <div className={styles.group} role="group" aria-label={t('label')}>
      {THEMES.map((value) => (
        <button
          key={value}
          type="button"
          className={styles.item}
          aria-pressed={theme === value}
          onClick={() => setTheme(value)}
        >
          {t(value)}
        </button>
      ))}
    </div>
  );
}

function ThemeIcon({ theme }: { theme: ThemeName }) {
  const common = {
    width: 20,
    height: 20,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.5,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  } as const;

  if (theme === 'light') {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
      </svg>
    );
  }

  if (theme === 'dark') {
    return (
      <svg {...common}>
        <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M8 20h8M12 16v4" />
    </svg>
  );
}

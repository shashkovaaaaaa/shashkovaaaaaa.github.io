'use client';

import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { useSyncExternalStore } from 'react';

import styles from './Switcher.module.css';

const THEMES = ['light', 'dark', 'system'] as const;

const noopSubscribe = () => () => {};

// true только на клиенте: до гидратации тема неизвестна, активную кнопку не подсвечиваем.
function useIsClient() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

export function ThemeToggle() {
  const t = useTranslations('ThemeToggle');
  const { theme, setTheme } = useTheme();
  const isClient = useIsClient();

  return (
    <div className={styles.group} role="group" aria-label={t('label')}>
      {THEMES.map((value) => (
        <button
          key={value}
          type="button"
          className={styles.item}
          aria-pressed={isClient && theme === value}
          onClick={() => setTheme(value)}
        >
          {t(value)}
        </button>
      ))}
    </div>
  );
}

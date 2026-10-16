'use client';

import { useTranslations } from 'next-intl';

import { IconMoon, IconSun } from './icons';
import { Switch } from './Switch';
import { useTheme } from './theme/ThemeProvider';

// Переключатель темы (design/components.md → switch type=icon): только Light / Dark.
// Пока пользователь не выбрал сам, подсвечена системная тема.
export function ThemeToggle() {
  const t = useTranslations('ThemeToggle');
  const { theme, setTheme } = useTheme();

  return (
    <Switch
      variant="icon"
      label={t('label')}
      value={theme}
      onChange={setTheme}
      options={[
        { value: 'light', label: t('light'), content: <IconSun /> },
        { value: 'dark', label: t('dark'), content: <IconMoon /> },
      ]}
    />
  );
}

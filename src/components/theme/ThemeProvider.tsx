'use client';

import {
  createContext,
  use,
  useCallback,
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from 'react';

import {
  readStoredTheme,
  readSystemDark,
  resolveTheme,
  subscribeStoredTheme,
  subscribeSystemDark,
  writeStoredTheme,
  type ResolvedTheme,
  type Theme,
} from './themeStore';
import { ThemeScript } from './ThemeScript';

type ThemeContextValue = {
  // undefined на сервере и при гидратации — выбранная тема известна только в браузере.
  theme: Theme | undefined;
  resolvedTheme: ResolvedTheme | undefined;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

// Отключает transition на время смены темы, чтобы цвета не «переливались».
function withoutTransitions(apply: () => void) {
  const style = document.createElement('style');
  style.textContent = '*,*::before,*::after{transition:none!important}';
  document.head.appendChild(style);
  apply();
  // Принудительный reflow, затем возвращаем transition.
  void getComputedStyle(document.body).opacity;
  requestAnimationFrame(() => style.remove());
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(subscribeStoredTheme, readStoredTheme, () => undefined);
  const systemDark = useSyncExternalStore(subscribeSystemDark, readSystemDark, () => undefined);
  const resolvedTheme =
    theme === undefined || systemDark === undefined ? undefined : resolveTheme(theme, systemDark);

  useEffect(() => {
    if (!resolvedTheme) return;
    const root = document.documentElement;
    if (root.getAttribute('data-theme') === resolvedTheme) return;
    withoutTransitions(() => root.setAttribute('data-theme', resolvedTheme));
  }, [resolvedTheme]);

  const setTheme = useCallback((next: Theme) => writeStoredTheme(next), []);

  return (
    <ThemeContext value={{ theme, resolvedTheme, setTheme }}>
      <ThemeScript />
      {children}
    </ThemeContext>
  );
}

export function useTheme() {
  const value = use(ThemeContext);
  if (!value) throw new Error('useTheme должен вызываться внутри <ThemeProvider>');
  return value;
}

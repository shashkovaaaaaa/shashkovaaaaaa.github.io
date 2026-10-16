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
  type Theme,
} from './themeStore';
import { ThemeScript } from './ThemeScript';

type ThemeContextValue = {
  // Действующая тема: выбранная пользователем или системная.
  // undefined на сервере и при гидратации — тема известна только в браузере.
  theme: Theme | undefined;
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
  const stored = useSyncExternalStore(subscribeStoredTheme, readStoredTheme, () => undefined);
  const systemDark = useSyncExternalStore(subscribeSystemDark, readSystemDark, () => undefined);
  const theme =
    stored === undefined || systemDark === undefined ? undefined : resolveTheme(stored, systemDark);

  useEffect(() => {
    if (!theme) return;
    const root = document.documentElement;
    if (root.getAttribute('data-theme') === theme) return;
    withoutTransitions(() => root.setAttribute('data-theme', theme));
  }, [theme]);

  const setTheme = useCallback((next: Theme) => writeStoredTheme(next), []);

  return (
    <ThemeContext value={{ theme, setTheme }}>
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

// Внешнее хранилище темы: localStorage + системная схема. Читается через useSyncExternalStore.

export const THEMES = ['light', 'dark', 'system'] as const;
export type Theme = (typeof THEMES)[number];
export type ResolvedTheme = Exclude<Theme, 'system'>;

export const STORAGE_KEY = 'theme';
const CHANGE_EVENT = 'themechange';
const DARK_QUERY = '(prefers-color-scheme: dark)';

export function isTheme(value: unknown): value is Theme {
  return THEMES.some((t) => t === value);
}

export function readStoredTheme(): Theme {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return isTheme(value) ? value : 'system';
  } catch {
    return 'system';
  }
}

export function writeStoredTheme(theme: Theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Приватный режим и т.п. — тема просто не сохранится.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

// Изменения из этой вкладки (CHANGE_EVENT) и из других (storage).
export function subscribeStoredTheme(callback: () => void) {
  const onStorage = (e: StorageEvent) => e.key === STORAGE_KEY && callback();
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener('storage', onStorage);
  };
}

export function readSystemDark() {
  return window.matchMedia(DARK_QUERY).matches;
}

export function subscribeSystemDark(callback: () => void) {
  const mql = window.matchMedia(DARK_QUERY);
  mql.addEventListener('change', callback);
  return () => mql.removeEventListener('change', callback);
}

export function resolveTheme(theme: Theme, systemDark: boolean): ResolvedTheme {
  if (theme !== 'system') return theme;
  return systemDark ? 'dark' : 'light';
}

// Тот же алгоритм, что и выше, но строкой: выполняется до отрисовки, чтобы не было мигания.
export const themeInitScript = `(function(){try{var t=localStorage.getItem(${JSON.stringify(
  STORAGE_KEY,
)});if(t!=="light"&&t!=="dark")t=matchMedia(${JSON.stringify(
  DARK_QUERY,
)}).matches?"dark":"light";document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;

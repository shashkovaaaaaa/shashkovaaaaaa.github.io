// Внешнее хранилище темы: localStorage + системная схема. Читается через useSyncExternalStore.

// В v2 только светлая и тёмная. Пока пользователь не выбрал сам — берём системную.
export const THEMES = ['light', 'dark'] as const;
export type Theme = (typeof THEMES)[number];

// Тёмная тема пока выключена: всем показываем светлую (видео на сайте будут под светлую),
// переключателя в интерфейсе нет. Токены тёмной темы и вся логика остаются — чтобы вернуть
// выбор по системе и сохранённый выбор пользователя, достаточно поставить true
// (и вернуть <ThemeToggle /> в Header и MobileMenu).
export const DARK_THEME_ENABLED = false;

export const STORAGE_KEY = 'theme';
const CHANGE_EVENT = 'themechange';
const DARK_QUERY = '(prefers-color-scheme: dark)';

export function isTheme(value: unknown): value is Theme {
  return THEMES.some((t) => t === value);
}

// null — выбора нет (или старое значение 'system' из v1): тема по системе.
export function readStoredTheme(): Theme | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return isTheme(value) ? value : null;
  } catch {
    return null;
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

export function resolveTheme(stored: Theme | null, systemDark: boolean): Theme {
  if (!DARK_THEME_ENABLED) return 'light';
  return stored ?? (systemDark ? 'dark' : 'light');
}

// Тот же алгоритм, что и выше, но строкой: выполняется до отрисовки, чтобы не было мигания.
export const themeInitScript = !DARK_THEME_ENABLED
  ? `document.documentElement.setAttribute("data-theme","light")`
  : `(function(){try{var t=localStorage.getItem(${JSON.stringify(
      STORAGE_KEY,
    )});if(t!=="light"&&t!=="dark")t=matchMedia(${JSON.stringify(
      DARK_QUERY,
    )}).matches?"dark":"light";document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;

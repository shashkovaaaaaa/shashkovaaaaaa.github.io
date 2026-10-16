import { expect, type Page } from '@playwright/test';

export type ThemeName = 'light' | 'dark' | 'system';

// TODO: убрать, когда появятся эти кейсы. Next prefetch-ит ссылки карточек
// на ещё не готовые /work/<slug>/ и получает 404 — это ожидаемо.
const PENDING_ROUTES = /\/work\/(prokladovki|askezio)\//;

export function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on('console', (m) => {
    if (m.type() !== 'error' || PENDING_ROUTES.test(m.location().url)) return;
    errors.push(m.text());
  });
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('response', (r) => {
    if (r.status() >= 400 && !PENDING_ROUTES.test(r.url())) errors.push(`${r.status()} ${r.url()}`);
  });
  return errors;
}

export const menuToggle = (page: Page) =>
  page.getByRole('button', { name: /^(Open|Close) menu$|меню$/ });

// На 390/768 тема и язык — в мобильном меню, на 1280 — прямо в хедере.
export async function isMobileHeader(page: Page) {
  return menuToggle(page).isVisible();
}

export async function openMenuIfMobile(page: Page) {
  if (!(await isMobileHeader(page))) return;
  const toggle = menuToggle(page);
  if ((await toggle.getAttribute('aria-expanded')) !== 'true') await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
}

export async function setTheme(page: Page, theme: ThemeName) {
  if (await isMobileHeader(page)) {
    await openMenuIfMobile(page);
    const name = {
      light: /^(Light|Светлая)$/,
      dark: /^(Dark|Тёмная)$/,
      system: /^(System|Системная)$/,
    };
    await page.getByRole('button', { name: name[theme] }).click();
    return;
  }
  // Десктоп: одна кнопка перебирает темы по кругу.
  for (let i = 0; i < 3; i++) {
    if ((await page.evaluate(() => localStorage.getItem('theme'))) === theme) return;
    await page.getByRole('button', { name: /theme|тему/i }).click();
  }
  expect(await page.evaluate(() => localStorage.getItem('theme'))).toBe(theme);
}

export async function switchLocale(page: Page, name: 'English' | 'Русский') {
  await openMenuIfMobile(page);
  await page.getByRole('link', { name }).click();
}

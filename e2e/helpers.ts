import { expect, type Locator, type Page } from '@playwright/test';

export type ThemeName = 'light' | 'dark';

export function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`${m.text()} (${m.location().url})`);
  });
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('response', (r) => {
    if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`);
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

// Switch темы — radiogroup Light/Dark: на 1280 в хедере, на 390/768 — в мобильном меню.
export async function setTheme(page: Page, theme: ThemeName) {
  await openMenuIfMobile(page);
  const name = { light: /^(Light|Светлая)$/, dark: /^(Dark|Тёмная)$/ };
  const radio = page.getByRole('radio', { name: name[theme] });
  await radio.click();
  await expect(radio).toHaveAttribute('aria-checked', 'true');
}

// Свойства, от которых зависит вид текста: у пунктов одного меню они должны совпадать.
export const TEXT_STYLE_PROPS = [
  'font-family',
  'font-size',
  'font-weight',
  'line-height',
  'letter-spacing',
  'color',
  'opacity',
  'font-synthesis',
  '-webkit-font-smoothing',
  'text-rendering',
  'font-variation-settings',
] as const;

export async function textStyles(items: Locator) {
  return items.evaluateAll(
    (els, props) =>
      els.map((el) => {
        const cs = getComputedStyle(el);
        return Object.fromEntries(props.map((p) => [p, cs.getPropertyValue(p)]));
      }),
    [...TEXT_STYLE_PROPS],
  );
}

export async function switchLocale(page: Page, name: 'English' | 'Русский') {
  await openMenuIfMobile(page);
  await page.getByRole('link', { name }).click();
}

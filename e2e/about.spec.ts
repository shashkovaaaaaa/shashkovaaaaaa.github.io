import { expect, test } from '@playwright/test';

import { collectErrors, openMenuIfMobile, switchLocale } from './helpers';

test('About: заголовок, опыт, метаданные, нет ошибок', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto('/en/about/');

  await expect(page.locator('h1')).toHaveText(/^Hi, I’m Anastasiia/);
  await expect(page.getByRole('heading', { level: 2, name: 'Experience' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 3 })).toHaveText([
    'Askezio: Test Creation Platform',
    'Pro-Kladovki Service',
    'Rekla: Telegram Autoposting Service',
    'Freelance',
  ]);
  await expect(page).toHaveTitle(/^About me — /);
  await expect(page.locator('link[rel="alternate"][hreflang="ru"]')).toHaveAttribute(
    'href',
    /\/ru\/about\/$/,
  );
  await page.waitForLoadState('networkidle');
  expect(errors).toEqual([]);
});

test('About: аккордеон — первый раскрыт, aria-expanded/aria-controls, переключение', async ({
  page,
}) => {
  await page.goto('/en/about/');
  const toggles = page.getByRole('button', { name: 'Achievements' });
  await expect(toggles).toHaveCount(4);

  const first = toggles.first();
  await expect(first).toHaveAttribute('aria-expanded', 'true');
  const panel = page.locator(`#${await first.getAttribute('aria-controls')}`);
  await expect(panel.getByText(/65\+ screens in 3 months/)).toBeVisible();

  await first.click();
  await expect(first).toHaveAttribute('aria-expanded', 'false');
  await expect(panel.getByText(/65\+ screens in 3 months/)).toBeHidden();

  const second = toggles.nth(1);
  await expect(second).toHaveAttribute('aria-expanded', 'false');
  await second.click();
  await expect(second).toHaveAttribute('aria-expanded', 'true');
});

test('About: ссылка «About me» из хедера/меню и смена языка', async ({ page }) => {
  await page.goto('/en/');
  await openMenuIfMobile(page);
  await page.getByRole('link', { name: 'About me' }).click();
  await expect(page).toHaveURL('/en/about/');

  await switchLocale(page, 'Русский');
  await expect(page).toHaveURL('/ru/about/');
  await expect(page.locator('h1')).toHaveText(/^Привет, я Анастасия/);
});

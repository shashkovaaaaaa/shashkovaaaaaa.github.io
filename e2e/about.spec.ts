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

for (const [locale, label] of [
  ['en', 'Achievements'],
  ['ru', 'Достижения'],
] as const) {
  test(`About /${locale}/: достижения у всех компаний, без TODO, кнопка как в макете`, async ({
    page,
  }, testInfo) => {
    await page.goto(`/${locale}/about/`);
    const toggles = page.getByRole('button', { name: label });
    await expect(toggles).toHaveCount(4);
    const mobile = testInfo.project.name === 'mobile-390';

    for (const [index, toggle] of (await toggles.all()).entries()) {
      // mobile: 42×42, только шеврон (имя — из aria-label); tablet/desktop: текст + шеврон, 136×42.
      await expect(toggle).toHaveAttribute('aria-label', label);
      const box = await toggle.boundingBox();
      expect(box?.height).toBe(42);
      if (mobile) expect(box?.width).toBe(42);
      await expect(toggle.getByText(label)).toBeVisible({ visible: !mobile });

      // Название компании — в одну строку (22px) и не наезжает на шеврон.
      const company = page.locator('main h3').nth(index);
      expect((await company.boundingBox())?.height).toBe(22);
      const textRight = await company.evaluate((el) => {
        const range = document.createRange();
        range.selectNodeContents(el);
        return range.getBoundingClientRect().right;
      });
      const chevron = await toggle.locator('svg').boundingBox();
      expect(textRight).toBeLessThan(chevron!.x);

      if ((await toggle.getAttribute('aria-expanded')) !== 'true') await toggle.click();
      const panel = page.locator(`#${await toggle.getAttribute('aria-controls')}`);
      expect(await panel.locator('li').count()).toBeGreaterThanOrEqual(4);
    }
    await expect(page.locator('main')).not.toContainText('TODO');
  });
}

test('About: ссылка «About me» из хедера/меню и смена языка', async ({ page }) => {
  await page.goto('/en/');
  await openMenuIfMobile(page);
  await page.getByRole('link', { name: 'About me' }).click();
  await expect(page).toHaveURL('/en/about/');

  await switchLocale(page, 'Русский');
  await expect(page).toHaveURL('/ru/about/');
  await expect(page.locator('h1')).toHaveText(/^Привет, я Анастасия/);
});

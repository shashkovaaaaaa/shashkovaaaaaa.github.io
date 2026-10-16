import { expect, test, type Page } from '@playwright/test';

declare global {
  interface Window {
    __themeLog: { theme: string | null; h1InDom: boolean }[];
  }
}

function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('response', (r) => r.status() >= 400 && errors.push(`${r.status()} ${r.url()}`));
  return errors;
}

test.describe('редирект с /', () => {
  for (const [lang, expected] of [
    ['en-US', 'en'],
    ['ru-RU', 'ru'],
    ['de-DE', 'en'],
  ] as const) {
    test.describe(lang, () => {
      test.use({ locale: lang });

      test(`ведёт на /${expected}/`, async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveURL(`/${expected}/`);
      });
    });
  }

  test.describe('без JS', () => {
    test.use({ javaScriptEnabled: false });

    test('есть ссылки на обе локали', async ({ page }) => {
      await page.goto('/');
      const hrefs = await page
        .locator('a')
        .evaluateAll((as) => as.map((a) => a.getAttribute('href')));
      expect(hrefs).toEqual(expect.arrayContaining(['/en/', '/ru/']));
    });
  });
});

for (const [locale, title] of [
  ['en', 'Home page'],
  ['ru', 'Главная страница'],
] as const) {
  test(`/${locale}/: lang, заголовок, шрифт, нет ошибок`, async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto(`/${locale}/`);

    await expect(page.locator('html')).toHaveAttribute('lang', locale);
    await expect(page.locator('h1')).toHaveText(title);
    const font = await page.locator('body').evaluate((b) => getComputedStyle(b).fontFamily);
    expect(font).toMatch(/Inter/);
    expect(errors).toEqual([]);
  });
}

test.describe('тема', () => {
  test.use({ colorScheme: 'light' });

  test('переключается, сохраняется, не мигает при перезагрузке', async ({ page }) => {
    const errors = collectErrors(page);
    await page.addInitScript(() => {
      window.__themeLog = [];
      new MutationObserver((records) => {
        for (const r of records) {
          if (r.target !== document.documentElement) continue;
          window.__themeLog.push({
            theme: document.documentElement.getAttribute('data-theme'),
            h1InDom: !!document.querySelector('h1'),
          });
        }
      }).observe(document, { attributes: true, attributeFilter: ['data-theme'], subtree: true });
    });
    const html = page.locator('html');

    await page.goto('/en/');
    await expect(html).toHaveAttribute('data-theme', 'light');

    const dark = page.getByRole('button', { name: 'Dark' });
    await dark.click();
    await expect(html).toHaveAttribute('data-theme', 'dark');
    await expect(dark).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(18, 19, 22)');
    expect(await page.evaluate(() => localStorage.getItem('theme'))).toBe('dark');

    await page.reload();
    const log = await page.evaluate(() => window.__themeLog);
    // Первая установка темы — до появления контента, и тема ни разу не была другой.
    expect(log[0]).toEqual({ theme: 'dark', h1InDom: false });
    expect(log.every((e) => e.theme === 'dark')).toBe(true);

    await page.getByRole('button', { name: 'System' }).click();
    await expect(html).toHaveAttribute('data-theme', 'light');
    expect(errors).toEqual([]);
  });

  test.describe('тёмная ОС', () => {
    test.use({ colorScheme: 'dark' });

    test('system → dark', async ({ page }) => {
      await page.goto('/ru/');
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    });
  });
});

test('LocaleSwitch ведёт на ту же страницу в другой локали и сохраняет тему', async ({ page }) => {
  const errors = collectErrors(page);
  const html = page.locator('html');
  await page.goto('/en/');
  await page.getByRole('button', { name: 'Dark' }).click();

  await page.getByRole('link', { name: 'Русский' }).click();
  await expect(page).toHaveURL('/ru/');
  await expect(html).toHaveAttribute('lang', 'ru');
  await expect(page.locator('h1')).toHaveText('Главная страница');
  await expect(html).toHaveAttribute('data-theme', 'dark');

  await page.getByRole('link', { name: 'English' }).click();
  await expect(page).toHaveURL('/en/');
  await expect(html).toHaveAttribute('lang', 'en');
  expect(errors).toEqual([]);
});

import { expect, test } from '@playwright/test';

import { collectErrors, switchLocale } from './helpers';

const PATH = (locale: string) => `/${locale}/work/supply-leader/`;

for (const [locale, title, ogLocale] of [
  ['en', 'Marketplace for suppliers from Amazon and Walmart', 'en_US'],
  ['ru', 'Маркетплейс поставщиков Amazon и Walmart', 'ru_RU'],
] as const) {
  test(`кейс Supply Leader /${locale}/: заголовок, секции, картинки, метаданные`, async ({
    page,
  }) => {
    const errors = collectErrors(page);
    await page.goto(PATH(locale));

    await expect(page.locator('html')).toHaveAttribute('lang', locale);
    await expect(page.locator('h1')).toHaveText(title);
    // 4 текстовые секции + 3 decision + заголовок CTA.
    await expect(page.locator('main article h2')).toHaveCount(8);
    await expect(page.locator('main article table tbody tr')).toHaveCount(4);
    await expect(page.locator('main article h3')).toHaveCount(2);

    // Все картинки кейса загружаются (lazy — прокручиваем каждую в зону видимости).
    const images = page.locator('main article img');
    await expect(images).toHaveCount(1 + 3 + 3 + 3);
    for (const img of await images.all()) {
      await img.scrollIntoViewIfNeeded();
      await expect(img).toHaveJSProperty('complete', true);
      expect(await img.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(0);
      expect(await img.getAttribute('alt')).toBeTruthy();
    }

    const meta = (p: string) => page.locator(`meta[property="${p}"]`);
    await expect(meta('og:title')).toHaveAttribute('content', title);
    await expect(meta('og:locale')).toHaveAttribute('content', ogLocale);
    await expect(meta('og:image')).toHaveAttribute('content', /\/og\/supply-leader\.jpg$/);
    await expect(page.locator('link[rel="alternate"][hreflang="ru"]')).toHaveAttribute(
      'href',
      /\/ru\/work\/supply-leader\/$/,
    );
    await expect(page).toHaveTitle(new RegExp(`^${title} — `));

    await page.waitForLoadState('networkidle');
    expect(errors).toEqual([]);
  });
}

test('кейс: OG-картинка отдаётся', async ({ request }) => {
  const res = await request.get('/og/supply-leader.jpg');
  expect(res.status()).toBe(200);
  expect(res.headers()['content-type']).toContain('image/jpeg');
});

test('кейс: ряды картинок — сетка на tablet/desktop, лента на mobile', async ({
  page,
}, testInfo) => {
  await page.goto(PATH('en'));
  const row = page.getByRole('region', { name: /Images/ }).first();
  await row.scrollIntoViewIfNeeded();
  const scrollable = await row.evaluate((el) => el.scrollWidth > el.clientWidth);
  expect(scrollable).toBe(testInfo.project.name === 'mobile-390');
});

test('кейс: смена языка ведёт на тот же кейс', async ({ page }) => {
  await page.goto(PATH('en'));
  await switchLocale(page, 'Русский');
  await expect(page).toHaveURL(PATH('ru'));
  await expect(page.locator('h1')).toHaveText('Маркетплейс поставщиков Amazon и Walmart');
});

test('кейс: несуществующий slug — 404', async ({ page }) => {
  const res = await page.goto('/en/work/unknown/');
  expect(res?.status()).toBe(404);
});

const CASES = [
  {
    slug: 'supply-leader',
    en: 'Marketplace for suppliers from Amazon and Walmart',
    ru: 'Маркетплейс поставщиков Amazon и Walmart',
  },
  {
    slug: 'askezio',
    en: 'Designing a Quiz & Test-builder – from MVP to release',
    ru: 'Конструктор квизов и тестов — от MVP до релиза',
  },
] as const;

for (const item of CASES) {
  for (const locale of ['en', 'ru'] as const) {
    test(`кейс ${item.slug} /${locale}/: заголовок, видимые картинки, OG, нет ошибок`, async ({
      page,
    }) => {
      const errors = collectErrors(page);
      await page.goto(`/${locale}/work/${item.slug}/`);
      await expect(page.locator('html')).toHaveAttribute('lang', locale);
      await expect(page.locator('h1')).toHaveText(item[locale]);

      // На mobile и desktop видны разные наборы картинок — проверяем только видимые.
      const images = page.locator('main article img:visible');
      expect(await images.count()).toBeGreaterThan(0);
      for (const img of await images.all()) {
        await img.scrollIntoViewIfNeeded();
        await expect(img).toHaveJSProperty('complete', true);
        expect(await img.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(0);
        expect(await img.getAttribute('alt')).toBeTruthy();
      }

      await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
        'content',
        new RegExp(`/og/${item.slug}\\.jpg$`),
      );
      const og = await page.request.get(`/og/${item.slug}.jpg`);
      expect(og.status()).toBe(200);
      await page.waitForLoadState('networkidle');
      expect(errors).toEqual([]);
    });
  }
}

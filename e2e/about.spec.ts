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

// Позиция и размер текстового блока вступления до добавления фото ([x, y, ширина, высота]).
// Фото (или пустая ячейка вместо него) не должно его сдвигать.
const INTRO_TEXT: Record<string, Record<'en' | 'ru', number[]>> = {
  'desktop-1280': { en: [40, 249, 570, 376], ru: [40, 229, 570, 416] },
  'desktop-1920': { en: [360, 249, 570, 376], ru: [360, 229, 570, 416] },
};

for (const locale of ['en', 'ru'] as const) {
  test(`About /${locale}/: фото или зарезервированное место, текст на прежнем месте`, async ({
    page,
  }, testInfo) => {
    await page.goto(`/${locale}/about/`);
    await page.evaluate(() => document.fonts.ready);
    const intro = page.locator('main section').first();
    const text = intro.locator('> div').first();
    const photo = intro.getByRole('img');
    const hasPhoto = (await photo.count()) > 0;

    const expected = INTRO_TEXT[testInfo.project.name]?.[locale];
    if (expected) {
      const box = await text.boundingBox();
      expect([box!.x, box!.y, box!.width, box!.height].map(Math.round)).toEqual(expected);
      // Блок той же высоты, что в макете (590), с фото или без.
      expect((await intro.boundingBox())!.height).toBe(590);
    }

    // Серого плейсхолдера нет: последняя ячейка — либо картинка, либо пустая и прозрачная.
    const cell = intro.locator('> div').nth(1);
    if (hasPhoto) {
      await expect(photo).toBeVisible();
      await expect(photo).toHaveJSProperty('complete', true);
      expect(await photo.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
      await expect(photo).toHaveAttribute('loading', 'eager');
      await expect(photo).toHaveAttribute(
        'alt',
        locale === 'en' ? 'Anastasiia Shashkova' : 'Анастасия Шашкова',
      );
      await expect(photo).toHaveCSS('object-fit', 'cover');
      await expect(cell).toHaveCSS('border-radius', '8px');
    } else if (await cell.isVisible()) {
      await expect(cell).toHaveAttribute('aria-hidden', 'true');
      await expect(cell).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
      await expect(cell).toHaveCSS('border-style', 'none');
      await expect(cell).toHaveCSS('box-shadow', 'none');
    }

    // mobile: после текста — фото через 16 или ничего (только нижний pad 80 блока).
    if (testInfo.project.name === 'mobile-390') {
      const textBottom = (await text.boundingBox())!.y + (await text.boundingBox())!.height;
      const introBox = (await intro.boundingBox())!;
      if (hasPhoto) {
        const photoBox = (await cell.boundingBox())!;
        expect(Math.round(photoBox.y - textBottom)).toBe(16);
        expect(Math.round(photoBox.width)).toBe(370);
        expect(Math.round(introBox.y + introBox.height - (photoBox.y + photoBox.height))).toBe(80);
      } else {
        await expect(cell).toBeHidden();
        expect(Math.round(introBox.y + introBox.height - textBottom)).toBe(80);
      }
    }
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

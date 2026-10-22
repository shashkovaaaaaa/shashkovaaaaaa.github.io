import { expect, test } from '@playwright/test';

import {
  collectErrors,
  isMobileHeader,
  menuToggle,
  openMenuIfMobile,
  setTheme,
  switchLocale,
} from './helpers';

declare global {
  interface Window {
    __themeLog: { theme: string | null; contentInDom: boolean }[];
  }
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

for (const [locale, title, projects, cta] of [
  ['en', 'Hello, I’m Nastya.', 'Projects, but with the details', 'Let’s discuss your next idea'],
  ['ru', 'Привет, я Настя.', 'Проекты — с подробностями', 'Обсудим вашу следующую идею'],
] as const) {
  test(`/${locale}/: lang, тексты, шрифт, нет ошибок`, async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto(`/${locale}/`);

    await expect(page.locator('html')).toHaveAttribute('lang', locale);
    await expect(page.locator('h1')).toHaveText(title);
    await expect(page.getByRole('heading', { level: 2 })).toHaveText([projects, cta]);
    await expect(page.locator('footer p')).toHaveCount(2);
    const font = await page.locator('body').evaluate((b) => getComputedStyle(b).fontFamily);
    expect(font).toMatch(/Inter/);

    // Прокручиваем до конца, чтобы подгрузились lazy-обложки — 404 попадут в errors.
    await page.locator('footer').scrollIntoViewIfNeeded();
    await page.waitForLoadState('networkidle');
    expect(errors).toEqual([]);
  });
}

test.describe('главная', () => {
  test('hero и якорь проектов', async ({ page }) => {
    await page.goto('/en/');
    await expect(page.locator('section[aria-labelledby="hero-title"] h1')).toBeVisible();
    await expect(page.locator('section#works h2')).toBeVisible();
  });

  test('карточки проектов: ссылки на кейсы, обложки, без What’s next', async ({ page }) => {
    await page.goto('/en/');
    const cards = page.locator('#works article');
    await expect(cards).toHaveCount(3);

    const hrefs = await cards
      .getByRole('link')
      .evaluateAll((as) => as.map((a) => a.getAttribute('href')));
    expect(hrefs).toEqual([
      '/en/work/prokladovki/',
      '/en/work/askezio/',
      '/en/work/supply-leader/',
    ]);

    // В каждой карточке видна ровно одна обложка (desktop/tablet 5:4 или mobile 1:1), и она загрузилась.
    for (const card of await cards.all()) {
      await card.scrollIntoViewIfNeeded();
      const visible = card.locator('img:visible');
      await expect(visible).toHaveCount(1);
      await expect(visible).toHaveJSProperty('complete', true);
      expect(await visible.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(
        0,
      );
    }

    // v3: заглушка убрана на всех брейкпоинтах.
    await expect(page.getByText('What’s next...')).toHaveCount(0);
  });

  test('на 1920 три карточки в один ряд', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop-1920', 'только макет 1920');
    await page.goto('/en/');
    const tops = await page
      .locator('#works article')
      .evaluateAll((els) => els.map((el) => Math.round(el.getBoundingClientRect().top)));
    expect(new Set(tops).size).toBe(1);
  });

  test('клик по карточке ведёт на страницу кейса', async ({ page }) => {
    await page.goto('/en/');
    // Supply Leader — третья карточка; в макете у неё нет прототипной ссылки (CLAUDE.md, «Нестыковки»).
    const card = page.locator('#works article').nth(2);
    await card.scrollIntoViewIfNeeded();
    // Кликаем мышью по центру превью: ссылка заголовка растянута на всю карточку через ::after.
    const box = await card.locator('img:visible').boundingBox();
    if (!box) throw new Error('нет обложки');
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    await expect(page).toHaveURL('/en/work/supply-leader/');
    await expect(page.locator('h1')).toHaveText(
      'Marketplace for suppliers from Amazon and Walmart',
    );
  });
});

test.describe('хедер', () => {
  test('нужный вариант хедера для вьюпорта', async ({ page }, testInfo) => {
    await page.goto('/en/');
    const desktop = testInfo.project.name.startsWith('desktop');
    const nav = page.getByRole('navigation', { name: 'Main navigation' });

    await expect(nav).toBeVisible({ visible: desktop });
    await expect(menuToggle(page)).toBeVisible({ visible: !desktop });
    if (desktop) {
      await expect(nav.getByRole('link', { name: 'My works' })).toHaveAttribute(
        'href',
        '/en/#works',
      );
    }
  });

  test('мобильное меню: открытие, Esc, клик снаружи', async ({ page }) => {
    await page.goto('/en/');
    test.skip(!(await isMobileHeader(page)), 'на десктопе меню нет');
    const toggle = menuToggle(page);
    const menu = page.locator(`#${await toggle.getAttribute('aria-controls')}`);
    const menuLink = menu.getByRole('link', { name: 'Telegram' });

    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(menuLink).toBeHidden();

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(toggle).toHaveAccessibleName('Close menu');
    await expect(menuLink).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(toggle).toBeFocused();
    await expect(menuLink).toBeHidden();

    await toggle.click();
    await page.mouse.click(5, 700);
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });
});

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
            contentInDom: !!document.querySelector('header'),
          });
        }
      }).observe(document, { attributes: true, attributeFilter: ['data-theme'], subtree: true });
    });
    const html = page.locator('html');

    await page.goto('/en/');
    await expect(html).toHaveAttribute('data-theme', 'light');

    await setTheme(page, 'dark');
    await expect(html).toHaveAttribute('data-theme', 'dark');
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(18, 19, 22)');
    expect(await page.evaluate(() => localStorage.getItem('theme'))).toBe('dark');

    await page.reload();
    const log = await page.evaluate(() => window.__themeLog);
    // Первая установка темы — до появления контента, и тема ни разу не была другой.
    expect(log[0]).toEqual({ theme: 'dark', contentInDom: false });
    expect(log.every((e) => e.theme === 'dark')).toBe(true);

    await setTheme(page, 'light');
    await expect(html).toHaveAttribute('data-theme', 'light');
    expect(errors).toEqual([]);
  });

  test.describe('тёмная ОС', () => {
    test.use({ colorScheme: 'dark' });

    test('без выбора — тема из системы, и она подсвечена в switch', async ({ page }) => {
      await page.goto('/ru/');
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
      await openMenuIfMobile(page);
      await expect(page.getByRole('radio', { name: 'Тёмная' })).toHaveAttribute(
        'aria-checked',
        'true',
      );
      await expect(page.getByRole('radio', { name: 'Светлая' })).toHaveAttribute(
        'aria-checked',
        'false',
      );
    });
  });

  test('switch темы: стрелки переключают и переносят фокус', async ({ page }) => {
    await page.goto('/en/');
    await openMenuIfMobile(page);
    const light = page.getByRole('radio', { name: 'Light' });
    const dark = page.getByRole('radio', { name: 'Dark' });
    await light.focus();
    await page.keyboard.press('ArrowRight');
    await expect(dark).toBeFocused();
    await expect(dark).toHaveAttribute('aria-checked', 'true');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await page.keyboard.press('ArrowLeft');
    await expect(light).toHaveAttribute('aria-checked', 'true');
  });
});

test('LocaleSwitch ведёт на ту же страницу в другой локали и сохраняет тему', async ({ page }) => {
  const errors = collectErrors(page);
  const html = page.locator('html');
  await page.goto('/en/');
  await setTheme(page, 'dark');

  await switchLocale(page, 'Русский');
  await expect(page).toHaveURL('/ru/');
  await expect(html).toHaveAttribute('lang', 'ru');
  await expect(page.locator('h1')).toHaveText('Привет, я Настя.');
  await expect(html).toHaveAttribute('data-theme', 'dark');
  if (await isMobileHeader(page)) {
    // Меню закрывается после перехода.
    await expect(menuToggle(page)).toHaveAttribute('aria-expanded', 'false');
  }

  await switchLocale(page, 'English');
  await expect(page).toHaveURL('/en/');
  await expect(html).toHaveAttribute('lang', 'en');
  expect(errors).toEqual([]);
});

test.describe('hover карточки', () => {
  test('лёгкий zoom превью', async ({ page }) => {
    await page.goto('/en/');
    const card = page.locator('#works article').first();
    await card.scrollIntoViewIfNeeded();
    await card.hover();
    await expect(card.locator('img:visible')).toHaveCSS('scale', '1.03');
  });

  test.describe('prefers-reduced-motion', () => {
    test.use({ contextOptions: { reducedMotion: 'reduce' } });

    test('без zoom', async ({ page }) => {
      await page.goto('/en/');
      const card = page.locator('#works article').first();
      await card.scrollIntoViewIfNeeded();
      await card.hover();
      await expect(card.locator('img:visible')).toHaveCSS('scale', 'none');
    });
  });
});

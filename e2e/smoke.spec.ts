import { expect, test, type Page } from '@playwright/test';

declare global {
  interface Window {
    __themeLog: { theme: string | null; contentInDom: boolean }[];
  }
}

type ThemeName = 'light' | 'dark' | 'system';

function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('response', (r) => r.status() >= 400 && errors.push(`${r.status()} ${r.url()}`));
  return errors;
}

const menuToggle = (page: Page) => page.getByRole('button', { name: /^(Open|Close) menu$|меню$/ });

// На 390/768 тема и язык — в мобильном меню, на 1280 — прямо в хедере.
async function isMobileHeader(page: Page) {
  return menuToggle(page).isVisible();
}

async function openMenuIfMobile(page: Page) {
  if (!(await isMobileHeader(page))) return;
  const toggle = menuToggle(page);
  if ((await toggle.getAttribute('aria-expanded')) !== 'true') await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
}

async function setTheme(page: Page, theme: ThemeName) {
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

async function switchLocale(page: Page, name: 'English' | 'Русский') {
  await openMenuIfMobile(page);
  await page.getByRole('link', { name }).click();
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

for (const [locale, title, cta] of [
  ['en', 'Home page', 'Let’s discuss your next idea'],
  ['ru', 'Главная страница', 'Обсудим вашу следующую идею'],
] as const) {
  test(`/${locale}/: lang, тексты, шрифт, нет ошибок`, async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto(`/${locale}/`);

    await expect(page.locator('html')).toHaveAttribute('lang', locale);
    await expect(page.locator('h1')).toHaveText(title);
    await expect(page.getByRole('heading', { level: 2 })).toHaveText(cta);
    await expect(page.locator('footer p')).toHaveCount(2);
    const font = await page.locator('body').evaluate((b) => getComputedStyle(b).fontFamily);
    expect(font).toMatch(/Inter/);
    expect(errors).toEqual([]);
  });
}

test.describe('хедер', () => {
  test('нужный вариант хедера для вьюпорта', async ({ page }, testInfo) => {
    await page.goto('/en/');
    const desktop = testInfo.project.name === 'desktop-1280';
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
    const menuLink = page.getByRole('link', { name: 'Behance' });

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

    await setTheme(page, 'system');
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
  await setTheme(page, 'dark');

  await switchLocale(page, 'Русский');
  await expect(page).toHaveURL('/ru/');
  await expect(html).toHaveAttribute('lang', 'ru');
  await expect(page.locator('h1')).toHaveText('Главная страница');
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

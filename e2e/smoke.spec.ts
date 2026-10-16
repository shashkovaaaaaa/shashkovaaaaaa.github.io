import { expect, test, type Page } from '@playwright/test';

declare global {
  interface Window {
    __themeLog: { theme: string | null; contentInDom: boolean }[];
  }
}

type ThemeName = 'light' | 'dark' | 'system';

// TODO: убрать, когда появятся страницы кейсов. Сейчас Next prefetch-ит ссылки карточек
// на /work/<slug>/ и получает 404 — это ожидаемо.
const PENDING_ROUTES = /\/work\//;

function collectErrors(page: Page) {
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
  test('якоря hero и проектов, ссылки из хедера', async ({ page }) => {
    await page.goto('/en/');
    await expect(page.locator('section#about h1')).toBeVisible();
    await expect(page.locator('section#works h2')).toBeVisible();
  });

  test('карточки проектов: ссылки на кейсы, обложки, What’s next только на desktop', async ({
    page,
  }, testInfo) => {
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

    const desktop = testInfo.project.name === 'desktop-1280';
    await expect(page.getByText('What’s next...')).toBeVisible({ visible: desktop });
  });

  test('клик по карточке ведёт на страницу кейса', async ({ page }) => {
    await page.goto('/en/');
    const card = page.locator('#works article').first();
    await card.scrollIntoViewIfNeeded();
    // Кликаем мышью по центру превью: ссылка заголовка растянута на всю карточку через ::after.
    const box = await card.locator('img:visible').boundingBox();
    if (!box) throw new Error('нет обложки');
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    await expect(page).toHaveURL('/en/work/prokladovki/');
  });
});

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

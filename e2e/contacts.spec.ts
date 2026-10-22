import { expect, test, type Locator, type Page } from '@playwright/test';

import { collectErrors, isMobileHeader, menuToggle, openMenuIfMobile } from './helpers';

// design/CHANGES-v3.md, п. 5: реальные контакты, резюме на языке локали.
for (const [locale, name, file, fileName] of [
  ['en', 'Resume', '/resume-en.pdf', 'Anastasiia-Shashkova-CV-EN.pdf'],
  ['ru', 'Резюме', '/resume-ru.pdf', 'Anastasiia-Shashkova-CV-RU.pdf'],
] as const) {
  test(`Resume на /${locale}/ скачивает ${file}`, async ({ page }) => {
    await page.goto(`/${locale}/`);
    // На desktop — иконка в хедере, на tablet/mobile — пункт мобильного меню.
    await openMenuIfMobile(page);
    const link = page.getByRole('link', { name, exact: true });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('href', file);
    await expect(link).toHaveAttribute('download', fileName);
    // Скачивается, а не открывается в новой вкладке.
    await expect(link).not.toHaveAttribute('target');

    const [download] = await Promise.all([page.waitForEvent('download'), link.click()]);
    expect(download.suggestedFilename()).toBe(fileName);
    expect(download.url()).toMatch(new RegExp(`${file.replace('.', '\\.')}$`));
    expect(await download.failure()).toBeNull();

    const res = await page.request.get(file);
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toContain('application/pdf');
  });
}

test('CTA: Email, Telegram и WhatsApp с реальными адресами', async ({ page }) => {
  await page.goto('/en/');
  const cta = page.locator('section[aria-labelledby="cta-title"]');
  await expect(cta.getByRole('link')).toHaveText(['Email', 'Telegram', 'WhatsApp']);
  await expect(cta.getByRole('link', { name: 'Email' })).toHaveAttribute(
    'href',
    'mailto:st.shashkova@yandex.ru',
  );
  await expect(cta.getByRole('link', { name: 'Telegram' })).toHaveAttribute(
    'href',
    'https://t.me/shashkovaaaaaa',
  );
  await expect(cta.getByRole('link', { name: 'WhatsApp' })).toHaveAttribute(
    'href',
    'https://wa.me/79111151400',
  );
});

test('хедер/меню: Telegram и Email с реальными адресами', async ({ page }) => {
  await page.goto('/en/');
  await openMenuIfMobile(page);
  const header = page.locator('header');
  await expect(header.getByRole('link', { name: 'Telegram' })).toHaveAttribute(
    'href',
    'https://t.me/shashkovaaaaaa',
  );
  await expect(header.getByRole('link', { name: 'Email' })).toHaveAttribute(
    'href',
    'mailto:st.shashkova@yandex.ru',
  );
});

// Email: href без локали/basePath/target/download; клик копирует адрес и показывает тост.
const MAILTO = 'mailto:st.shashkova@yandex.ru';
const ADDRESS = 'st.shashkova@yandex.ru';

for (const path of ['/en/', '/ru/', '/en/about/', '/ru/work/askezio/']) {
  test(`Email на ${path}: href ровно mailto во всех трёх местах`, async ({ page }) => {
    await page.goto(path);
    await page.waitForLoadState('networkidle'); // после гидратации
    // Хедер (иконка), мобильное меню, CTA — в DOM на любой ширине.
    const links = page.locator('a[href^="mailto:"]');
    await expect(links).toHaveCount(3);
    for (const link of await links.all()) {
      await expect(link).toHaveAttribute('href', MAILTO);
      await expect(link).not.toHaveAttribute('target');
      await expect(link).not.toHaveAttribute('download');
    }
  });
}

test.describe('Email: копирование адреса и тост', () => {
  test.use({ permissions: ['clipboard-read', 'clipboard-write'] });

  async function clickAndExpectToast(page: Page, link: Locator, text: string) {
    await page.evaluate(() => navigator.clipboard.writeText(''));
    await link.click();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(ADDRESS);
    const toast = page.getByRole('status').filter({ hasText: text });
    await expect(toast).toBeVisible();
    return toast;
  }

  test('CTA: копирует, тост на 2 с (en)', async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto('/en/');
    const cta = page.locator('section[aria-labelledby="cta-title"]');
    const toast = await clickAndExpectToast(
      page,
      cta.getByRole('link', { name: 'Email' }),
      'Email copied',
    );
    // Исчезает примерно через 2 с.
    await page.waitForTimeout(1500);
    await expect(toast).toBeVisible();
    await expect(toast).toBeHidden({ timeout: 1500 });
    expect(errors).toEqual([]);
  });

  test('хедер (desktop) или мобильное меню: копирует, тост (ru)', async ({ page }) => {
    await page.goto('/ru/');
    if (await isMobileHeader(page)) {
      await openMenuIfMobile(page);
      const menu = page.locator(`#${await menuToggle(page).getAttribute('aria-controls')}`);
      await clickAndExpectToast(
        page,
        menu.getByRole('link', { name: 'Email' }),
        'Почта скопирована',
      );
    } else {
      const icon = page.locator('header').getByRole('link', { name: 'Email' });
      // Подсказка у иконки — сам адрес.
      await expect(icon).toHaveAttribute('title', ADDRESS);
      await clickAndExpectToast(page, icon, 'Почта скопирована');
    }
  });

  test('без Clipboard API тоста нет и ничего не ломается', async ({ page }) => {
    const errors = collectErrors(page);
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'clipboard', { value: undefined });
    });
    await page.goto('/en/');
    const cta = page.locator('section[aria-labelledby="cta-title"]');
    await cta.getByRole('link', { name: 'Email' }).click();
    await page.waitForTimeout(300);
    await expect(page.getByRole('status').filter({ hasText: 'Email copied' })).toHaveCount(0);
    expect(errors).toEqual([]);
  });
});

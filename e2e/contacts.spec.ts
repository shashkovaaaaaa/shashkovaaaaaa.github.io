import { expect, test } from '@playwright/test';

import { openMenuIfMobile } from './helpers';

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

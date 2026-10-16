import { expect, test, type Page } from '@playwright/test';

// В dev React пишет в консоль предупреждения, которых нет в prod-сборке
// (например, «Encountered a script tag» при клиентском рендере <script>).
function collectConsole(page: Page) {
  const messages: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error' || m.type() === 'warning') messages.push(`[${m.type()}] ${m.text()}`);
  });
  page.on('pageerror', (e) => messages.push(`[pageerror] ${e.message}`));
  return messages;
}

const menuToggle = (page: Page) => page.getByRole('button', { name: /^(Open|Close) menu$|меню$/ });

async function openMenuIfMobile(page: Page) {
  const toggle = menuToggle(page);
  if (!(await toggle.isVisible())) return;
  if ((await toggle.getAttribute('aria-expanded')) !== 'true') await toggle.click();
}

test('dev: нет ошибок и предупреждений в консоли при загрузке, смене темы и языка', async ({
  page,
}) => {
  const messages = collectConsole(page);

  await page.goto('/');
  await expect(page).toHaveURL(/\/(en|ru)\/$/);

  await page.goto('/en/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', /light|dark/);

  // Смена языка перемонтирует [locale]/layout на клиенте — именно тут раньше падал скрипт темы.
  await openMenuIfMobile(page);
  await page.getByRole('link', { name: 'Русский' }).click();
  await expect(page).toHaveURL('/ru/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'ru');

  await openMenuIfMobile(page);
  await page.getByRole('link', { name: 'English' }).click();
  await expect(page).toHaveURL('/en/');

  await openMenuIfMobile(page);
  await page.getByRole('radio', { name: 'Dark' }).click();
  await page.reload();
  await expect(page.locator('h1')).toBeAttached();

  // About: клиентские Accordion и Switch, переход через ссылку из хедера/меню.
  await openMenuIfMobile(page);
  await page.getByRole('link', { name: 'About me' }).click();
  await expect(page).toHaveURL('/en/about/');
  await page.getByRole('button', { name: 'Achievements' }).nth(1).click();
  await openMenuIfMobile(page);
  await page.getByRole('link', { name: 'Русский' }).click();
  await expect(page).toHaveURL('/ru/about/');

  expect(messages).toEqual([]);
});

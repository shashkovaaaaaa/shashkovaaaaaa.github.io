import { defineConfig } from '@playwright/test';

const PORT = 4310;

// Браузеры Playwright не скачиваем — используем системный Chromium.
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ?? '/usr/bin/chromium-browser';

export default defineConfig({
  testDir: './e2e',
  // e2e/dev — только для `pnpm test:e2e:dev` (playwright.dev.config.ts).
  testIgnore: ['dev/**'],
  outputDir: './e2e/.results',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list']],
  use: {
    baseURL: `http://localhost:${PORT}`,
    launchOptions: { executablePath },
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'mobile-390', use: { viewport: { width: 390, height: 844 } } },
    { name: 'tablet-768', use: { viewport: { width: 768, height: 1024 } } },
    { name: 'desktop-1280', use: { viewport: { width: 1280, height: 800 } } },
  ],
  // Тестируем собранную статику: перед запуском нужен `pnpm build`.
  webServer: {
    command: `pnpm exec serve out -l ${PORT} --no-port-switching`,
    url: `http://localhost:${PORT}/en/`,
    reuseExistingServer: !process.env.CI,
  },
});

import { defineConfig } from '@playwright/test';

import baseConfig from './playwright.config';

// Проверки, которые имеют смысл только в `next dev` (dev-предупреждения React в консоли).
// Второй `next dev` в той же папке не запускается, поэтому переиспользуем уже запущенный на :3000.
const PORT = 3000;

export default defineConfig({
  ...baseConfig,
  testDir: './e2e/dev',
  testIgnore: [],
  use: { ...baseConfig.use, baseURL: `http://localhost:${PORT}` },
  // Первая компиляция страниц в dev небыстрая.
  timeout: 60_000,
  webServer: {
    command: `pnpm dev --port ${PORT}`,
    url: `http://localhost:${PORT}/en/`,
    reuseExistingServer: true,
    timeout: 120_000,
  },
});

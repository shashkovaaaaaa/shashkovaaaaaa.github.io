# Портфолио Анастасии Шашковой

Статический сайт-портфолио на Next.js 16 (App Router, `output: 'export'`) с двумя языками (EN/RU) и светлой/тёмной темой.

Контекст проекта, стек и правила — в [CLAUDE.md](./CLAUDE.md). Макет в текстовом виде — в `design/`.

## Требования

- Node.js 24 (см. `.nvmrc`; минимум — 22)
- pnpm (версия закреплена в `packageManager`, ставится через corepack)

```bash
nvm use
corepack enable
pnpm install
```

## Команды

| Команда                             | Что делает                                                                                                                                                             |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm dev`                          | Дев-сервер на http://localhost:3000 (корень `/` редиректит на `/en/` или `/ru/`)                                                                                       |
| `pnpm build`                        | Статическая сборка в `out/`: `next build` → оптимизация картинок (`next-image-export-optimizer`) → удаление lossless-исходников из `out/` (`scripts/prune-export.mjs`) |
| `pnpm start`                        | Раздать собранный `out/` локально (http://localhost:3000)                                                                                                              |
| `pnpm lint`                         | ESLint, предупреждения считаются ошибками                                                                                                                              |
| `pnpm typecheck`                    | Генерация типов маршрутов (`next typegen`) + `tsc --noEmit`                                                                                                            |
| `pnpm format` / `pnpm format:check` | Prettier: отформатировать / проверить                                                                                                                                  |
| `pnpm images`                       | Пережать картинки из `design/images` (локально, не в git) в `public/images` по манифесту в `scripts/prepare-images.mjs`                                                |
| `pnpm test:e2e`                     | Playwright-тесты по собранному `out/` на 390/768/1280 (сначала `pnpm build`)                                                                                           |
| `pnpm test:e2e:dev`                 | Проверка консоли в `next dev` (dev-предупреждения React); переиспользует запущенный `pnpm dev` на :3000                                                                |

E2E-тесты используют системный Chromium (`/usr/bin/chromium-browser`, путь можно переопределить через `PLAYWRIGHT_CHROMIUM_EXECUTABLE`), браузеры Playwright не скачиваются.

На pre-commit husky запускает lint-staged (ESLint + Prettier по изменённым файлам).

## Структура

```
src/
  app/
    layout.tsx            # подключает глобальные стили
    page.tsx              # "/" → клиентский редирект на /en/ или /ru/ по navigator.language
    [locale]/layout.tsx   # <html lang>, шрифт Inter, ThemeProvider (своя реализация, `components/theme/`), NextIntlClientProvider
    [locale]/page.tsx     # главная
  components/             # ThemeToggle, LocaleSwitch, ...; case/ — секции кейсов
  config/contacts.ts      # контакты и файлы резюме по локалям
  content/cases/          # MDX кейсов
  i18n/                   # routing, request, navigation (next-intl)
  messages/en.json, ru.json
  styles/tokens.css, globals.css
public/images/            # исходники картинок для оптимизатора
```

## i18n

- Локали `en` (по умолчанию) и `ru`, обе с префиксом: `/en/`, `/ru/`.
- Middleware нет (в static export его не бывает): страницы генерируются через `generateStaticParams`, а корень `/` выбирает язык на клиенте.
- Строки интерфейса — в `src/messages/*.json`; ключи типизированы по `en.json` (`src/global.d.ts`).

## Картинки

Исходники макета — в `design/images/` (локально, не в git). Уменьшенные копии без потерь (не шире 2× от макета, WebP lossless) делает `pnpm images` по манифесту `scripts/prepare-images.mjs`:

- картинки страниц кейсов (строковый путь в MDX, компонент `CaseImage`) — в `public/images/cases/<slug>/`;
- картинки со статическим импортом (обложки карточек, аватар) — в `src/assets/images/`.

Сжатие с потерями — только при `pnpm build` (`next-image-export-optimizer`, качество 85, ширины до 2400). Затем `scripts/prune-export.mjs` удаляет из `out/` lossless-исходники, так что на хостинг уезжают только WebP-варианты.
При деплое в подпапку (GitHub Pages) `basePath` передаётся в `ExportedImage` из `NEXT_PUBLIC_BASE_PATH` (уже сделано в `CaseImage`, `ProjectCard`, `Header`).

## Деплой

Обе площадки получают одну и ту же статическую сборку из `out/`. Отличается только `NEXT_PUBLIC_BASE_PATH`.

### Vercel (основной)

#### Перед первым деплоем

1. Проверить контакты в `src/config/contacts.ts` (Email, Telegram, WhatsApp). Пустое поле скрывает кнопку.
   - Resume: `public/resume-en.pdf` и `public/resume-ru.pdf`, кнопка скачивает файл на языке страницы (без префикса локали, с учётом `basePath`).
2. Прогнать проверки локально:
   ```bash
   pnpm install --frozen-lockfile
   pnpm lint && pnpm typecheck && pnpm build && pnpm test:e2e
   ```
3. Запушить `main` в GitHub.

#### Создание проекта

1. [vercel.com/new](https://vercel.com/new) → **Import Git Repository** → выбрать репозиторий.
2. **Framework Preset**: Next.js — определится сам. Root Directory — корень репозитория.
3. **Build and Output Settings** — оставить по умолчанию:
   - Install Command: `pnpm install` (pnpm определяется по `pnpm-lock.yaml`);
   - Build Command: `pnpm build` (это `next build && next-image-export-optimizer`);
   - Output Directory: не трогать — при `output: 'export'` Vercel сам берёт `out/`.
4. **Environment Variables** (Production и Preview):
   - `ENABLE_EXPERIMENTAL_COREPACK=1` — Vercel возьмёт pnpm ровно той версии, что в `packageManager` (12.14.0);
   - `NEXT_PUBLIC_BASE_PATH` — **не задавать** (сайт в корне домена);
   - `NEXT_PUBLIC_SITE_URL` — только для своего домена, например `https://example.com`. Без неё адрес для Open Graph, canonical и hreflang берётся из системной переменной Vercel `VERCEL_PROJECT_PRODUCTION_URL`.
5. **Deploy**. Затем **Settings → General → Node.js Version: 24.x** (если Vercel выбрал другую) и **Redeploy**.

#### Проверка после деплоя

- `/` перенаправляет на `/en/` или `/ru/` по языку браузера.
- Открываются `/en/about/`, `/en/work/supply-leader/`, `/en/work/askezio/`, `/en/work/prokladovki/` и их `/ru/`-версии.
- Переключатели темы и языка работают; после перезагрузки тема не мигает.
- В превью ссылки (Telegram, Slack и т.п.) у кейса подтягивается картинка из `/og/<slug>.jpg` с домена Vercel.
- Контакты в хедере и CTA ведут на реальные адреса, Resume на `/en/` скачивает `resume-en.pdf`, на `/ru/` — `resume-ru.pdf`.

#### Свой домен

Settings → Domains → добавить домен и прописать DNS по подсказке Vercel. Затем задать `NEXT_PUBLIC_SITE_URL=https://<домен>` и сделать Redeploy, чтобы абсолютные ссылки в метаданных указывали на домен.

#### Что попадает на хостинг

Только статика из `out/` (~16 МБ): HTML, `_next/static`, оптимизированные WebP (`nextImageExportOptimizer/`), OG-картинки. Серверных функций нет. Lossless-исходники в `out/` не попадают — их удаляет `scripts/prune-export.mjs`.

### GitHub Pages (запасной)

1. В репозитории: Settings → Pages → Source: **GitHub Actions**.
2. Пуш в `main` (или ручной запуск) запускает `.github/workflows/deploy.yml`:
   `pnpm install` → `pnpm build` c `NEXT_PUBLIC_BASE_PATH=/<имя репозитория>` и `NEXT_PUBLIC_SITE_URL=https://<owner>.github.io` → `upload-pages-artifact` (`out/`) → `deploy-pages`.
3. Сайт будет доступен по `https://<user>.github.io/<repo>/`.

`public/.nojekyll` нужен, чтобы Pages отдавал папку `_next/`.
Если репозиторий называется `<user>.github.io` или подключён свой домен, в workflow `NEXT_PUBLIC_BASE_PATH` нужно сделать пустым.

Проверить сборку под Pages локально:

```bash
NEXT_PUBLIC_BASE_PATH=/repo-name pnpm build
```

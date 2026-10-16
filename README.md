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

| Команда                             | Что делает                                                                         |
| ----------------------------------- | ---------------------------------------------------------------------------------- |
| `pnpm dev`                          | Дев-сервер на http://localhost:3000 (корень `/` редиректит на `/en/` или `/ru/`)   |
| `pnpm build`                        | Статическая сборка в `out/` + оптимизация картинок (`next-image-export-optimizer`) |
| `pnpm start`                        | Раздать собранный `out/` локально (http://localhost:3000)                          |
| `pnpm lint`                         | ESLint, предупреждения считаются ошибками                                          |
| `pnpm typecheck`                    | Генерация типов маршрутов (`next typegen`) + `tsc --noEmit`                        |
| `pnpm format` / `pnpm format:check` | Prettier: отформатировать / проверить                                              |
| `pnpm test:e2e`                     | Playwright-тесты по собранному `out/` на 390/768/1280 (сначала `pnpm build`)       |

E2E-тесты используют системный Chromium (`/usr/bin/chromium-browser`, путь можно переопределить через `PLAYWRIGHT_CHROMIUM_EXECUTABLE`), браузеры Playwright не скачиваются.

На pre-commit husky запускает lint-staged (ESLint + Prettier по изменённым файлам).

## Структура

```
src/
  app/
    layout.tsx            # подключает глобальные стили
    page.tsx              # "/" → клиентский редирект на /en/ или /ru/ по navigator.language
    [locale]/layout.tsx   # <html lang>, шрифт Inter, ThemeProvider, NextIntlClientProvider
    [locale]/page.tsx     # главная
  components/             # ThemeToggle, LocaleSwitch, ...; case/ — секции кейсов
  config/contacts.ts      # ссылки на контакты (пока TODO)
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

Класть в `public/images/` и использовать компонент `ExportedImage` из `next-image-export-optimizer`. WebP-варианты и `srcset` генерируются на `pnpm build`.
При деплое в подпапку (GitHub Pages) передавайте `basePath={process.env.NEXT_PUBLIC_BASE_PATH}` в `ExportedImage`.

## Деплой

Обе площадки получают одну и ту же статическую сборку из `out/`. Отличается только `NEXT_PUBLIC_BASE_PATH`.

### Vercel (основной)

Импортировать репозиторий в Vercel — настройки по умолчанию подходят:

- Framework Preset: **Next.js** (определяется автоматически, `output: 'export'` Vercel понимает сам)
- Install Command: `pnpm install` (pnpm определяется по `pnpm-lock.yaml` и `packageManager`)
- Build Command: `pnpm build`
- Node.js: 24 (из `engines`/`.nvmrc`; при необходимости выставить в Project Settings → General)
- `NEXT_PUBLIC_BASE_PATH` **не задавать** (сайт в корне домена)

### GitHub Pages (запасной)

1. В репозитории: Settings → Pages → Source: **GitHub Actions**.
2. Пуш в `main` (или ручной запуск) запускает `.github/workflows/deploy.yml`:
   `pnpm install` → `pnpm build` c `NEXT_PUBLIC_BASE_PATH=/<имя репозитория>` → `upload-pages-artifact` (`out/`) → `deploy-pages`.
3. Сайт будет доступен по `https://<user>.github.io/<repo>/`.

`public/.nojekyll` нужен, чтобы Pages отдавал папку `_next/`.
Если репозиторий называется `<user>.github.io` или подключён свой домен, в workflow `NEXT_PUBLIC_BASE_PATH` нужно сделать пустым.

Проверить сборку под Pages локально:

```bash
NEXT_PUBLIC_BASE_PATH=/repo-name pnpm build
```

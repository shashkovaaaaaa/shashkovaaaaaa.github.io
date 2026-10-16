'use client';

import { useSyncExternalStore } from 'react';

import { themeInitScript } from './themeStore';

const noopSubscribe = () => () => {};

// Скрипт нужен только при загрузке HTML. На сервере и при гидратации рендерим его (разметка совпадает),
// при клиентском монтировании (например, смена локали перемонтирует [locale]/layout) — нет:
// иначе React в dev ругается «Encountered a script tag», а выполнять его там и не нужно.
export function ThemeScript() {
  const fromServerHtml = useSyncExternalStore(
    noopSubscribe,
    () => false,
    () => true,
  );

  if (!fromServerHtml) return null;
  return <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />;
}

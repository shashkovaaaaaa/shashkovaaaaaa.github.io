'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';

import styles from './EmailCopyToast.module.css';

const VISIBLE_MS = 2000;

/*
 * Запасной сценарий для mailto: если почтового клиента нет, клик по ссылке ничего не делает.
 * Ловим клики по любым a[href^="mailto:"] (хедер, мобильное меню, CTA): переход не отменяем,
 * дополнительно копируем адрес в буфер и показываем тост на 2 с. Без Clipboard API — ничего не делаем.
 */
export function EmailCopyToast() {
  const t = useTranslations('Contacts');
  const [visible, setVisible] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const link = (e.target as Element | null)?.closest?.('a[href^="mailto:"]');
      if (!link || !navigator.clipboard?.writeText) return;
      const address = decodeURIComponent(link.getAttribute('href')!.slice(7).split('?')[0]);
      navigator.clipboard.writeText(address).then(
        () => {
          clearTimeout(timer.current);
          setVisible(true);
          timer.current = setTimeout(() => setVisible(false), VISIBLE_MS);
        },
        // Нет разрешения или фокуса — тихо пропускаем, mailto сработает как обычно.
        () => {},
      );
    };
    document.addEventListener('click', onClick);
    return () => {
      document.removeEventListener('click', onClick);
      clearTimeout(timer.current);
    };
  }, []);

  // Регион aria-live есть в DOM всегда, чтобы скринридер объявил появившийся текст.
  return (
    <div className={styles.region} role="status" aria-live="polite">
      {visible && <p className={styles.toast}>{t('emailCopied')}</p>}
    </div>
  );
}

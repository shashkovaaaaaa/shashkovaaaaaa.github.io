'use client';

import { useTranslations } from 'next-intl';
import { useLayoutEffect, useRef, useState } from 'react';

import { Badge } from './Badge';
import styles from './BadgeRow.module.css';

const GAP = 4;

/*
 * Бейджи карточки в одну строку: сколько влезает по ширине, остальные сворачиваются
 * в бейдж «ещё N» (в подсказке при наведении — скрытые ключевые слова).
 * Все бейджи остаются в разметке: не влезшие спрятаны, но продолжают измеряться,
 * поэтому при изменении ширины карточки строка пересчитывается.
 */
export function BadgeRow({ items }: { items: string[] }) {
  const t = useTranslations('HomePage.projects');
  const listRef = useRef<HTMLUListElement>(null);
  const moreRef = useRef<HTMLLIElement>(null);
  const [visible, setVisible] = useState(items.length);

  useLayoutEffect(() => {
    const list = listRef.current;
    const more = moreRef.current;
    if (!list || !more) return;

    const measure = () => {
      const available = list.clientWidth;
      const widths = [...list.querySelectorAll<HTMLElement>('[data-badge]')].map(
        (el) => el.offsetWidth,
      );
      const moreWidth = more.offsetWidth;

      let used = 0;
      let count = 0;
      for (let i = 0; i < widths.length; i++) {
        const next = used + (i > 0 ? GAP : 0) + widths[i];
        const isLast = i === widths.length - 1;
        // Если после этого бейджа ещё что-то останется — нужно место под «ещё N».
        const reserve = isLast ? 0 : GAP + moreWidth;
        if (next + reserve > available) break;
        used = next;
        count = i + 1;
      }
      setVisible(count);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    // Ширина бейджей меняется, когда догружается шрифт.
    void document.fonts?.ready.then(measure);
    return () => observer.disconnect();
    // visible — текст «ещё N» меняет ширину, после пересчёта меряем ещё раз.
  }, [items, visible]);

  const hidden = items.slice(visible);

  return (
    <ul ref={listRef} className={styles.row}>
      {items.map((item, i) => (
        <li key={item} data-badge className={i >= visible ? styles.hidden : undefined}>
          <Badge>{item}</Badge>
        </li>
      ))}
      {/* Ширина «ещё N» меряется по самому длинному варианту — по числу всех бейджей. */}
      <li
        ref={moreRef}
        className={hidden.length > 0 ? undefined : styles.hidden}
        title={hidden.join(', ')}
      >
        <Badge>{t('moreBadges', { count: hidden.length || items.length })}</Badge>
      </li>
    </ul>
  );
}

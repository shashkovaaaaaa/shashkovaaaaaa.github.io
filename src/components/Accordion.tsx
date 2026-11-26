'use client';

import { useId, useState, type ReactNode } from 'react';

import buttonStyles from './Button.module.css';
import { IconChevronDown } from './icons';
import styles from './Accordion.module.css';

type AccordionItemProps = {
  // Шапка строки (логотип, название, подпись) — всегда видна.
  header: ReactNode;
  // Текст кнопки-переключателя («Achievements») и её aria-label. На mobile виден только шеврон.
  toggleLabel: string;
  defaultOpen?: boolean;
  children: ReactNode;
};

/*
 * design/components.md → experience: open=off / open=on.
 * Кнопка — type=link с шевроном (icon-chevron-down / -up), aria-expanded + aria-controls.
 * Раскрытие — 200ms через grid-template-rows; prefers-reduced-motion гасит transition глобально.
 * Кликабельна вся строка (логотип, название, должность), а не только кнопка. С клавиатуры
 * и для скринридеров переключатель — по-прежнему кнопка: её клик всплывает до строки.
 */
export function AccordionItem({
  header,
  toggleLabel,
  defaultOpen = false,
  children,
}: AccordionItemProps) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  const toggle = () => {
    // Выделяли текст в строке (например, копировали название) — не сворачиваем/разворачиваем.
    if (window.getSelection()?.toString()) return;
    setOpen((v) => !v);
  };

  return (
    <div className={styles.item} data-open={open}>
      <div className={styles.row} onClick={toggle}>
        <div className={styles.header}>{header}</div>
        <button
          type="button"
          className={`${buttonStyles.button} ${buttonStyles.link} ${styles.toggle}`}
          aria-expanded={open}
          aria-controls={panelId}
          aria-label={toggleLabel}
        >
          <span className={styles.toggleLabel}>{toggleLabel}</span>
          {/* 18×18: кнопка 136×42, как в макете */}
          <IconChevronDown size={18} className={styles.chevron} />
        </button>
      </div>
      <div id={panelId} className={styles.panel} inert={!open}>
        <div className={styles.panelInner}>{children}</div>
      </div>
    </div>
  );
}

export function Accordion({ children }: { children: ReactNode }) {
  return <div className={styles.accordion}>{children}</div>;
}

'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useId, useRef, useState, type MouseEvent, type ReactNode } from 'react';

import { getContactLinks, headerContacts } from '@/config/contacts';
import { mainNav } from '@/config/navigation';

import { ButtonLink } from './Button';
import { LocaleSwitch } from './LocaleSwitch';
import styles from './MobileMenu.module.css';

type MenuItemProps = {
  href: string;
  download?: string;
  children: ReactNode;
};

// Пункт меню: страница, внешняя ссылка или файл — всегда один и тот же стиль (.item).
function MenuItem({ href, download, children }: MenuItemProps) {
  return (
    <li>
      <ButtonLink href={href} download={download} className={styles.item}>
        {children}
      </ButtonLink>
    </li>
  );
}

export function MobileMenu({ className }: { className?: string }) {
  const t = useTranslations('MobileMenu');
  const tNav = useTranslations('Nav');
  const tContacts = useTranslations('Contacts');
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [open]);

  // Любой переход по ссылке из меню закрывает его.
  const onMenuClick = (e: MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('a')) setOpen(false);
  };

  return (
    <div ref={rootRef} className={className}>
      <button
        ref={buttonRef}
        type="button"
        className={styles.toggle}
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={open ? t('close') : t('open')}
        // Если кнопка уже в фокусе с клавиатуры (Tab, Esc), Chrome держит :focus-visible и после тапа.
        // Снимаем фокус: тап сфокусирует её заново — как указатель, без обводки.
        onPointerDown={(e) => {
          if (document.activeElement === e.currentTarget) e.currentTarget.blur();
        }}
        onClick={() => setOpen((v) => !v)}
      >
        <span className={styles.burger} data-open={open} aria-hidden>
          <span />
          <span />
          <span />
        </span>
      </button>

      <div id={menuId} className={styles.menu} data-open={open} inert={!open} onClick={onMenuClick}>
        <p className={styles.title}>{t('portfolio')}</p>
        <ul className={styles.list}>
          {mainNav.map(({ key, href }) => (
            <MenuItem key={key} href={href}>
              {tNav(key)}
            </MenuItem>
          ))}
        </ul>

        <p className={styles.title}>{t('contacts')}</p>
        <ul className={styles.list}>
          {getContactLinks(headerContacts, locale).map(({ key, href, download }) => (
            <MenuItem key={key} href={href} download={download}>
              {tContacts(key)}
            </MenuItem>
          ))}
        </ul>

        {/* Переключатель темы убран из хедера и меню (ThemeToggle остался в коде). Тёмная тема
            выключена (DARK_THEME_ENABLED в themeStore), всем показываем светлую. */}
        <div className={styles.switches}>
          <LocaleSwitch />
        </div>
      </div>
    </div>
  );
}

'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useId, useRef, useState, type MouseEvent } from 'react';

import { getContactLinks, headerContacts } from '@/config/contacts';
import { mainNav } from '@/config/navigation';

import { ButtonLink } from './Button';
import { LocaleSwitch } from './LocaleSwitch';
import { ThemeToggle } from './ThemeToggle';
import styles from './MobileMenu.module.css';

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
            <li key={key}>
              <ButtonLink href={href} className={styles.item}>
                {tNav(key)}
              </ButtonLink>
            </li>
          ))}
        </ul>

        <p className={styles.title}>{t('contacts')}</p>
        <ul className={styles.list}>
          {getContactLinks(headerContacts, locale).map(({ key, href, download }) => (
            <li key={key}>
              <ButtonLink href={href} download={download} className={styles.item}>
                {tContacts(key)}
              </ButtonLink>
            </li>
          ))}
        </ul>

        {/* v2: вместо секции Settings — ряд из двух switch (тема, язык). В v3 дизайнер убрал
            switch темы, но владелец сайта решил его оставить. */}
        <div className={styles.switches}>
          <ThemeToggle />
          <LocaleSwitch />
        </div>
      </div>
    </div>
  );
}

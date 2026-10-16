import type { ReactNode } from 'react';

import styles from './Badge.module.css';

type BadgeProps = {
  // card — на карточках главной (на mobile выше), case — на страницах кейсов. Цвета в v2 одинаковые.
  variant?: 'card' | 'case';
  children: ReactNode;
};

export function Badge({ variant = 'card', children }: BadgeProps) {
  return (
    <span className={[styles.badge, styles[variant]].filter(Boolean).join(' ')}>{children}</span>
  );
}

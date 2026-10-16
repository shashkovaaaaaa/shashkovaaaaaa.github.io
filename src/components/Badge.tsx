import type { ReactNode } from 'react';

import styles from './Badge.module.css';

type BadgeProps = {
  // card — на карточках главной, case — на страницах кейсов (другой фон).
  variant?: 'card' | 'case';
  children: ReactNode;
};

export function Badge({ variant = 'card', children }: BadgeProps) {
  return <span className={`${styles.badge} ${styles[variant]}`}>{children}</span>;
}

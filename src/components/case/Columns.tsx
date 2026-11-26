import type { ReactNode } from 'react';

import shared from './case.module.css';
import styles from './Columns.module.css';

// learnings / columns: две колонки (row gap 40), на mobile — друг под другом.
export function Columns({ children }: { children: ReactNode }) {
  return <div className={styles.columns}>{children}</div>;
}

type ColumnProps = {
  title: string;
  // Списки с точками-маркерами (Prokladovki: Business Goals, User Goals). По умолчанию — без маркеров.
  bullets?: boolean;
  children: ReactNode;
};

export function Column({ title, bullets = false, children }: ColumnProps) {
  return (
    // data-column: отдельный подраздел внутри TextSection (Prokladovki: Audience, Goals…) — ширина 800, свои отступы.
    <div className={styles.column} data-column>
      <h3 className={styles.title}>{title}</h3>
      <div className={`${shared.prose} ${styles.body} ${bullets ? shared.bullets : ''}`}>
        {children}
      </div>
    </div>
  );
}

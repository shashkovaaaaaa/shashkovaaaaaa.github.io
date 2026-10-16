import type { ReactNode } from 'react';

import shared from './case.module.css';
import styles from './Columns.module.css';

// learnings / columns: две колонки (row gap 40), на mobile — друг под другом.
export function Columns({ children }: { children: ReactNode }) {
  return <div className={styles.columns}>{children}</div>;
}

type ColumnProps = {
  title: string;
  children: ReactNode;
};

export function Column({ title, children }: ColumnProps) {
  return (
    <div className={styles.column}>
      <h3 className={styles.title}>{title}</h3>
      <div className={`${shared.prose} ${styles.body}`}>{children}</div>
    </div>
  );
}

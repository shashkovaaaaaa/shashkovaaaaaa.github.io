import type { ReactNode } from 'react';

import styles from './Callout.module.css';

type CalloutProps = {
  title: string;
  children: ReactNode;
};

// Prokladovki → reflection: серый блок (surface/surface-images), radius 8, подпись text-third, крупный текст.
export function Callout({ title, children }: CalloutProps) {
  return (
    <section className={styles.callout}>
      <h2 className={styles.title}>{title}</h2>
      <div className={styles.body}>{children}</div>
    </section>
  );
}

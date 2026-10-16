import type { ReactNode } from 'react';

import shared from './case.module.css';
import styles from './TextSection.module.css';

type TextSectionProps = {
  title: string;
  // loose — gap 40 между заголовком и содержимым (секция с таблицей), по умолчанию 30.
  spacing?: 'default' | 'loose';
  children: ReactNode;
};

// H3 40 + текст шириной 800 (desktop). Внутри — markdown из MDX и другие блоки (Table, Columns).
export function TextSection({ title, spacing = 'default', children }: TextSectionProps) {
  return (
    <section className={`${styles.section} ${spacing === 'loose' ? styles.loose : ''}`}>
      <h2 className={shared.sectionTitle}>{title}</h2>
      <div className={`${shared.prose} ${styles.body}`}>{children}</div>
    </section>
  );
}

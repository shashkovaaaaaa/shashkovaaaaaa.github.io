import { Badge } from '../Badge';
import styles from './BadgeList.module.css';

type BadgeListProps = {
  items: string[];
  // row — бейджи в строку с переносом (первый экран, метрики); column — столбиком (факты в Approach).
  direction?: 'row' | 'column';
};

// badges group: gap 4, бейджи type=case.
export function BadgeList({ items, direction = 'row' }: BadgeListProps) {
  return (
    // data-badge-list: чтобы стили markdown-списков в тексте кейса (case.module.css → .prose) его не трогали.
    <ul className={`${styles.list} ${styles[direction]}`} data-badge-list>
      {items.map((item) => (
        <li key={item}>
          <Badge variant="case">{item}</Badge>
        </li>
      ))}
    </ul>
  );
}

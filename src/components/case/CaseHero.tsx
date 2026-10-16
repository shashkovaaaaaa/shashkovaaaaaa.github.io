import { Badge } from '../Badge';
import { CaseImage } from './CaseImage';
import styles from './CaseHero.module.css';

type CaseHeroProps = {
  title: string;
  badges: string[];
  image: string;
  alt: string;
};

// design/pages/work-*-desktop.md → first screen / hero block
export function CaseHero({ title, badges, image, alt }: CaseHeroProps) {
  return (
    <header className={styles.hero}>
      <h1 className={styles.title}>{title}</h1>
      <ul className={styles.badges}>
        {badges.map((badge) => (
          <li key={badge}>
            <Badge variant="case">{badge}</Badge>
          </li>
        ))}
      </ul>
      <CaseImage
        src={image}
        alt={alt}
        ratio="2 / 1"
        sizes="(min-width: 1200px) 1200px, (min-width: 768px) calc(100vw - 40px), calc(100vw - 20px)"
      />
    </header>
  );
}

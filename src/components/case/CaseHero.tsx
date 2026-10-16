import { BadgeList } from './BadgeList';
import styles from './CaseHero.module.css';
import { ImageRow, type CaseImageItem } from './ImageRow';

type CaseHeroProps = {
  title: string;
  badges: string[];
} & (
  | // Одна большая картинка 2:1 (Supply Leader, Prokladovki); на mobile можно дать свой квадратный кроп.
    { image: string; alt: string; mobileImage?: string; images?: never }
    // Несколько квадратов в ряд (Askezio: 2 × 592).
  | { images: CaseImageItem[]; image?: never; alt?: never; mobileImage?: never }
);

// design/pages/work-*-desktop.md → first screen / hero block
export function CaseHero(props: CaseHeroProps) {
  const { title, badges } = props;

  return (
    <header className={styles.hero}>
      <h1 className={styles.title}>{title}</h1>
      <BadgeList items={badges} />
      {props.images ? (
        <ImageRow images={props.images} eager />
      ) : (
        <ImageRow
          images={[{ src: props.image, alt: props.alt }]}
          ratio="2 / 1"
          mobileImages={
            props.mobileImage ? [{ src: props.mobileImage, alt: props.alt }] : undefined
          }
          mobileRatio="1"
          eager
        />
      )}
    </header>
  );
}

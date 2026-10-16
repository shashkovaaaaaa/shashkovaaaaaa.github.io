import { useLocale, useTranslations } from 'next-intl';

import { experience } from '@/content/experience';

import { Accordion, AccordionItem } from '../Accordion';
import styles from './Experience.module.css';

// design/pages/about-desktop.md → experience block: заголовок head-3 по центру, аккордеон 800.
export function Experience() {
  const t = useTranslations('About');
  const locale = useLocale();

  return (
    <section className={styles.experience} aria-labelledby="experience-title">
      <h2 id="experience-title" className={styles.title}>
        {t('experience')}
      </h2>
      <Accordion>
        {experience.map((item, index) => (
          <AccordionItem
            key={item.id}
            toggleLabel={t('achievements')}
            // В макете раскрыт первый пункт (Askezio).
            defaultOpen={index === 0}
            header={
              <div className={styles.head}>
                {/* TODO: SVG логотипа от дизайнера; пока плитка с первой буквой. */}
                <span className={styles.logo} aria-hidden>
                  {item.letter}
                </span>
                <div className={styles.text}>
                  <h3 className={styles.company}>{item.company[locale]}</h3>
                  <p className={styles.meta}>
                    <span>{item.position[locale]},</span> <span>{item.period}</span>
                  </p>
                </div>
              </div>
            }
          >
            <ul className={styles.achievements}>
              {item.achievements[locale].map((text) => (
                <li key={text}>{text}</li>
              ))}
            </ul>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}

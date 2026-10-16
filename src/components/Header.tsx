import ExportedImage from 'next-image-export-optimizer';
import { useTranslations } from 'next-intl';

import { contacts, headerContacts } from '@/config/contacts';
import { mainNav } from '@/config/navigation';
import { Link } from '@/i18n/navigation';

import { ButtonLink } from './Button';
import { LocaleSwitch } from './LocaleSwitch';
import { MobileMenu } from './MobileMenu';
import { ThemeToggle } from './ThemeToggle';
import styles from './Header.module.css';

import avatar from '../../public/images/avatar.jpg';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export function Header() {
  const t = useTranslations('Header');
  const tNav = useTranslations('Nav');
  const tContacts = useTranslations('Contacts');

  return (
    <header className={styles.header}>
      <div className={styles.bar}>
        <Link href="/" className={styles.account} aria-label={`${t('name')} — ${t('home')}`}>
          <ExportedImage
            src={avatar}
            alt=""
            width={40}
            height={40}
            placeholder="empty"
            loading="eager"
            basePath={basePath}
            className={styles.avatar}
          />
          <span className={styles.accountText}>
            <span className={styles.name}>{t('name')}</span>
            <span className={styles.role}>{t('role')}</span>
          </span>
        </Link>

        <nav className={styles.nav} aria-label={t('nav')}>
          {mainNav.map(({ key, href }) => (
            <ButtonLink key={key} href={href}>
              {tNav(key)}
            </ButtonLink>
          ))}
        </nav>

        <div className={styles.contacts}>
          <ul className={styles.contactList} aria-label={t('contacts')}>
            {headerContacts.map((key) => (
              <li key={key}>
                <ButtonLink href={contacts[key]}>{tContacts(key)}</ButtonLink>
              </li>
            ))}
          </ul>
          <span className={styles.divider} aria-hidden />
          <ThemeToggle variant="icon" />
          <LocaleSwitch variant="compact" />
        </div>

        <MobileMenu className={styles.mobileMenu} />
      </div>
    </header>
  );
}

import ExportedImage from 'next-image-export-optimizer';
import { useLocale, useTranslations } from 'next-intl';

import { emailAddress, getContactLinks, headerContacts } from '@/config/contacts';
import { mainNav } from '@/config/navigation';
import { Link } from '@/i18n/navigation';

import { ButtonLink } from './Button';
import buttonStyles from './Button.module.css';
import { IconFile, IconMail, IconTelegram } from './icons';
import { HeaderShell } from './HeaderShell';
import { LocaleSwitch } from './LocaleSwitch';
import { MobileMenu } from './MobileMenu';
import styles from './Header.module.css';

import avatar from '@/assets/images/avatar.webp';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

// design/icons: кнопки-иконки контактов в десктопном хедере.
const contactIcons = { telegram: IconTelegram, email: IconMail, resume: IconFile };

export function Header() {
  const t = useTranslations('Header');
  const tNav = useTranslations('Nav');
  const tContacts = useTranslations('Contacts');
  const locale = useLocale();

  return (
    <HeaderShell className={styles.header}>
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
            {getContactLinks(headerContacts, locale).map(({ key, href, download }) => {
              const Icon = contactIcons[key];
              return (
                <li key={key}>
                  <ButtonLink
                    href={href}
                    download={download}
                    className={buttonStyles.icon}
                    aria-label={tContacts(key)}
                    // У почты подсказка — сам адрес.
                    title={key === 'email' ? emailAddress : tContacts(key)}
                  >
                    <Icon />
                  </ButtonLink>
                </li>
              );
            })}
          </ul>
          <LocaleSwitch />
        </div>

        <MobileMenu className={styles.mobileMenu} />
      </div>
    </HeaderShell>
  );
}

import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';

import { isExternal } from '@/config/contacts';
import { withBasePath } from '@/config/site';
import { Link } from '@/i18n/navigation';

import styles from './Button.module.css';

export type ButtonVariant = 'link' | 'outline';

type CommonProps = {
  variant?: ButtonVariant;
  className?: string;
  children: ReactNode;
};

function classNames(variant: ButtonVariant, className?: string) {
  return [styles.button, styles[variant], className].filter(Boolean).join(' ');
}

type ButtonProps = CommonProps & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'>;

export function Button({ variant = 'link', className, type = 'button', ...rest }: ButtonProps) {
  return <button type={type} className={classNames(variant, className)} {...rest} />;
}

type ButtonLinkProps = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'className' | 'href'> & {
    href: string;
  };

// Файл из public/ (`/resume.pdf`): без префикса локали, но с basePath, в новой вкладке.
const isAsset = (href: string) => href.startsWith('/') && /\.[a-z0-9]+$/i.test(href);

// Внутренние страницы (`/...`) — через Link с префиксом локали, остальные — обычный <a>.
export function ButtonLink({ variant = 'link', className, href, ...rest }: ButtonLinkProps) {
  const cls = classNames(variant, className);

  if (isAsset(href)) {
    return <a href={withBasePath(href)} className={cls} target="_blank" rel="noopener" {...rest} />;
  }

  if (href.startsWith('/')) {
    return <Link href={href} className={cls} {...rest} />;
  }

  const externalProps = isExternal(href) ? { target: '_blank', rel: 'noopener noreferrer' } : {};
  return <a href={href} className={cls} {...externalProps} {...rest} />;
}

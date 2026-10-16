import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';

import { isExternal } from '@/config/contacts';
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

// Внутренние пути (`/...`) — через Link с префиксом локали, остальные — обычный <a>.
export function ButtonLink({ variant = 'link', className, href, ...rest }: ButtonLinkProps) {
  const cls = classNames(variant, className);

  if (href.startsWith('/')) {
    return <Link href={href} className={cls} {...rest} />;
  }

  const externalProps = isExternal(href) ? { target: '_blank', rel: 'noopener noreferrer' } : {};
  return <a href={href} className={cls} {...externalProps} {...rest} />;
}

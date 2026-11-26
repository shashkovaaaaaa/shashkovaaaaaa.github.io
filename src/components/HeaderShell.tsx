'use client';

import { type ReactNode, useEffect, useRef, useState } from 'react';

// Сколько пикселей нужно прокрутить в одну сторону, чтобы хедер спрятался или появился:
// без этого порога он дёргается от мелких движений тачпада.
const SCROLL_DELTA = 8;

type HeaderShellProps = {
  className?: string;
  children: ReactNode;
};

// Липкий хедер: при прокрутке вниз уезжает вверх, при прокрутке вверх возвращается.
// Наверху страницы и при открытом мобильном меню виден всегда.
export function HeaderShell({ className, children }: HeaderShellProps) {
  const ref = useRef<HTMLElement>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;

    const update = () => {
      ticking = false;
      const y = Math.max(window.scrollY, 0);
      const header = ref.current;
      if (!header) return;

      const menuOpen = header.querySelector('[aria-expanded="true"]') !== null;
      // Пока не докрутили до контента под хедером — не прячем. Считаем по следующему блоку:
      // offsetTop самого sticky-хедера меняется, когда он прилипает.
      const contentTop =
        (header.nextElementSibling as HTMLElement | null)?.offsetTop ?? header.offsetHeight;
      const nearTop = y <= contentTop;

      if (menuOpen || nearTop) {
        setHidden(false);
        lastY = y;
        return;
      }

      const delta = y - lastY;
      if (Math.abs(delta) < SCROLL_DELTA) return;
      setHidden(delta > 0);
      lastY = y;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header ref={ref} className={className} data-hidden={hidden}>
      {children}
    </header>
  );
}

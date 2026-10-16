'use client';

import { useRef, type KeyboardEvent, type ReactNode } from 'react';

import styles from './Switch.module.css';

export type SwitchOption<T extends string> = {
  value: T;
  // Доступное имя (и tooltip) варианта: «Light», «Русский».
  label: string;
  // Видимое содержимое кнопки: иконка 18 или короткий текст («EN»).
  content: ReactNode;
};

type SwitchProps<T extends string> = {
  label: string;
  options: SwitchOption<T>[];
  // undefined — значение ещё неизвестно (до гидратации), ни один вариант не выбран.
  value: T | undefined;
  onChange: (value: T) => void;
  variant?: 'icon' | 'text';
};

/*
 * design/components.md → switch: подложка 74×38 (pad 2, gap 2, radius 10), кнопки 34×34 (radius 8).
 * Доступность: role="radiogroup" + aria-checked, стрелки влево/вправо переключают и переносят фокус.
 */
export function Switch<T extends string>({
  label,
  options,
  value,
  onChange,
  variant = 'text',
}: SwitchProps<T>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const checkedIndex = options.findIndex((o) => o.value === value);
  const focusIndex = checkedIndex === -1 ? 0 : checkedIndex;

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (!step) return;
    e.preventDefault();
    const next = (index + step + options.length) % options.length;
    onChange(options[next].value);
    refs.current[next]?.focus();
  };

  return (
    <div className={`${styles.switch} ${styles[variant]}`} role="radiogroup" aria-label={label}>
      {options.map((option, index) => (
        <button
          key={option.value}
          ref={(el) => {
            refs.current[index] = el;
          }}
          type="button"
          role="radio"
          aria-checked={index === checkedIndex}
          aria-label={variant === 'icon' ? option.label : undefined}
          title={option.label}
          tabIndex={index === focusIndex ? 0 : -1}
          className={styles.option}
          onClick={() => onChange(option.value)}
          onKeyDown={(e) => onKeyDown(e, index)}
        >
          {option.content}
        </button>
      ))}
    </div>
  );
}

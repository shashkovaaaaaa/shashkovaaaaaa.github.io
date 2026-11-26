'use client';

import { useEffect, useState } from 'react';

type LocalTimeProps = {
  // IANA-зона, например 'Asia/Bangkok' (Паттайя, GMT+7 без перехода на летнее время).
  timeZone: string;
  label: string;
};

function format(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).format(date);
}

// Живые часы с секундами. Сайт статический, поэтому время считается в браузере:
// до гидратации место под часы занято невидимой заглушкой той же ширины.
export function LocalTime({ timeZone, label }: LocalTimeProps) {
  const [now, setNow] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => setNow(format(new Date(), timeZone));
    tick();
    // Подстраиваемся под начало секунды, чтобы цифры менялись ровно, без «прыжков».
    let interval: ReturnType<typeof setInterval> | undefined;
    const timeout = setTimeout(
      () => {
        tick();
        interval = setInterval(tick, 1000);
      },
      1000 - (Date.now() % 1000),
    );
    return () => {
      clearTimeout(timeout);
      if (interval) clearInterval(interval);
    };
  }, [timeZone]);

  return (
    <time style={{ fontVariantNumeric: 'tabular-nums' }}>
      <span style={now ? undefined : { visibility: 'hidden' }}>{now ?? '00:00:00'}</span> ({label})
    </time>
  );
}
